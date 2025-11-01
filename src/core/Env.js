getJasmineRequireObj().Env = function(j$) {
  const DEFAULT_IT_DESCRIBE_STACK_DEPTH = 3;

  /**
   * @class Env
   * @since 2.0.0
   * @classdesc The Jasmine environment.<br>
   * _Note:_ Do not construct this directly. You can obtain the Env instance by
   * calling {@link jasmine.getEnv}.
   * @hideconstructor
   */
  function Env(envOptions) {
    envOptions = envOptions || {};

    const self = this;
    const GlobalErrors = envOptions.GlobalErrors || j$.GlobalErrors;
    const global = envOptions.global || j$.getGlobal();

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

    const globalErrors = new GlobalErrors(
      undefined,
      // Configuration is late-bound because GlobalErrors needs to be constructed
      // before it's set to detect load-time errors in browsers
      () => this.configuration()
    );
    const { installGlobalErrors, uninstallGlobalErrors } = (function() {
      let installed = false;

      return {
        installGlobalErrors() {
          if (!installed) {
            globalErrors.install();
            installed = true;
          }
        },
        uninstallGlobalErrors() {
          if (installed) {
            globalErrors.uninstall();
            installed = false;
          }
        }
      };
    })();

    const runableResources = new j$.RunableResources({
      getCurrentRunableId: function() {
        const r = runner.currentRunable();
        return r ? r.id : null;
      },
      globalErrors
    });

    let reportDispatcher;
    let topSuite;
    let runner;
    let parallelLoadingState = null; // 'specs', 'helpers', or null for non-parallel

    const config = new j$.Configuration();

    if (!envOptions.suppressLoadErrors) {
      installGlobalErrors();
      globalErrors.pushListener(function loadtimeErrorHandler(error, event) {
        topSuite.result.failedExpectations.push({
          passed: false,
          globalErrorType: 'load',
          message: error ? error.message : event.message,
          stack: error && error.stack,
          filename: event && event.filename,
          lineno: event && event.lineno
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
    this.configure = function(changes) {
      if (parallelLoadingState) {
        throw new Error(
          'Jasmine cannot be configured via Env in parallel mode'
        );
      }

      config.update(changes);
      deprecator.verboseDeprecations(config.verboseDeprecations);
    };

    /**
     * Get the current configuration for your jasmine environment
     * @name Env#configuration
     * @since 3.3.0
     * @function
     * @returns {Configuration}
     */
    this.configuration = function() {
      return config.copy();
    };

    this.setDefaultSpyStrategy = function(defaultStrategyFn) {
      runableResources.setDefaultSpyStrategy(defaultStrategyFn);
    };

    this.addSpyStrategy = function(name, fn) {
      runableResources.customSpyStrategies()[name] = fn;
    };

    this.addCustomEqualityTester = function(tester) {
      runableResources.customEqualityTesters().push(tester);
    };

    this.addMatchers = function(matchersToAdd) {
      runableResources.addCustomMatchers(matchersToAdd);
    };

    this.addAsyncMatchers = function(matchersToAdd) {
      runableResources.addCustomAsyncMatchers(matchersToAdd);
    };

    this.addCustomObjectFormatter = function(formatter) {
      runableResources.customObjectFormatters().push(formatter);
    };

    j$.Expectation.addCoreMatchers(j$.matchers);
    j$.Expectation.addAsyncCoreMatchers(j$.asyncMatchers);

    const expectationFactory = function(actual, spec) {
      return j$.Expectation.factory({
        matchersUtil: runableResources.makeMatchersUtil(),
        customMatchers: runableResources.customMatchers(),
        actual: actual,
        addExpectationResult: addExpectationResult
      });

      function addExpectationResult(passed, result) {
        return spec.addExpectationResult(passed, result);
      }
    };

    const handleThrowUnlessFailure = function(passed, result) {
      if (!passed) {
        /**
         * @interface
         * @name ThrowUnlessFailure
         * @extends Error
         * @description Represents a failure of an expectation evaluated with
         * {@link throwUnless}. Properties of this error are a subset of the
         * properties of {@link ExpectationResult} and have the same values.
         *
         * Note: The expected and actual properties are deprecated and may be removed
         * in a future release. In many Jasmine configurations they are passed
         * through JSON serialization and deserialization, which is inherently
         * lossy. In such cases, the expected and actual values may be placeholders
         * or approximations of the original objects.
         *
         * @property {String} matcherName - The name of the matcher that was executed for this expectation.
         * @property {String} message - The failure message for the expectation.
         * @property {Boolean} passed - Whether the expectation passed or failed.
         * @property {Object} expected - Deprecated. If the expectation failed, what was the expected value.
         * @property {Object} actual - Deprecated. If the expectation failed, what actual value was produced.
         */
        const error = new Error(result.message);
        error.passed = result.passed;
        error.message = result.message;
        error.expected = result.expected;
        error.actual = result.actual;
        error.matcherName = result.matcherName;
        throw error;
      }
    };

    const throwUnlessFactory = function(actual, spec) {
      return j$.Expectation.factory({
        matchersUtil: runableResources.makeMatchersUtil(),
        customMatchers: runableResources.customMatchers(),
        actual: actual,
        addExpectationResult: handleThrowUnlessFailure
      });
    };

    const throwUnlessAsyncFactory = function(actual, spec) {
      return j$.Expectation.asyncFactory({
        matchersUtil: runableResources.makeMatchersUtil(),
        customAsyncMatchers: runableResources.customAsyncMatchers(),
        actual: actual,
        addExpectationResult: handleThrowUnlessFailure
      });
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
      for (let r = runner.currentRunable(); r; r = r.parentSuite) {
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
      // eslint-disable-next-line no-console
      console.error('Jasmine received a result after the suite finished:');
      // eslint-disable-next-line no-console
      console.error(expectationResult);
    }

    const asyncExpectationFactory = function(actual, spec, runableType) {
      return j$.Expectation.asyncFactory({
        matchersUtil: runableResources.makeMatchersUtil(),
        customAsyncMatchers: runableResources.customAsyncMatchers(),
        actual: actual,
        addExpectationResult: addExpectationResult
      });

      function addExpectationResult(passed, result) {
        if (runner.currentRunable() !== spec) {
          recordLateExpectation(spec, runableType, result);
        }
        return spec.addExpectationResult(passed, result);
      }
    };

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
      const runable = runner.currentRunable() || topSuite;
      deprecator.addDeprecationWarning(runable, deprecation, options);
    };

    function runQueue(options) {
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
          (runner.currentRunable() || topSuite).handleException(e);
        };

      new j$.QueueRunner(options).execute();
    }

    const suiteBuilder = new j$.SuiteBuilder({
      env: this,
      expectationFactory,
      asyncExpectationFactory,
      onLateError: recordLateError,
      runQueue
    });
    topSuite = suiteBuilder.topSuite;
    const deprecator = new j$.Deprecator(topSuite);

    /**
     * Provides the root suite, through which all suites and specs can be
     * accessed.
     * @function
     * @name Env#topSuite
     * @return {Suite} the root suite
     * @since 2.0.0
     */
    this.topSuite = function() {
      ensureNonParallel('topSuite');
      return topSuite.metadata;
    };

    /**
     * This represents the available reporter callback for an object passed to {@link Env#addReporter}.
     * @interface Reporter
     * @see custom_reporter
     */
    reportDispatcher = new j$.ReportDispatcher(
      j$.reporterEvents,
      function(options) {
        options.SkipPolicy = j$.NeverSkipPolicy;
        return runQueue(options);
      },
      recordLateError
    );

    runner = new j$.Runner({
      topSuite,
      totalSpecsDefined: () => suiteBuilder.totalSpecsDefined,
      focusedRunables: () => suiteBuilder.focusedRunables,
      runableResources,
      reportDispatcher,
      runQueue,
      TreeProcessor: j$.TreeProcessor,
      globalErrors,
      getConfig: () => config
    });

    this.setParallelLoadingState = function(state) {
      parallelLoadingState = state;
    };

    this.parallelReset = function() {
      suiteBuilder.parallelReset();
      runner.parallelReset();
    };

    /**
     * Executes the specs.
     *
     * If called with no parameter or with a falsy parameter,
     * all specs will be executed except those that are excluded by a
     * [spec filter]{@link Configuration#specFilter} or other mechanism. If the
     * parameter is a list of spec/suite IDs, only those specs/suites will
     * be run.
     *
     * execute should not be called more than once unless the env has been
     * configured with `{autoCleanClosures: false}`.
     *
     * execute returns a promise. The promise will be resolved to the same
     * {@link JasmineDoneInfo|overall result} that's passed to a reporter's
     * `jasmineDone` method, even if the suite did not pass. To determine
     * whether the suite passed, check the value that the promise resolves to
     * or use a {@link Reporter}. The promise will be rejected in the case of
     * certain serious errors that prevent execution from starting.
     *
     * @name Env#execute
     * @since 2.0.0
     * @function
     * @async
     * @param {(string[])=} runablesToRun IDs of suites and/or specs to run
     * @return {Promise<JasmineDoneInfo>}
     */
    this.execute = async function(runablesToRun) {
      installGlobalErrors();

      if (parallelLoadingState) {
        validateConfigForParallel();
      }

      const result = await runner.execute(runablesToRun);
      this.cleanup_();
      return result;
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
      if (parallelLoadingState) {
        throw new Error('Reporters cannot be added via Env in parallel mode');
      }

      reportDispatcher.addReporter(reporterToAdd);
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
      reportDispatcher.provideFallbackReporter(reporterToAdd);
    };

    /**
     * Clear all registered reporters
     * @name Env#clearReporters
     * @since 2.5.2
     * @function
     */
    this.clearReporters = function() {
      if (parallelLoadingState) {
        throw new Error('Reporters cannot be removed via Env in parallel mode');
      }

      reportDispatcher.clearReporters();
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
      runableResources.spyRegistry.allowRespy(allow);
    };

    this.spyOn = function() {
      return runableResources.spyRegistry.spyOn.apply(
        runableResources.spyRegistry,
        arguments
      );
    };

    this.spyOnProperty = function() {
      return runableResources.spyRegistry.spyOnProperty.apply(
        runableResources.spyRegistry,
        arguments
      );
    };

    this.spyOnAllFunctions = function() {
      return runableResources.spyRegistry.spyOnAllFunctions.apply(
        runableResources.spyRegistry,
        arguments
      );
    };

    this.createSpy = function(name, originalFn) {
      return runableResources.spyFactory.createSpy(name, originalFn);
    };

    this.createSpyObj = function(baseName, methodNames, propertyNames) {
      return runableResources.spyFactory.createSpyObj(
        baseName,
        methodNames,
        propertyNames
      );
    };

    this.spyOnGlobalErrorsAsync = async function(fn) {
      const spy = this.createSpy('global error handler');
      const associatedRunable = runner.currentRunable();
      let cleanedUp = false;

      globalErrors.setOverrideListener(spy, () => {
        if (!cleanedUp) {
          const message =
            'Global error spy was not uninstalled. (Did you ' +
            'forget to await the return value of spyOnGlobalErrorsAsync?)';
          associatedRunable.addExpectationResult(false, {
            matcherName: '',
            passed: false,
            expected: '',
            actual: '',
            message,
            error: null
          });
        }

        cleanedUp = true;
      });

      try {
        const maybePromise = fn(spy);

        if (!j$.isPromiseLike(maybePromise)) {
          throw new Error(
            'The callback to spyOnGlobalErrorsAsync must be an async or promise-returning function'
          );
        }

        await maybePromise;
      } finally {
        if (!cleanedUp) {
          cleanedUp = true;
          globalErrors.removeOverrideListener();
        }
      }
    };

    function ensureIsNotNested(method) {
      const runable = runner.currentRunable();
      if (runable !== null && runable !== undefined) {
        throw new Error(
          "'" + method + "' should only be used in 'describe' function"
        );
      }
    }

    function ensureNonParallel(method) {
      if (parallelLoadingState) {
        throw new Error(`'${method}' is not available in parallel mode`);
      }
    }

    function ensureNonParallelOrInDescribe(msg) {
      if (parallelLoadingState && !suiteBuilder.inDescribe()) {
        throw new Error(msg);
      }
    }

    function ensureNonParallelOrInHelperOrInDescribe(method) {
      if (parallelLoadingState === 'specs' && !suiteBuilder.inDescribe()) {
        throw new Error(
          'In parallel mode, ' +
            method +
            ' must be in a describe block or in a helper file'
        );
      }
    }

    function validateConfigForParallel() {
      if (!config.random) {
        throw new Error('Randomization cannot be disabled in parallel mode');
      }

      if (config.seed !== null && config.seed !== undefined) {
        throw new Error('Random seed cannot be set in parallel mode');
      }
    }

    this.describe = function(description, definitionFn) {
      ensureIsNotNested('describe');
      const filename = indirectCallerFilename(describeStackDepth());
      return suiteBuilder.describe(description, definitionFn, filename)
        .metadata;
    };

    this.xdescribe = function(description, definitionFn) {
      ensureIsNotNested('xdescribe');
      const filename = indirectCallerFilename(describeStackDepth());
      return suiteBuilder.xdescribe(description, definitionFn, filename)
        .metadata;
    };

    this.fdescribe = function(description, definitionFn) {
      ensureIsNotNested('fdescribe');
      ensureNonParallel('fdescribe');
      const filename = indirectCallerFilename(describeStackDepth());
      return suiteBuilder.fdescribe(description, definitionFn, filename)
        .metadata;
    };

    this.it = function(description, fn, timeout) {
      ensureIsNotNested('it');
      const filename = indirectCallerFilename(itStackDepth());
      return suiteBuilder.it(description, fn, timeout, filename).metadata;
    };

    this.xit = function(description, fn, timeout) {
      ensureIsNotNested('xit');
      const filename = indirectCallerFilename(itStackDepth());
      return suiteBuilder.xit(description, fn, timeout, filename).metadata;
    };

    this.fit = function(description, fn, timeout) {
      ensureIsNotNested('fit');
      ensureNonParallel('fit');
      const filename = indirectCallerFilename(itStackDepth());
      return suiteBuilder.fit(description, fn, timeout, filename).metadata;
    };

    function itStackDepth() {
      return DEFAULT_IT_DESCRIBE_STACK_DEPTH + config.extraItStackFrames;
    }

    function describeStackDepth() {
      return DEFAULT_IT_DESCRIBE_STACK_DEPTH + config.extraDescribeStackFrames;
    }

    /**
     * Get a user-defined property as part of the properties field of {@link SpecResult}
     * @name Env#getSpecProperty
     * @since 5.10.0
     * @function
     * @param {String} key The name of the property
     * @returns {*} The value of the property
     */
    this.getSpecProperty = function(key) {
      if (
        !runner.currentRunable() ||
        runner.currentRunable() == runner.currentSuite()
      ) {
        throw new Error(
          "'getSpecProperty' was used when there was no current spec"
        );
      }
      return runner.currentRunable().getSpecProperty(key);
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
      if (
        !runner.currentRunable() ||
        runner.currentRunable() == runner.currentSuite()
      ) {
        throw new Error(
          "'setSpecProperty' was used when there was no current spec"
        );
      }
      runner.currentRunable().setSpecProperty(key, value);
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
      if (!runner.currentSuite()) {
        throw new Error(
          "'setSuiteProperty' was used when there was no current suite"
        );
      }
      runner.currentSuite().setSuiteProperty(key, value);
    };

    this.debugLog = function(msg) {
      const maybeSpec = runner.currentRunable();

      if (!maybeSpec || !maybeSpec.debugLog) {
        throw new Error("'debugLog' was called when there was no current spec");
      }

      maybeSpec.debugLog(msg);
    };

    this.expect = function(actual) {
      const runable = runner.currentRunable();

      if (!runable) {
        throw new Error(
          "'expect' was used when there was no current spec, this could be because an asynchronous test timed out"
        );
      }

      return runable.expectationFactory(actual, runable);
    };

    this.expectAsync = function(actual) {
      const runable = runner.currentRunable();

      if (!runable) {
        throw new Error(
          "'expectAsync' was used when there was no current spec, this could be because an asynchronous test timed out"
        );
      }

      return runable.asyncExpectationFactory(actual, runable);
    };

    this.throwUnless = function(actual) {
      const runable = runner.currentRunable();
      return throwUnlessFactory(actual, runable);
    };

    this.throwUnlessAsync = function(actual) {
      const runable = runner.currentRunable();
      return throwUnlessAsyncFactory(actual, runable);
    };

    this.beforeEach = function(beforeEachFunction, timeout) {
      ensureIsNotNested('beforeEach');
      ensureNonParallelOrInHelperOrInDescribe('beforeEach');
      suiteBuilder.beforeEach(beforeEachFunction, timeout);
    };

    this.beforeAll = function(beforeAllFunction, timeout) {
      ensureIsNotNested('beforeAll');
      // This message is -npm-specific, but currently parallel operation is
      // only supported via -npm.
      ensureNonParallelOrInDescribe(
        "In parallel mode, 'beforeAll' " +
          'must be in a describe block. Use the globalSetup config ' +
          'property for exactly-once setup in parallel mode.'
      );
      suiteBuilder.beforeAll(beforeAllFunction, timeout);
    };

    this.afterEach = function(afterEachFunction, timeout) {
      ensureIsNotNested('afterEach');
      ensureNonParallelOrInHelperOrInDescribe('afterEach');
      suiteBuilder.afterEach(afterEachFunction, timeout);
    };

    this.afterAll = function(afterAllFunction, timeout) {
      ensureIsNotNested('afterAll');
      // This message is -npm-specific, but currently parallel operation is
      // only supported via -npm.
      ensureNonParallelOrInDescribe(
        "In parallel mode, 'afterAll' " +
          'must be in a describe block. Use the globalTeardown config ' +
          'property for exactly-once teardown in parallel mode.'
      );
      suiteBuilder.afterAll(afterAllFunction, timeout);
    };

    this.pending = function(message) {
      let fullMessage = j$.Spec.pendingSpecExceptionMessage;
      if (message) {
        fullMessage += message;
      }
      throw fullMessage;
    };

    this.fail = function(error) {
      if (!runner.currentRunable()) {
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
          const pp = runableResources.makePrettyPrinter();
          message += pp(error);
        }
      }

      runner.currentRunable().addExpectationResult(false, {
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
      uninstallGlobalErrors();
    };
  }

  function indirectCallerFilename(depth) {
    const frames = new j$.StackTrace(new Error()).frames;
    // The specified frame should always exist except in Jasmine's own tests,
    // which bypass the global it/describe layer, but could be absent in case
    // of misconfiguration. Don't crash if it's absent.
    return frames[depth] && frames[depth].file;
  }

  return Env;
};
