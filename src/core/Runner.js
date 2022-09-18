getJasmineRequireObj().Runner = function(j$) {
  class Runner {
    constructor(options) {
      this.topSuite_ = options.topSuite;
      this.totalSpecsDefined_ = options.totalSpecsDefined;
      this.focusedRunables_ = options.focusedRunables;
      this.runableResources_ = options.runableResources;
      this.queueRunnerFactory_ = options.queueRunnerFactory;
      this.reporter_ = options.reporter;
      this.getConfig_ = options.getConfig;
      this.reportSpecDone_ = options.reportSpecDone;
      this.hasFailures = false;
      this.executedBefore_ = false;

      this.currentlyExecutingSuites_ = [];
      this.currentSpec = null;
    }

    currentRunable() {
      return this.currentSpec || this.currentSuite();
    }

    currentSuite() {
      return this.currentlyExecutingSuites_[
        this.currentlyExecutingSuites_.length - 1
      ];
    }

    async execute(runablesToRun) {
      if (this.executedBefore_) {
        this.topSuite_.reset();
      }
      this.executedBefore_ = true;

      this.hasFailures = false;
      const totalSpecsDefined = this.totalSpecsDefined_();
      const focusedRunables = this.focusedRunables_();
      const config = this.getConfig_();

      if (!runablesToRun) {
        if (focusedRunables.length) {
          runablesToRun = focusedRunables;
        } else {
          runablesToRun = [this.topSuite_.id];
        }
      }

      const order = new j$.Order({
        random: config.random,
        seed: j$.isNumber_(config.seed) ? config.seed + '' : config.seed
      });

      const processor = new j$.TreeProcessor({
        tree: this.topSuite_,
        runnableIds: runablesToRun,
        queueRunnerFactory: options => {
          if (options.isLeaf) {
            // A spec
            options.SkipPolicy = j$.CompleteOnFirstErrorSkipPolicy;
          } else {
            // A suite
            if (config.stopOnSpecFailure) {
              options.SkipPolicy = j$.CompleteOnFirstErrorSkipPolicy;
            } else {
              options.SkipPolicy = j$.SkipAfterBeforeAllErrorPolicy;
            }
          }

          return this.queueRunnerFactory_(options);
        },
        failSpecWithNoExpectations: config.failSpecWithNoExpectations,
        nodeStart: (suite, next) => {
          this.currentlyExecutingSuites_.push(suite);
          this.runableResources_.initForRunable(suite.id, suite.parentSuite.id);
          this.reporter_.suiteStarted(suite.result, next);
          suite.startTimer();
        },
        nodeComplete: (suite, result, next) => {
          if (suite !== this.currentSuite()) {
            throw new Error('Tried to complete the wrong suite');
          }

          this.runableResources_.clearForRunable(suite.id);
          this.currentlyExecutingSuites_.pop();

          if (result.status === 'failed') {
            this.hasFailures = true;
          }
          suite.endTimer();

          if (suite.hadBeforeAllFailure) {
            this.reportChildrenOfBeforeAllFailure_(suite).then(() => {
              this.reportSuiteDone_(suite, result, next);
            });
          } else {
            this.reportSuiteDone_(suite, result, next);
          }
        },
        orderChildren: function(node) {
          return order.sort(node.children);
        },
        excludeNode: function(spec) {
          return !config.specFilter(spec);
        }
      });

      if (!processor.processTree().valid) {
        throw new Error(
          'Invalid order: would cause a beforeAll or afterAll to be run multiple times'
        );
      }

      this.runableResources_.initForRunable(this.topSuite_.id);
      const jasmineTimer = new j$.Timer();
      jasmineTimer.start();

      return new Promise(resolve => {
        /**
         * Information passed to the {@link Reporter#jasmineStarted} event.
         * @typedef JasmineStartedInfo
         * @property {Int} totalSpecsDefined - The total number of specs defined in this suite.
         * @property {Order} order - Information about the ordering (random or not) of this execution of the suite.
         * @since 2.0.0
         */
        this.reporter_.jasmineStarted(
          {
            totalSpecsDefined,
            order: order
          },
          () => {
            this.currentlyExecutingSuites_.push(this.topSuite_);

            processor.execute(() => {
              (async () => {
                if (this.topSuite_.hadBeforeAllFailure) {
                  await this.reportChildrenOfBeforeAllFailure_(this.topSuite_);
                }

                this.runableResources_.clearForRunable(this.topSuite_.id);
                this.currentlyExecutingSuites_.pop();
                let overallStatus, incompleteReason;

                if (
                  this.hasFailures ||
                  this.topSuite_.result.failedExpectations.length > 0
                ) {
                  overallStatus = 'failed';
                } else if (focusedRunables.length > 0) {
                  overallStatus = 'incomplete';
                  incompleteReason = 'fit() or fdescribe() was found';
                } else if (totalSpecsDefined === 0) {
                  overallStatus = 'incomplete';
                  incompleteReason = 'No specs found';
                } else {
                  overallStatus = 'passed';
                }

                /**
                 * Information passed to the {@link Reporter#jasmineDone} event.
                 * @typedef JasmineDoneInfo
                 * @property {OverallStatus} overallStatus - The overall result of the suite: 'passed', 'failed', or 'incomplete'.
                 * @property {Int} totalTime - The total time (in ms) that it took to execute the suite
                 * @property {IncompleteReason} incompleteReason - Explanation of why the suite was incomplete.
                 * @property {Order} order - Information about the ordering (random or not) of this execution of the suite.
                 * @property {Expectation[]} failedExpectations - List of expectations that failed in an {@link afterAll} at the global level.
                 * @property {Expectation[]} deprecationWarnings - List of deprecation warnings that occurred at the global level.
                 * @since 2.4.0
                 */
                const jasmineDoneInfo = {
                  overallStatus: overallStatus,
                  totalTime: jasmineTimer.elapsed(),
                  incompleteReason: incompleteReason,
                  order: order,
                  failedExpectations: this.topSuite_.result.failedExpectations,
                  deprecationWarnings: this.topSuite_.result.deprecationWarnings
                };
                this.topSuite_.reportedDone = true;
                this.reporter_.jasmineDone(jasmineDoneInfo, function() {
                  resolve(jasmineDoneInfo);
                });
              })();
            });
          }
        );
      });
    }

    reportSuiteDone_(suite, result, next) {
      suite.reportedDone = true;
      this.reporter_.suiteDone(result, next);
    }

    async reportChildrenOfBeforeAllFailure_(suite) {
      for (const child of suite.children) {
        if (child instanceof j$.Suite) {
          await new Promise(resolve => {
            this.reporter_.suiteStarted(child.result, resolve);
          });
          await this.reportChildrenOfBeforeAllFailure_(child);

          // Marking the suite passed is consistent with how suites that
          // contain failed specs but no suite-level failures are reported.
          child.result.status = 'passed';

          await new Promise(resolve => {
            this.reporter_.suiteDone(child.result, resolve);
          });
        } else {
          /* a spec */
          await new Promise(resolve => {
            this.reporter_.specStarted(child.result, resolve);
          });

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
            this.reportSpecDone_(child, child.result, resolve);
          });
        }
      }
    }
  }

  return Runner;
};
