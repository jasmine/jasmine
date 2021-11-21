getJasmineRequireObj().Env = function(j$) {
  /**
   * @class Env
   * @since 2.0.0
   * @classdesc The Jasmine environment.<br>
   * _Note:_ Do not construct this directly. You can obtain the Env instance by
   * calling {@link jasmine.getEnv}.
   * @hideconstructor
   */
  function Env(options) {
    options = options || {};

    const self = this;
    const global = options.global || j$.getGlobal();

    let totalSpecsDefined = 0;

    const realSetTimeout = global.setTimeout;
    const realClearTimeout = global.clearTimeout;
    const clearStack = j$.getClearStack(global);
    this.clock = new j$.Clock(
      global,
      function() {
        return new j$.DelayedFunctionScheduler();
      },
      new j$.MockDate(global)
    );

    const runnableResources = new j$.RunnableResources(function() {
      const r = currentRunnable();
      return r ? r.id : null;
    });

    let topSuite;
    let currentSpec = null;
    const currentlyExecutingSuites = [];
    const focusedRunnables = [];
    let currentDeclarationSuite = null;
    let hasFailures = false;
    let deprecator;
    let reporter;

    /**
     * This represents the available options to configure Jasmine.
     * Options that are not provided will use their default values.
     * @see Env#configure
     * @interface Configuration
     * @since 3.3.0
     */
    const config = {
      /**
       * Whether to randomize spec execution order
       * @name Configuration#random
       * @since 3.3.0
       * @type Boolean
       * @default true
       */
      random: true,
      /**
       * Seed to use as the basis of randomization.
       * Null causes the seed to be determined randomly at the start of execution.
       * @name Configuration#seed
       * @since 3.3.0
       * @type (number|string)
       * @default null
       */
      seed: null,
      /**
       * Whether to stop execution of the suite after the first spec failure
       * @name Configuration#stopOnSpecFailure
       * @since 3.9.0
       * @type Boolean
       * @default false
       */
      stopOnSpecFailure: false,
      /**
       * Whether to fail the spec if it ran no expectations. By default
       * a spec that ran no expectations is reported as passed. Setting this
       * to true will report such spec as a failure.
       * @name Configuration#failSpecWithNoExpectations
       * @since 3.5.0
       * @type Boolean
       * @default false
       */
      failSpecWithNoExpectations: false,
      /**
       * Whether to cause specs to only have one expectation failure.
       * @name Configuration#stopSpecOnExpectationFailure
       * @since 3.3.0
       * @type Boolean
       * @default false
       */
      stopSpecOnExpectationFailure: false,
      /**
       * A function that takes a spec and returns true if it should be executed
       * or false if it should be skipped.
       * @callback SpecFilter
       * @param {Spec} spec - The spec that the filter is being applied to.
       * @return boolean
       */
      /**
       * Function to use to filter specs
       * @name Configuration#specFilter
       * @since 3.3.0
       * @type SpecFilter
       * @default A function that always returns true.
       */
      specFilter: function() {
        return true;
      },
      /**
       * Whether or not reporters should hide disabled specs from their output.
       * Currently only supported by Jasmine's HTMLReporter
       * @name Configuration#hideDisabled
       * @since 3.3.0
       * @type Boolean
       * @default false
       */
      hideDisabled: false,
      /**
       * Clean closures when a suite is done running (done by clearing the stored function reference).
       * This prevents memory leaks, but you won't be able to run jasmine multiple times.
       * @name Configuration#autoCleanClosures
       * @since 3.10.0
       * @type boolean
       * @default true
       */
      autoCleanClosures: true,
      /**
       * Whether or not to issue warnings for certain deprecated functionality
       * every time it's used. If not set or set to false, deprecation warnings
       * for methods that tend to be called frequently will be issued only once
       * or otherwise throttled to to prevent the suite output from being flooded
       * with warnings.
       * @name Configuration#verboseDeprecations
       * @since 3.6.0
       * @type Boolean
       * @default false
       */
      verboseDeprecations: false
    };

    function currentSuite() {
      return currentlyExecutingSuites[currentlyExecutingSuites.length - 1];
    }

    function currentRunnable() {
      return currentSpec || currentSuite();
    }

    let globalErrors = null;

    function installGlobalErrors() {
      if (globalErrors) {
        return;
      }

      globalErrors = new j$.GlobalErrors();
      globalErrors.install();
    }

    if (!options.suppressLoadErrors) {
      installGlobalErrors();
      globalErrors.pushListener(function(
        message,
        filename,
        lineno,
        colNo,
        err
      ) {
        topSuite.result.failedExpectations.push({
          passed: false,
          globalErrorType: 'load',
          message: message,
          stack: err && err.stack,
          filename: filename,
          lineno: lineno
        });
      });
    }

    /**
     * Configure your jasmine environment
     * @name Env#configure
     * @since 3.3.0
     * @argument {Configuration} configuration
     * @function
     */
    this.configure = function(configuration) {
      const booleanProps = [
        'random',
        'failSpecWithNoExpectations',
        'hideDisabled',
        'stopOnSpecFailure',
        'stopSpecOnExpectationFailure',
        'autoCleanClosures'
      ];

      booleanProps.forEach(function(prop) {
        if (typeof configuration[prop] !== 'undefined') {
          config[prop] = !!configuration[prop];
        }
      });

      if (configuration.specFilter) {
        config.specFilter = configuration.specFilter;
      }

      if (typeof configuration.seed !== 'undefined') {
        config.seed = configuration.seed;
      }

      if (configuration.hasOwnProperty('verboseDeprecations')) {
        config.verboseDeprecations = configuration.verboseDeprecations;
        deprecator.verboseDeprecations(config.verboseDeprecations);
      }
    };

    /**
     * Get the current configuration for your jasmine environment
     * @name Env#configuration
     * @since 3.3.0
     * @function
     * @returns {Configuration}
     */
    this.configuration = function() {
      const result = {};
      for (const property in config) {
        result[property] = config[property];
      }
      return result;
    };

    this.setDefaultSpyStrategy = function(defaultStrategyFn) {
      runnableResources.setDefaultSpyStrategy(defaultStrategyFn);
    };

    this.addSpyStrategy = function(name, fn) {
      runnableResources.customSpyStrategies()[name] = fn;
    };

    this.addCustomEqualityTester = function(tester) {
      runnableResources.customEqualityTesters().push(tester);
    };

    this.addMatchers = function(matchersToAdd) {
      runnableResources.addCustomMatchers(matchersToAdd);
    };

    this.addAsyncMatchers = function(matchersToAdd) {
      runnableResources.addCustomAsyncMatchers(matchersToAdd);
    };

    this.addCustomObjectFormatter = function(formatter) {
      runnableResources.customObjectFormatters().push(formatter);
    };

    j$.Expectation.addCoreMatchers(j$.matchers);
    j$.Expectation.addAsyncCoreMatchers(j$.asyncMatchers);

    let nextSpecId = 0;

    function getNextSpecId() {
      return 'spec' + nextSpecId++;
    }

    let nextSuiteId = 0;

    function getNextSuiteId() {
      return 'suite' + nextSuiteId++;
    }

    const expectationFactory = function(actual, spec) {
      return j$.Expectation.factory({
        matchersUtil: runnableResources.makeMatchersUtil(),
        customMatchers: runnableResources.customMatchers(),
        actual: actual,
        addExpectationResult: addExpectationResult
      });

      function addExpectationResult(passed, result) {
        return spec.addExpectationResult(passed, result);
      }
    };

    // TODO: Unify recordLateError with recordLateExpectation? The extra
    // diagnostic info added by the latter is probably useful in most cases.
    function recordLateError(error) {
      const isExpectationResult =
        error.matcherName !== undefined && error.passed !== undefined;
      const result = isExpectationResult
        ? error
        : j$.buildExpectationResult({
            error,
            passed: false,
            matcherName: '',
            expected: '',
            actual: ''
          });
      routeLateFailure(result);
    }

    function recordLateExpectation(runable, runableType, result) {
      const delayedExpectationResult = {};
      Object.keys(result).forEach(function(k) {
        delayedExpectationResult[k] = result[k];
      });
      delayedExpectationResult.passed = false;
      delayedExpectationResult.globalErrorType = 'lateExpectation';
      delayedExpectationResult.message =
        runableType +
        ' "' +
        runable.getFullName() +
        '" ran a "' +
        result.matcherName +
        '" expectation after it finished.\n';

      if (result.message) {
        delayedExpectationResult.message +=
          'Message: "' + result.message + '"\n';
      }

      delayedExpectationResult.message +=
        '1. Did you forget to return or await the result of expectAsync?\n' +
        '2. Was done() invoked before an async operation completed?\n' +
        '3. Did an expectation follow a call to done()?';

      topSuite.result.failedExpectations.push(delayedExpectationResult);
    }

    function routeLateFailure(expectationResult) {
      // Report the result on the nearest ancestor suite that hasn't already
      // been reported done.
      for (let r = currentRunnable(); r; r = r.parentSuite) {
        if (!r.reportedDone) {
          if (r === topSuite) {
            expectationResult.globalErrorType = 'lateError';
          }

          r.result.failedExpectations.push(expectationResult);
          return;
        }
      }

      // If we get here, all results have been reported and there's nothing we
      // can do except log the result and hope the user sees it.
      console.error('Jasmine received a result after the suite finished:');
      console.error(expectationResult);
    }

    const asyncExpectationFactory = function(actual, spec, runableType) {
      return j$.Expectation.asyncFactory({
        matchersUtil: runnableResources.makeMatchersUtil(),
        customAsyncMatchers: runnableResources.customAsyncMatchers(),
        actual: actual,
        addExpectationResult: addExpectationResult
      });

      function addExpectationResult(passed, result) {
        if (currentRunnable() !== spec) {
          recordLateExpectation(spec, runableType, result);
        }
        return spec.addExpectationResult(passed, result);
      }
    };
    const suiteAsyncExpectationFactory = function(actual, suite) {
      return asyncExpectationFactory(actual, suite, 'Suite');
    };

    const specAsyncExpectationFactory = function(actual, suite) {
      return asyncExpectationFactory(actual, suite, 'Spec');
    };

    function beforeAndAfterFns(targetSuite) {
      return function() {
        let befores = [],
          afters = [],
          suite = targetSuite;

        while (suite) {
          befores = befores.concat(suite.beforeFns);
          afters = afters.concat(suite.afterFns);

          suite = suite.parentSuite;
        }

        return {
          befores: befores.reverse(),
          afters: afters
        };
      };
    }

    function getSpecName(spec, suite) {
      const fullName = [spec.description],
        suiteFullName = suite.getFullName();

      if (suiteFullName !== '') {
        fullName.unshift(suiteFullName);
      }
      return fullName.join(' ');
    }

    /**
     * Causes a deprecation warning to be logged to the console and reported to
     * reporters.
     *
     * The optional second parameter is an object that can have either of the
     * following properties:
     *
     * omitStackTrace: Whether to omit the stack trace. Optional. Defaults to
     * false. This option is ignored if the deprecation is an Error. Set this
     * when the stack trace will not contain anything that helps the user find
     * the source of the deprecation.
     *
     * ignoreRunnable: Whether to log the deprecation on the root suite, ignoring
     * the spec or suite that's running when it happens. Optional. Defaults to
     * false.
     *
     * @name Env#deprecated
     * @since 2.99
     * @function
     * @param {String|Error} deprecation The deprecation message
     * @param {Object} [options] Optional extra options, as described above
     */
    this.deprecated = function(deprecation, options) {
      const runnable = currentRunnable() || topSuite;
      deprecator.addDeprecationWarning(runnable, deprecation, options);
    };

    function queueRunnerFactory(options, args) {
      if (options.isLeaf) {
        // A spec
        options.SkipPolicy = j$.CompleteOnFirstErrorSkipPolicy;
      } else if (options.isReporter) {
        // A reporter queue
        options.SkipPolicy = j$.NeverSkipPolicy;
      } else {
        // A suite
        if (config.stopOnSpecFailure) {
          options.SkipPolicy = j$.CompleteOnFirstErrorSkipPolicy;
        } else {
          options.SkipPolicy = j$.SkipAfterBeforeAllErrorPolicy;
        }
      }

      options.clearStack = options.clearStack || clearStack;
      options.timeout = {
        setTimeout: realSetTimeout,
        clearTimeout: realClearTimeout
      };
      options.fail = self.fail;
      options.globalErrors = globalErrors;
      options.onException =
        options.onException ||
        function(e) {
          (currentRunnable() || topSuite).handleException(e);
        };
      options.deprecated = self.deprecated;

      new j$.QueueRunner(options).execute(args);
    }

    topSuite = new j$.Suite({
      id: getNextSuiteId(),
      description: 'Jasmine__TopLevel__Suite',
      expectationFactory: expectationFactory,
      asyncExpectationFactory: suiteAsyncExpectationFactory,
      autoCleanClosures: config.autoCleanClosures,
      onLateError: recordLateError
    });
    deprecator = new j$.Deprecator(topSuite);
    currentDeclarationSuite = topSuite;

    /**
     * Provides the root suite, through which all suites and specs can be
     * accessed.
     * @function
     * @name Env#topSuite
     * @return {Suite} the root suite
     * @since 2.0.0
     */
    this.topSuite = function() {
      return topSuite.metadata;
    };

    /**
     * This represents the available reporter callback for an object passed to {@link Env#addReporter}.
     * @interface Reporter
     * @see custom_reporter
     */
    reporter = new j$.ReportDispatcher(
      [
        /**
         * `jasmineStarted` is called after all of the specs have been loaded, but just before execution starts.
         * @function
         * @name Reporter#jasmineStarted
         * @param {JasmineStartedInfo} suiteInfo Information about the full Jasmine suite that is being run
         * @param {Function} [done] Used to specify to Jasmine that this callback is asynchronous and Jasmine should wait until it has been called before moving on.
         * @returns {} Optionally return a Promise instead of using `done` to cause Jasmine to wait for completion.
         * @see async
         */
        'jasmineStarted',
        /**
         * When the entire suite has finished execution `jasmineDone` is called
         * @function
         * @name Reporter#jasmineDone
         * @param {JasmineDoneInfo} suiteInfo Information about the full Jasmine suite that just finished running.
         * @param {Function} [done] Used to specify to Jasmine that this callback is asynchronous and Jasmine should wait until it has been called before moving on.
         * @returns {} Optionally return a Promise instead of using `done` to cause Jasmine to wait for completion.
         * @see async
         */
        'jasmineDone',
        /**
         * `suiteStarted` is invoked when a `describe` starts to run
         * @function
         * @name Reporter#suiteStarted
         * @param {SuiteResult} result Information about the individual {@link describe} being run
         * @param {Function} [done] Used to specify to Jasmine that this callback is asynchronous and Jasmine should wait until it has been called before moving on.
         * @returns {} Optionally return a Promise instead of using `done` to cause Jasmine to wait for completion.
         * @see async
         */
        'suiteStarted',
        /**
         * `suiteDone` is invoked when all of the child specs and suites for a given suite have been run
         *
         * While jasmine doesn't require any specific functions, not defining a `suiteDone` will make it impossible for a reporter to know when a suite has failures in an `afterAll`.
         * @function
         * @name Reporter#suiteDone
         * @param {SuiteResult} result
         * @param {Function} [done] Used to specify to Jasmine that this callback is asynchronous and Jasmine should wait until it has been called before moving on.
         * @returns {} Optionally return a Promise instead of using `done` to cause Jasmine to wait for completion.
         * @see async
         */
        'suiteDone',
        /**
         * `specStarted` is invoked when an `it` starts to run (including associated `beforeEach` functions)
         * @function
         * @name Reporter#specStarted
         * @param {SpecResult} result Information about the individual {@link it} being run
         * @param {Function} [done] Used to specify to Jasmine that this callback is asynchronous and Jasmine should wait until it has been called before moving on.
         * @returns {} Optionally return a Promise instead of using `done` to cause Jasmine to wait for completion.
         * @see async
         */
        'specStarted',
        /**
         * `specDone` is invoked when an `it` and its associated `beforeEach` and `afterEach` functions have been run.
         *
         * While jasmine doesn't require any specific functions, not defining a `specDone` will make it impossible for a reporter to know when a spec has failed.
         * @function
         * @name Reporter#specDone
         * @param {SpecResult} result
         * @param {Function} [done] Used to specify to Jasmine that this callback is asynchronous and Jasmine should wait until it has been called before moving on.
         * @returns {} Optionally return a Promise instead of using `done` to cause Jasmine to wait for completion.
         * @see async
         */
        'specDone'
      ],
      queueRunnerFactory,
      recordLateError
    );

    /**
     * Executes the specs.
     *
     * If called with no parameters or with a falsy value as the first parameter,
     * all specs will be executed except those that are excluded by a
     * [spec filter]{@link Configuration#specFilter} or other mechanism. If the
     * first parameter is a list of spec/suite IDs, only those specs/suites will
     * be run.
     *
     * Both parameters are optional, but a completion callback is only valid as
     * the second parameter. To specify a completion callback but not a list of
     * specs/suites to run, pass null or undefined as the first parameter. The
     * completion callback is supported for backward compatibility. In most
     * cases it will be more convenient to use the returned promise instead.
     *
     * execute should not be called more than once unless the env has been
     * configured with `{autoCleanClosures: false}`.
     *
     * execute returns a promise. The promise will be resolved to the same
     * {@link JasmineDoneInfo|overall result} that's passed to a reporter's
     * `jasmineDone` method, even if the suite did not pass. To determine
     * whether the suite passed, check the value that the promise resolves to
     * or use a {@link Reporter}.
     *
     * @name Env#execute
     * @since 2.0.0
     * @function
     * @param {(string[])=} runnablesToRun IDs of suites and/or specs to run
     * @param {Function=} onComplete Function that will be called after all specs have run
     * @return {Promise<JasmineDoneInfo>}
     */
    this.execute = function(runnablesToRun, onComplete) {
      if (this._executedBefore) {
        topSuite.reset();
      }
      this._executedBefore = true;
      runnableResources.initForRunnable(topSuite.id);
      installGlobalErrors();

      if (!runnablesToRun) {
        if (focusedRunnables.length) {
          runnablesToRun = focusedRunnables;
        } else {
          runnablesToRun = [topSuite.id];
        }
      }

      const order = new j$.Order({
        random: config.random,
        seed: config.seed
      });

      const processor = new j$.TreeProcessor({
        tree: topSuite,
        runnableIds: runnablesToRun,
        queueRunnerFactory: queueRunnerFactory,
        failSpecWithNoExpectations: config.failSpecWithNoExpectations,
        nodeStart: function(suite, next) {
          currentlyExecutingSuites.push(suite);
          runnableResources.initForRunnable(suite.id, suite.parentSuite.id);
          reporter.suiteStarted(suite.result, next);
          suite.startTimer();
        },
        nodeComplete: function(suite, result, next) {
          if (suite !== currentSuite()) {
            throw new Error('Tried to complete the wrong suite');
          }

          runnableResources.clearForRunnable(suite.id);
          currentlyExecutingSuites.pop();

          if (result.status === 'failed') {
            hasFailures = true;
          }
          suite.endTimer();

          if (suite.hadBeforeAllFailure) {
            reportChildrenOfBeforeAllFailure(suite).then(function() {
              reportSuiteDone(suite, result, next);
            });
          } else {
            reportSuiteDone(suite, result, next);
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

      const jasmineTimer = new j$.Timer();
      jasmineTimer.start();

      return new Promise(function(resolve) {
        runAll(function(jasmineDoneInfo) {
          if (onComplete) {
            onComplete();
          }

          resolve(jasmineDoneInfo);
        });
      });

      function runAll(done) {
        /**
         * Information passed to the {@link Reporter#jasmineStarted} event.
         * @typedef JasmineStartedInfo
         * @property {Int} totalSpecsDefined - The total number of specs defined in this suite.
         * @property {Order} order - Information about the ordering (random or not) of this execution of the suite.
         * @since 2.0.0
         */
        reporter.jasmineStarted(
          {
            totalSpecsDefined: totalSpecsDefined,
            order: order
          },
          function() {
            currentlyExecutingSuites.push(topSuite);

            processor.execute(function() {
              (async function() {
                if (topSuite.hadBeforeAllFailure) {
                  await reportChildrenOfBeforeAllFailure(topSuite);
                }

                runnableResources.clearForRunnable(topSuite.id);
                currentlyExecutingSuites.pop();
                let overallStatus, incompleteReason;

                if (
                  hasFailures ||
                  topSuite.result.failedExpectations.length > 0
                ) {
                  overallStatus = 'failed';
                } else if (focusedRunnables.length > 0) {
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
                  failedExpectations: topSuite.result.failedExpectations,
                  deprecationWarnings: topSuite.result.deprecationWarnings
                };
                topSuite.reportedDone = true;
                reporter.jasmineDone(jasmineDoneInfo, function() {
                  done(jasmineDoneInfo);
                });
              })();
            });
          }
        );
      }

      async function reportChildrenOfBeforeAllFailure(suite) {
        for (const child of suite.children) {
          if (child instanceof j$.Suite) {
            await new Promise(function(resolve) {
              reporter.suiteStarted(child.result, resolve);
            });
            await reportChildrenOfBeforeAllFailure(child);

            // Marking the suite passed is consistent with how suites that
            // contain failed specs but no suite-level failures are reported.
            child.result.status = 'passed';

            await new Promise(function(resolve) {
              reporter.suiteDone(child.result, resolve);
            });
          } else {
            /* a spec */
            await new Promise(function(resolve) {
              reporter.specStarted(child.result, resolve);
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

            await new Promise(function(resolve) {
              reportSpecDone(child, child.result, resolve);
            });
          }
        }
      }
    };

    /**
     * Add a custom reporter to the Jasmine environment.
     * @name Env#addReporter
     * @since 2.0.0
     * @function
     * @param {Reporter} reporterToAdd The reporter to be added.
     * @see custom_reporter
     */
    this.addReporter = function(reporterToAdd) {
      reporter.addReporter(reporterToAdd);
    };

    /**
     * Provide a fallback reporter if no other reporters have been specified.
     * @name Env#provideFallbackReporter
     * @since 2.5.0
     * @function
     * @param {Reporter} reporterToAdd The reporter
     * @see custom_reporter
     */
    this.provideFallbackReporter = function(reporterToAdd) {
      reporter.provideFallbackReporter(reporterToAdd);
    };

    /**
     * Clear all registered reporters
     * @name Env#clearReporters
     * @since 2.5.2
     * @function
     */
    this.clearReporters = function() {
      reporter.clearReporters();
    };

    /**
     * Configures whether Jasmine should allow the same function to be spied on
     * more than once during the execution of a spec. By default, spying on
     * a function that is already a spy will cause an error.
     * @name Env#allowRespy
     * @function
     * @since 2.5.0
     * @param {boolean} allow Whether to allow respying
     */
    this.allowRespy = function(allow) {
      runnableResources.spyRegistry.allowRespy(allow);
    };

    this.spyOn = function() {
      return runnableResources.spyRegistry.spyOn.apply(
        runnableResources.spyRegistry,
        arguments
      );
    };

    this.spyOnProperty = function() {
      return runnableResources.spyRegistry.spyOnProperty.apply(
        runnableResources.spyRegistry,
        arguments
      );
    };

    this.spyOnAllFunctions = function() {
      return runnableResources.spyRegistry.spyOnAllFunctions.apply(
        runnableResources.spyRegistry,
        arguments
      );
    };

    this.createSpy = function(name, originalFn) {
      return runnableResources.spyFactory.createSpy(name, originalFn);
    };

    this.createSpyObj = function(baseName, methodNames, propertyNames) {
      return runnableResources.spyFactory.createSpyObj(
        baseName,
        methodNames,
        propertyNames
      );
    };

    function ensureIsFunction(fn, caller) {
      if (!j$.isFunction_(fn)) {
        throw new Error(
          caller + ' expects a function argument; received ' + j$.getType_(fn)
        );
      }
    }

    function ensureIsFunctionOrAsync(fn, caller) {
      if (!j$.isFunction_(fn) && !j$.isAsyncFunction_(fn)) {
        throw new Error(
          caller + ' expects a function argument; received ' + j$.getType_(fn)
        );
      }
    }

    function ensureIsNotNested(method) {
      const runnable = currentRunnable();
      if (runnable !== null && runnable !== undefined) {
        throw new Error(
          "'" + method + "' should only be used in 'describe' function"
        );
      }
    }

    function suiteFactory(description) {
      return new j$.Suite({
        id: getNextSuiteId(),
        description: description,
        parentSuite: currentDeclarationSuite,
        timer: new j$.Timer(),
        expectationFactory: expectationFactory,
        asyncExpectationFactory: suiteAsyncExpectationFactory,
        throwOnExpectationFailure: config.stopSpecOnExpectationFailure,
        autoCleanClosures: config.autoCleanClosures,
        onLateError: recordLateError
      });
    }

    this.describe = function(description, specDefinitions) {
      ensureIsNotNested('describe');
      ensureIsFunction(specDefinitions, 'describe');
      const suite = suiteFactory(description);
      if (specDefinitions.length > 0) {
        throw new Error('describe does not expect any arguments');
      }
      if (currentDeclarationSuite.markedExcluding) {
        suite.exclude();
      }
      addSpecsToSuite(suite, specDefinitions);
      if (suite.parentSuite && !suite.children.length) {
        throw new Error(
          'describe with no children (describe() or it()): ' +
            suite.getFullName()
        );
      }
      return suite.metadata;
    };

    this.xdescribe = function(description, specDefinitions) {
      ensureIsNotNested('xdescribe');
      ensureIsFunction(specDefinitions, 'xdescribe');
      const suite = suiteFactory(description);
      suite.exclude();
      addSpecsToSuite(suite, specDefinitions);
      return suite.metadata;
    };

    this.fdescribe = function(description, specDefinitions) {
      ensureIsNotNested('fdescribe');
      ensureIsFunction(specDefinitions, 'fdescribe');
      const suite = suiteFactory(description);
      suite.isFocused = true;

      focusedRunnables.push(suite.id);
      unfocusAncestor();
      addSpecsToSuite(suite, specDefinitions);

      return suite.metadata;
    };

    function addSpecsToSuite(suite, specDefinitions) {
      const parentSuite = currentDeclarationSuite;
      parentSuite.addChild(suite);
      currentDeclarationSuite = suite;

      let declarationError = null;
      try {
        specDefinitions();
      } catch (e) {
        declarationError = e;
      }

      if (declarationError) {
        suite.handleException(declarationError);
      }

      currentDeclarationSuite = parentSuite;
    }

    function findFocusedAncestor(suite) {
      while (suite) {
        if (suite.isFocused) {
          return suite.id;
        }
        suite = suite.parentSuite;
      }

      return null;
    }

    function unfocusAncestor() {
      const focusedAncestor = findFocusedAncestor(currentDeclarationSuite);
      if (focusedAncestor) {
        for (let i = 0; i < focusedRunnables.length; i++) {
          if (focusedRunnables[i] === focusedAncestor) {
            focusedRunnables.splice(i, 1);
            break;
          }
        }
      }
    }

    const specFactory = function(description, fn, suite, timeout) {
      totalSpecsDefined++;
      const spec = new j$.Spec({
        id: getNextSpecId(),
        beforeAndAfterFns: beforeAndAfterFns(suite),
        expectationFactory: expectationFactory,
        asyncExpectationFactory: specAsyncExpectationFactory,
        onLateError: recordLateError,
        resultCallback: specResultCallback,
        getSpecName: function(spec) {
          return getSpecName(spec, suite);
        },
        onStart: specStarted,
        description: description,
        queueRunnerFactory: queueRunnerFactory,
        userContext: function() {
          return suite.clonedSharedUserContext();
        },
        queueableFn: {
          fn: fn,
          timeout: timeout || 0
        },
        throwOnExpectationFailure: config.stopSpecOnExpectationFailure,
        autoCleanClosures: config.autoCleanClosures,
        timer: new j$.Timer()
      });
      return spec;

      function specResultCallback(result, next) {
        runnableResources.clearForRunnable(spec.id);
        currentSpec = null;

        if (result.status === 'failed') {
          hasFailures = true;
        }

        reportSpecDone(spec, result, next);
      }

      function specStarted(spec, next) {
        currentSpec = spec;
        runnableResources.initForRunnable(spec.id, suite.id);
        reporter.specStarted(spec.result, next);
      }
    };

    function reportSpecDone(spec, result, next) {
      spec.reportedDone = true;
      reporter.specDone(result, next);
    }

    function reportSuiteDone(suite, result, next) {
      suite.reportedDone = true;
      reporter.suiteDone(result, next);
    }

    this.it_ = function(description, fn, timeout) {
      ensureIsNotNested('it');
      // it() sometimes doesn't have a fn argument, so only check the type if
      // it's given.
      if (arguments.length > 1 && typeof fn !== 'undefined') {
        ensureIsFunctionOrAsync(fn, 'it');
      }

      if (timeout) {
        j$.util.validateTimeout(timeout);
      }

      const spec = specFactory(
        description,
        fn,
        currentDeclarationSuite,
        timeout
      );
      if (currentDeclarationSuite.markedExcluding) {
        spec.exclude();
      }
      currentDeclarationSuite.addChild(spec);

      return spec;
    };

    this.it = function(description, fn, timeout) {
      const spec = this.it_(description, fn, timeout);
      return spec.metadata;
    };

    this.xit = function(description, fn, timeout) {
      ensureIsNotNested('xit');
      // xit(), like it(), doesn't always have a fn argument, so only check the
      // type when needed.
      if (arguments.length > 1 && typeof fn !== 'undefined') {
        ensureIsFunctionOrAsync(fn, 'xit');
      }
      const spec = this.it_.apply(this, arguments);
      spec.exclude('Temporarily disabled with xit');
      return spec.metadata;
    };

    this.fit = function(description, fn, timeout) {
      ensureIsNotNested('fit');
      ensureIsFunctionOrAsync(fn, 'fit');

      if (timeout) {
        j$.util.validateTimeout(timeout);
      }
      const spec = specFactory(
        description,
        fn,
        currentDeclarationSuite,
        timeout
      );
      currentDeclarationSuite.addChild(spec);
      focusedRunnables.push(spec.id);
      unfocusAncestor();
      return spec.metadata;
    };

    /**
     * Sets a user-defined property that will be provided to reporters as part of the properties field of {@link SpecResult}
     * @name Env#setSpecProperty
     * @since 3.6.0
     * @function
     * @param {String} key The name of the property
     * @param {*} value The value of the property
     */
    this.setSpecProperty = function(key, value) {
      if (!currentRunnable() || currentRunnable() == currentSuite()) {
        throw new Error(
          "'setSpecProperty' was used when there was no current spec"
        );
      }
      currentRunnable().setSpecProperty(key, value);
    };

    /**
     * Sets a user-defined property that will be provided to reporters as part of the properties field of {@link SuiteResult}
     * @name Env#setSuiteProperty
     * @since 3.6.0
     * @function
     * @param {String} key The name of the property
     * @param {*} value The value of the property
     */
    this.setSuiteProperty = function(key, value) {
      if (!currentSuite()) {
        throw new Error(
          "'setSuiteProperty' was used when there was no current suite"
        );
      }
      currentSuite().setSuiteProperty(key, value);
    };

    this.debugLog = function(msg) {
      const maybeSpec = currentRunnable();

      if (!maybeSpec || !maybeSpec.debugLog) {
        throw new Error("'debugLog' was called when there was no current spec");
      }

      maybeSpec.debugLog(msg);
    };

    this.expect = function(actual) {
      if (!currentRunnable()) {
        throw new Error(
          "'expect' was used when there was no current spec, this could be because an asynchronous test timed out"
        );
      }

      return currentRunnable().expect(actual);
    };

    this.expectAsync = function(actual) {
      if (!currentRunnable()) {
        throw new Error(
          "'expectAsync' was used when there was no current spec, this could be because an asynchronous test timed out"
        );
      }

      return currentRunnable().expectAsync(actual);
    };

    this.beforeEach = function(beforeEachFunction, timeout) {
      ensureIsNotNested('beforeEach');
      ensureIsFunctionOrAsync(beforeEachFunction, 'beforeEach');

      if (timeout) {
        j$.util.validateTimeout(timeout);
      }

      currentDeclarationSuite.beforeEach({
        fn: beforeEachFunction,
        timeout: timeout || 0
      });
    };

    this.beforeAll = function(beforeAllFunction, timeout) {
      ensureIsNotNested('beforeAll');
      ensureIsFunctionOrAsync(beforeAllFunction, 'beforeAll');

      if (timeout) {
        j$.util.validateTimeout(timeout);
      }

      currentDeclarationSuite.beforeAll({
        fn: beforeAllFunction,
        timeout: timeout || 0
      });
    };

    this.afterEach = function(afterEachFunction, timeout) {
      ensureIsNotNested('afterEach');
      ensureIsFunctionOrAsync(afterEachFunction, 'afterEach');

      if (timeout) {
        j$.util.validateTimeout(timeout);
      }

      afterEachFunction.isCleanup = true;
      currentDeclarationSuite.afterEach({
        fn: afterEachFunction,
        timeout: timeout || 0
      });
    };

    this.afterAll = function(afterAllFunction, timeout) {
      ensureIsNotNested('afterAll');
      ensureIsFunctionOrAsync(afterAllFunction, 'afterAll');

      if (timeout) {
        j$.util.validateTimeout(timeout);
      }

      currentDeclarationSuite.afterAll({
        fn: afterAllFunction,
        timeout: timeout || 0
      });
    };

    this.pending = function(message) {
      let fullMessage = j$.Spec.pendingSpecExceptionMessage;
      if (message) {
        fullMessage += message;
      }
      throw fullMessage;
    };

    this.fail = function(error) {
      if (!currentRunnable()) {
        throw new Error(
          "'fail' was used when there was no current spec, this could be because an asynchronous test timed out"
        );
      }

      let message = 'Failed';
      if (error) {
        message += ': ';
        if (error.message) {
          message += error.message;
        } else if (j$.isString_(error)) {
          message += error;
        } else {
          // pretty print all kind of objects. This includes arrays.
          const pp = runnableResources.makePrettyPrinter();
          message += pp(error);
        }
      }

      currentRunnable().addExpectationResult(false, {
        matcherName: '',
        passed: false,
        expected: '',
        actual: '',
        message: message,
        error: error && error.message ? error : null
      });

      if (config.stopSpecOnExpectationFailure) {
        throw new Error(message);
      }
    };

    this.cleanup_ = function() {
      if (globalErrors) {
        globalErrors.uninstall();
      }
    };
  }

  return Env;
};
