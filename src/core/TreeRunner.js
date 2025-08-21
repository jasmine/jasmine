getJasmineRequireObj().TreeRunner = function(j$) {
  class TreeRunner {
    #executionTree;
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
              this.#executeSpec(node.spec, done);
            }
          }
        };
      });
    }

    #executeSpec(spec, done) {
      const config = this.#getConfig();
      spec.execute(
        this.#runQueueWithSkipPolicy.bind(this),
        this.#globalErrors,
        next => {
          this.#currentRunableTracker.setCurrentSpec(spec);
          this.#runableResources.initForRunable(spec.id, spec.parentSuiteId);
          this.#reportDispatcher.specStarted(spec.result).then(next);
        },
        (result, next) => {
          this.#specComplete(spec, result, next);
        },
        done,
        this.#executionTree.isExcluded(spec),
        config.failSpecWithNoExpectations,
        config.detectLateRejectionHandling
      );
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

    #specComplete(spec, result, next) {
      this.#runableResources.clearForRunable(spec.id);
      this.#currentRunableTracker.setCurrentSpec(null);

      if (result.status === 'failed') {
        this.#hasFailures = true;
      }

      this.#reportSpecDone(spec, result, next);
    }

    #reportSpecDone(spec, result, next) {
      spec.reportedDone = true;
      this.#reportDispatcher.specDone(result).then(next);
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
