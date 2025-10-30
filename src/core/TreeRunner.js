getJasmineRequireObj().TreeRunner = function(j$) {
  class TreeRunner {
    #executionTree;
    #setTimeout;
    #globalErrors;
    #runableResources;
    #reportDispatcher;
    #runQueue;
    #getConfig;
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
      this.#currentRunableTracker = attrs.currentRunableTracker;
    }

    async execute() {
      this.#hasFailures = false;
      await new Promise(resolve => {
        this.#executeSuiteSegment(this.#executionTree.topSuite, 0, resolve);
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
        this.#runableResources.initForRunable(
          spec.id,
          spec.parentSuiteId || this.#executionTree.topSuite.id
        );
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

      this.#runQueue({
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
        runnableName: spec.getFullName.bind(spec),
        SkipPolicy: j$.CompleteOnFirstErrorSkipPolicy
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
        fns.push(this.#lateUnhandledRejectionChecker());
      }

      fns.push(complete);
      return fns;
    }

    #executeSuiteSegment(suite, segmentNumber, done) {
      const isTopSuite = suite === this.#executionTree.topSuite;
      const isExcluded = this.#executionTree.isExcluded(suite);
      let befores = [];
      let afters = [];

      if (suite.beforeAllFns.length > 0 && !isExcluded) {
        befores = [...suite.beforeAllFns];
        if (this.#getConfig().detectLateRejectionHandling) {
          befores.push(this.#lateUnhandledRejectionChecker());
        }
      }

      if (suite.afterAllFns.length > 0 && !isExcluded) {
        afters = [...suite.afterAllFns];
        if (this.#getConfig().detectLateRejectionHandling) {
          afters.push(this.#lateUnhandledRejectionChecker());
        }
      }

      const children = isTopSuite
        ? this.#executionTree.childrenOfTopSuite()
        : this.#executionTree.childrenOfSuiteSegment(suite, segmentNumber);
      const queueableFns = [
        ...befores,
        ...this.#wrapNodes(children),
        ...afters
      ];

      if (!isTopSuite) {
        queueableFns.unshift({
          fn: next => {
            this.#suiteSegmentStart(suite, next);
          }
        });
      }

      this.#runQueue({
        onComplete: maybeError => {
          this.#suiteSegmentComplete(suite, suite.getResult(), () => {
            done(maybeError);
          });
        },
        queueableFns,
        userContext: suite.sharedUserContext(),
        onException: function() {
          suite.handleException.apply(suite, arguments);
        },
        onMultipleDone: suite.onMultipleDone
          ? suite.onMultipleDone.bind(suite)
          : null,
        SkipPolicy: this.#suiteSkipPolicy()
      });
    }

    // Returns a queueable fn that reports any still-unhandled rejections in
    // cases where detectLateRejectionHandling is enabled. Should only be called
    // when detectLateRejectionHandling is enabled, because the setTimeout
    // imposes a significant performance penalty in suites with lots of fast
    // specs.
    #lateUnhandledRejectionChecker() {
      const globalErrors = this.#globalErrors;
      return {
        fn: done => {
          // setTimeout is necessary to trigger rejectionhandled events
          this.#setTimeout(function() {
            globalErrors.reportUnhandledRejections();
            done();
          });
        }
      };
    }

    #suiteSegmentStart(suite, next) {
      this.#currentRunableTracker.pushSuite(suite);
      this.#runableResources.initForRunable(suite.id, suite.parentSuite.id);
      this.#reportDispatcher.suiteStarted(suite.result).then(next);
      suite.startTimer();
    }

    #suiteSegmentComplete(suite, result, next) {
      const isTopSuite = suite === this.#executionTree.topSuite;

      if (!isTopSuite) {
        if (suite !== this.#currentRunableTracker.currentSuite()) {
          throw new Error('Tried to complete the wrong suite');
        }

        // suite.cleanupBeforeAfter() is conditional because calling it on the
        // top suite breaks parallel mode. The top suite is reentered every time
        // a runner runs another file, so its before and after fns need to be
        // preserved.
        suite.cleanupBeforeAfter();
        this.#runableResources.clearForRunable(suite.id);
        this.#currentRunableTracker.popSuite();

        if (result.status === 'failed') {
          this.#hasFailures = true;
        }
        suite.endTimer();
      }

      const finish = isTopSuite
        ? next
        : () => this.#reportSuiteDone(suite, result, next);

      if (suite.hadBeforeAllFailure) {
        this.#reportChildrenOfBeforeAllFailure(suite).then(finish);
      } else {
        finish();
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

    async #reportChildrenOfBeforeAllFailure(suite) {
      for (const child of suite.children) {
        if (child instanceof j$.Suite) {
          await this.#reportDispatcher.suiteStarted(child.result);
          await this.#reportChildrenOfBeforeAllFailure(child);

          // Marking the suite passed is consistent with how suites that
          // contain failed specs but no suite-level failures are reported.
          child.result.status = 'passed';

          await this.#reportDispatcher.suiteDone(child.result);
        } else {
          /* a spec */
          await this.#reportDispatcher.specStarted(child.result);

          child.addExpectationResult(
            false,
            {
              passed: false,
              message:
                'Not run because a beforeAll function failed. The ' +
                'beforeAll failure will be reported on the suite that ' +
                'caused it.'
            },
            true
          );
          child.result.status = 'failed';
          await this.#reportSpecDone(child);
        }
      }
    }

    #suiteSkipPolicy() {
      if (this.#getConfig().stopOnSpecFailure) {
        return j$.CompleteOnFirstErrorSkipPolicy;
      } else {
        return j$.SkipAfterBeforeAllErrorPolicy;
      }
    }
  }

  return TreeRunner;
};
