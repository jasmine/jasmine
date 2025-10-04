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
        this.#executeSuite(this.#executionTree.topSuite, resolve);
      });
      return { hasFailures: this.#hasFailures };
    }

    #wrapNodes(nodes) {
      return nodes.map(node => {
        return {
          fn: done => {
            if (node.suite) {
              this.#executeSuite(node.suite, done);
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
        this.#reportDispatcher.specStarted(spec.startedEvent()).then(next);
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
          if (spec.status() === 'failed') {
            specOverallDone(new j$.private.StopExecutionError('spec failed'));
          } else {
            specOverallDone();
          }
        },
        userContext: spec.userContext(),
        runnableName: spec.getFullName.bind(spec),
        SkipPolicy: j$.private.CompleteOnFirstErrorSkipPolicy
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
          resultCallback(spec.doneEvent(), done);
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

    #executeSuite(suite, done) {
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
        : this.#executionTree.childrenOfSuite(suite);
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
          this.#suiteSegmentComplete(suite, () => {
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
      this.#reportDispatcher.suiteStarted(suite.startedEvent()).then(next);
      suite.startTimer();
    }

    #suiteSegmentComplete(suite, next) {
      suite.endTimer();
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

        if (suite.doneEvent().status === 'failed') {
          this.#hasFailures = true;
        }
      }

      const finish = isTopSuite
        ? next
        : () => this.#reportSuiteDone(suite, next);

      if (suite.hadBeforeAllFailure) {
        this.#reportChildrenOfBeforeAllFailure(suite).then(finish);
      } else {
        finish();
      }
    }

    #reportSuiteDone(suite, next) {
      suite.reportedDone = true;
      this.#reportDispatcher.suiteDone(suite.doneEvent()).then(next);
    }

    async #specComplete(spec) {
      this.#runableResources.clearForRunable(spec.id);
      this.#currentRunableTracker.setCurrentSpec(null);

      if (spec.status() === 'failed') {
        this.#hasFailures = true;
      }

      await this.#reportSpecDone(spec);
    }

    async #reportSpecDone(spec) {
      spec.reportedDone = true;
      await this.#reportDispatcher.specDone(spec.doneEvent());
    }

    async #reportChildrenOfBeforeAllFailure(suite) {
      for (const child of suite.children) {
        if (child instanceof j$.private.Suite) {
          await this.#reportDispatcher.suiteStarted(child.startedEvent());
          await this.#reportChildrenOfBeforeAllFailure(child);
          await this.#reportDispatcher.suiteDone(child.doneEvent());
        } else {
          /* a spec */
          await this.#reportDispatcher.specStarted(child.startedEvent());
          child.hadBeforeAllFailure();
          await this.#reportSpecDone(child);
        }
      }
    }

    #suiteSkipPolicy() {
      if (this.#getConfig().stopOnSpecFailure) {
        return j$.private.CompleteOnFirstErrorSkipPolicy;
      } else {
        return j$.private.SkipAfterBeforeAllErrorPolicy;
      }
    }
  }

  return TreeRunner;
};
