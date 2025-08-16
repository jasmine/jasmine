getJasmineRequireObj().Runner = function(j$) {
  class Runner {
    #topSuite;
    #getTotalSpecsDefined;
    #getFocusedRunables;
    #runableResources;
    #runQueue;
    #TreeProcessor;
    #executionTree;
    #globalErrors;
    #reportDispatcher;
    #getConfig;
    #reportSpecDone;
    #executedBefore;
    #currentlyExecutingSuites;

    constructor(options) {
      this.#topSuite = options.topSuite;
      this.#getTotalSpecsDefined = options.totalSpecsDefined;
      this.#getFocusedRunables = options.focusedRunables;
      this.#runableResources = options.runableResources;
      this.#runQueue = options.runQueue;
      this.#TreeProcessor = options.TreeProcessor;
      this.#globalErrors = options.globalErrors;
      this.#reportDispatcher = options.reportDispatcher;
      this.#getConfig = options.getConfig;
      this.#reportSpecDone = options.reportSpecDone;
      this.hasFailures = false;
      this.#executedBefore = false;

      this.#currentlyExecutingSuites = [];
      this.currentSpec = null;
    }

    currentRunable() {
      return this.currentSpec || this.currentSuite();
    }

    currentSuite() {
      return this.#currentlyExecutingSuites[
        this.#currentlyExecutingSuites.length - 1
      ];
    }

    parallelReset() {
      this.#executedBefore = false;
    }

    async execute(runablesToRun) {
      if (this.#executedBefore) {
        this.#topSuite.reset();
      }
      this.#executedBefore = true;

      this.hasFailures = false;
      const focusedRunables = this.#getFocusedRunables();
      const config = this.#getConfig();

      if (!runablesToRun) {
        if (focusedRunables.length) {
          runablesToRun = focusedRunables;
        } else {
          runablesToRun = [this.#topSuite.id];
        }
      }

      const order = new j$.Order({
        random: config.random,
        seed: j$.isNumber_(config.seed) ? config.seed + '' : config.seed
      });

      const treeProcessor = new this.#TreeProcessor({
        tree: this.#topSuite,
        runnableIds: runablesToRun,
        orderChildren: function(node) {
          return order.sort(node.children);
        },
        excludeNode: function(spec) {
          return !config.specFilter(spec);
        }
      });
      this.#executionTree = treeProcessor.processTree();

      return this.#execute2(runablesToRun, order);
    }

    async #execute2(runablesToRun, order) {
      const totalSpecsDefined = this.#getTotalSpecsDefined();

      this.#runableResources.initForRunable(this.#topSuite.id);
      const jasmineTimer = new j$.Timer();
      jasmineTimer.start();

      /**
       * Information passed to the {@link Reporter#jasmineStarted} event.
       * @typedef JasmineStartedInfo
       * @property {Int} totalSpecsDefined - The total number of specs defined in this suite. Note that this property is not present when Jasmine is run in parallel mode.
       * @property {Order} order - Information about the ordering (random or not) of this execution of the suite. Note that this property is not present when Jasmine is run in parallel mode.
       * @property {Boolean} parallel - Whether Jasmine is being run in parallel mode.
       * @since 2.0.0
       */
      await this.#reportDispatcher.jasmineStarted({
        // In parallel mode, the jasmineStarted event is separately dispatched
        // by jasmine-npm. This event only reaches reporters in non-parallel.
        totalSpecsDefined,
        order: order,
        parallel: false
      });

      this.#currentlyExecutingSuites.push(this.#topSuite);
      await this.#executeTopSuite();

      if (this.#topSuite.hadBeforeAllFailure) {
        await this.#reportChildrenOfBeforeAllFailure(this.#topSuite);
      }

      this.#runableResources.clearForRunable(this.#topSuite.id);
      this.#currentlyExecutingSuites.pop();
      let overallStatus, incompleteReason, incompleteCode;

      if (
        this.hasFailures ||
        this.#topSuite.result.failedExpectations.length > 0
      ) {
        overallStatus = 'failed';
      } else if (this.#getFocusedRunables().length > 0) {
        overallStatus = 'incomplete';
        incompleteReason = 'fit() or fdescribe() was found';
        incompleteCode = 'focused';
      } else if (totalSpecsDefined === 0) {
        overallStatus = 'incomplete';
        incompleteReason = 'No specs found';
        incompleteCode = 'noSpecsFound';
      } else {
        overallStatus = 'passed';
      }

      /**
       * Information passed to the {@link Reporter#jasmineDone} event.
       * @typedef JasmineDoneInfo
       * @property {OverallStatus} overallStatus - The overall result of the suite: 'passed', 'failed', or 'incomplete'.
       * @property {Int} totalTime - The total time (in ms) that it took to execute the suite
       * @property {String} incompleteReason - Human-readable explanation of why the suite was incomplete.
       * @property {String} incompleteCode - Machine-readable explanation of why the suite was incomplete: 'focused', 'noSpecsFound', or undefined.
       * @property {Order} order - Information about the ordering (random or not) of this execution of the suite.  Note that this property is not present when Jasmine is run in parallel mode.
       * @property {Int} numWorkers - Number of parallel workers.  Note that this property is only present when Jasmine is run in parallel mode.
       * @property {ExpectationResult[]} failedExpectations - List of expectations that failed in an {@link afterAll} at the global level.
       * @property {ExpectationResult[]} deprecationWarnings - List of deprecation warnings that occurred at the global level.
       * @since 2.4.0
       */
      const jasmineDoneInfo = {
        overallStatus: overallStatus,
        totalTime: jasmineTimer.elapsed(),
        incompleteReason: incompleteReason,
        incompleteCode: incompleteCode,
        order: order,
        failedExpectations: this.#topSuite.result.failedExpectations,
        deprecationWarnings: this.#topSuite.result.deprecationWarnings
      };
      this.#topSuite.reportedDone = true;
      await this.#reportDispatcher.jasmineDone(jasmineDoneInfo);
      return jasmineDoneInfo;
    }

    async #executeTopSuite() {
      const wrappedChildren = this.#wrapNodes(
        this.#executionTree.childrenOfTopSuite()
      );
      const queueableFns = this.#addBeforeAndAfterAlls(
        this.#topSuite,
        wrappedChildren
      );

      await new Promise(resolve => {
        this.#runQueueWithSkipPolicy({
          queueableFns,
          userContext: this.#topSuite.sharedUserContext(),
          onException: function() {
            this.#topSuite.handleException.apply(this.#topSuite, arguments);
          }.bind(this),
          onComplete: resolve,
          onMultipleDone: this.#topSuite.onMultipleDone
            ? this.#topSuite.onMultipleDone.bind(this.#topSuite)
            : null
        });
      });
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

    #executeSpec(spec, done) {
      const config = this.#getConfig();
      spec.execute(
        this.#runQueueWithSkipPolicy.bind(this),
        this.#globalErrors,
        done,
        this.#executionTree.isExcluded(spec),
        config.failSpecWithNoExpectations,
        config.detectLateRejectionHandling
      );
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

    #addBeforeAndAfterAlls(suite, wrappedChildren) {
      if (this.#executionTree.isExcluded(suite)) {
        return wrappedChildren;
      }

      return suite.beforeAllFns
        .concat(wrappedChildren)
        .concat(suite.afterAllFns);
    }

    #suiteSegmentStart(suite, next) {
      this.#currentlyExecutingSuites.push(suite);
      this.#runableResources.initForRunable(suite.id, suite.parentSuite.id);
      this.#reportDispatcher.suiteStarted(suite.result).then(next);
      suite.startTimer();
    }

    #suiteSegmentComplete(suite, result, next) {
      suite.cleanupBeforeAfter();

      if (suite !== this.currentSuite()) {
        throw new Error('Tried to complete the wrong suite');
      }

      this.#runableResources.clearForRunable(suite.id);
      this.#currentlyExecutingSuites.pop();

      if (result.status === 'failed') {
        this.hasFailures = true;
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

    #reportSuiteDone(suite, result, next) {
      suite.reportedDone = true;
      this.#reportDispatcher.suiteDone(result).then(next);
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

          await new Promise(resolve => {
            this.#reportSpecDone(child, child.result, resolve);
          });
        }
      }
    }
  }

  return Runner;
};
