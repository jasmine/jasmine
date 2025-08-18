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
    #currentRunableTracker;

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
      this.#currentRunableTracker = new CurrentRunableTracker();
    }

    currentSpec() {
      return this.#currentRunableTracker.currentSpec();
    }

    setCurrentSpec(spec) {
      this.#currentRunableTracker.setCurrentSpec(spec);
    }

    currentRunable() {
      return this.#currentRunableTracker.currentRunable();
    }

    currentSuite() {
      return this.#currentRunableTracker.currentSuite();
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

      this.#currentRunableTracker.pushSuite(this.#topSuite);
      const treeRunner = new j$.TreeRunner({
        executionTree: this.#executionTree,
        globalErrors: this.#globalErrors,
        runableResources: this.#runableResources,
        reportDispatcher: this.#reportDispatcher,
        runQueue: this.#runQueue,
        getConfig: this.#getConfig,
        reportChildrenOfBeforeAllFailure: this.#reportChildrenOfBeforeAllFailure.bind(
          this
        ),
        currentRunableTracker: this.#currentRunableTracker
      });
      await treeRunner.execute();
      this.hasFailures = this.hasFailures || treeRunner.hasFailures;

      if (this.#topSuite.hadBeforeAllFailure) {
        await this.#reportChildrenOfBeforeAllFailure(this.#topSuite);
      }

      this.#runableResources.clearForRunable(this.#topSuite.id);
      this.#currentRunableTracker.popSuite();
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

  class CurrentRunableTracker {
    #currentSpec;
    #currentlyExecutingSuites;

    constructor() {
      this.#currentlyExecutingSuites = [];
    }

    currentRunable() {
      return this.currentSpec() || this.currentSuite();
    }

    currentSpec() {
      return this.#currentSpec;
    }

    setCurrentSpec(spec) {
      this.#currentSpec = spec;
    }

    currentSuite() {
      return this.#currentlyExecutingSuites[
        this.#currentlyExecutingSuites.length - 1
      ];
    }

    pushSuite(suite) {
      this.#currentlyExecutingSuites.push(suite);
    }

    popSuite() {
      this.#currentlyExecutingSuites.pop();
    }
  }

  return Runner;
};
