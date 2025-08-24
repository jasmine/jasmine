getJasmineRequireObj().TreeRunner = function(j$) {
  class TreeRunner {
    #executionTree;
    #setTimeout;
    #globalErrors;
    #runableResources;
    #reportDispatcher;
    #runQueue;
    #getConfig;
    #reportChildrenOfBeforeAllFailure;
    #currentRunableTracker;
    #hasFailures;

    constructor(attrs) {
      this.#executionTree = attrs.executionTree;
      this.#globalErrors = attrs.globalErrors;
      this.#setTimeout = attrs.setTimeout || setTimeout.bind(globalThis);
      this.#runableResources = attrs.runableResources;
      this.#reportDispatcher = attrs.reportDispatcher;
      this.#runQueue = attrs.runQueue;
      this.#getConfig = attrs.getConfig;
      this.#reportChildrenOfBeforeAllFailure =
        attrs.reportChildrenOfBeforeAllFailure;
      this.#currentRunableTracker = attrs.currentRunableTracker;
    }

    async execute() {
      this.#hasFailures = false;
      const topSuite = this.#executionTree.topSuite;
      const wrappedChildren = this.#wrapNodes(
        this.#executionTree.childrenOfTopSuite()
      );
      const queueableFns = this.#addBeforeAndAfterAlls(
        topSuite,
        wrappedChildren
      );

      await new Promise(resolve => {
        this.#runQueueWithSkipPolicy({
          queueableFns,
          userContext: this.#executionTree.topSuite.sharedUserContext(),
          onException: function() {
            topSuite.handleException.apply(topSuite, arguments);
          }.bind(this),
          onComplete: resolve,
          onMultipleDone: topSuite.onMultipleDone
            ? topSuite.onMultipleDone.bind(topSuite)
            : null
        });
      });

      return { hasFailures: this.#hasFailures };
    }

    #wrapNodes(nodes) {
      return nodes.map(node => {
        return {
          fn: done => {
            if (node.suite) {
              this.#executeSuiteSegment(node.suite, node.segmentNumber, done);
            } else {
              this._executeSpec(node.spec, done);
            }
          }
        };
      });
    }

    // Only exposed for testing.
    _executeSpec(spec, specOverallDone) {
      const onStart = next => {
        this.#currentRunableTracker.setCurrentSpec(spec);
        this.#runableResources.initForRunable(spec.id, spec.parentSuiteId);
        this.#reportDispatcher.specStarted(spec.result).then(next);
      };
      const resultCallback = (result, next) => {
        this.#specComplete(spec).then(next);
      };
      const queueableFns = this.#specQueueableFns(
        spec,
        onStart,
        resultCallback
      );

      this.#runQueueWithSkipPolicy({
        isLeaf: true,
        queueableFns,
        onException: e => spec.handleException(e),
        onMultipleDone: () => {
          // Issue an erorr. Include the context ourselves and pass
          // ignoreRunnable: true, since getting here always means that we've already
          // moved on and the current runnable isn't the one that caused the problem.
          spec.onLateError(
            new Error(
              'An asynchronous spec, beforeEach, or afterEach function called its ' +
                "'done' callback more than once.\n(in spec: " +
                spec.getFullName() +
                ')'
            )
          );
        },
        onComplete: () => {
          if (spec.result.status === 'failed') {
            specOverallDone(new j$.StopExecutionError('spec failed'));
          } else {
            specOverallDone();
          }
        },
        userContext: spec.userContext(),
        runnableName: spec.getFullName.bind(spec)
      });
    }

    #specQueueableFns(spec, onStart, resultCallback) {
      const config = this.#getConfig();
      const excluded = this.#executionTree.isExcluded(spec);
      const ba = spec.beforeAndAfterFns();
      let fns = [...ba.befores, spec.queueableFn, ...ba.afters];

      if (spec.markedPending || excluded === true) {
        fns = [];
      }

      const start = {
        fn(done) {
          spec.executionStarted();
          onStart(done);
        }
      };

      const complete = {
        fn(done) {
          spec.executionFinished(excluded, config.failSpecWithNoExpectations);
          resultCallback(spec.result, done);
        },
        type: 'specCleanup'
      };

      fns.unshift(start);

      if (config.detectLateRejectionHandling) {
        // Conditional because the setTimeout imposes a significant performance
        // penalty in suites with lots of fast specs.
        const globalErrors = this.#globalErrors;
        fns.push({
          fn: done => {
            // setTimeout is necessary to trigger rejectionhandled events
            // TODO: let clearStack know about this so it doesn't do redundant setTimeouts
            this.#setTimeout(function() {
              globalErrors.reportUnhandledRejections();
              done();
            });
          }
        });
      }

      fns.push(complete);
      return fns;
    }

    #executeSuiteSegment(suite, segmentNumber, done) {
      const wrappedChildren = this.#wrapNodes(
        this.#executionTree.childrenOfSuiteSegment(suite, segmentNumber)
      );
      const onStart = {
        fn: next => {
          this.#suiteSegmentStart(suite, next);
        }
      };
      const queueableFns = [
        onStart,
        ...this.#addBeforeAndAfterAlls(suite, wrappedChildren)
      ];

      this.#runQueueWithSkipPolicy({
        // TODO: if onComplete always takes 0-1 arguments (and it probably does)
        // then it can be switched to an arrow fn with a named arg.
        onComplete: function() {
          const args = Array.prototype.slice.call(arguments, [0]);
          this.#suiteSegmentComplete(suite, suite.getResult(), () => {
            done.apply(undefined, args);
          });
        }.bind(this),
        queueableFns,
        userContext: suite.sharedUserContext(),
        onException: function() {
          suite.handleException.apply(suite, arguments);
        },
        onMultipleDone: suite.onMultipleDone
          ? suite.onMultipleDone.bind(suite)
          : null
      });
    }

    #suiteSegmentStart(suite, next) {
      this.#currentRunableTracker.pushSuite(suite);
      this.#runableResources.initForRunable(suite.id, suite.parentSuite.id);
      this.#reportDispatcher.suiteStarted(suite.result).then(next);
      suite.startTimer();
    }

    #suiteSegmentComplete(suite, result, next) {
      suite.cleanupBeforeAfter();

      if (suite !== this.#currentRunableTracker.currentSuite()) {
        throw new Error('Tried to complete the wrong suite');
      }

      this.#runableResources.clearForRunable(suite.id);
      this.#currentRunableTracker.popSuite();

      if (result.status === 'failed') {
        this.#hasFailures = true;
      }
      suite.endTimer();

      if (suite.hadBeforeAllFailure) {
        this.#reportChildrenOfBeforeAllFailure(suite).then(() => {
          this.#reportSuiteDone(suite, result, next);
        });
      } else {
        this.#reportSuiteDone(suite, result, next);
      }
    }

    #reportSuiteDone(suite, result, next) {
      suite.reportedDone = true;
      this.#reportDispatcher.suiteDone(result).then(next);
    }

    async #specComplete(spec) {
      this.#runableResources.clearForRunable(spec.id);
      this.#currentRunableTracker.setCurrentSpec(null);

      if (spec.result.status === 'failed') {
        this.#hasFailures = true;
      }

      await this.#reportSpecDone(spec);
    }

    async #reportSpecDone(spec) {
      spec.reportedDone = true;
      await this.#reportDispatcher.specDone(spec.result);
    }

    #addBeforeAndAfterAlls(suite, wrappedChildren) {
      if (this.#executionTree.isExcluded(suite)) {
        return wrappedChildren;
      }

      return suite.beforeAllFns
        .concat(wrappedChildren)
        .concat(suite.afterAllFns);
    }

    #runQueueWithSkipPolicy(options) {
      if (options.isLeaf) {
        // A spec
        options.SkipPolicy = j$.CompleteOnFirstErrorSkipPolicy;
      } else {
        // A suite
        if (this.#getConfig().stopOnSpecFailure) {
          options.SkipPolicy = j$.CompleteOnFirstErrorSkipPolicy;
        } else {
          options.SkipPolicy = j$.SkipAfterBeforeAllErrorPolicy;
        }
      }

      return this.#runQueue(options);
    }
  }

  return TreeRunner;
};
