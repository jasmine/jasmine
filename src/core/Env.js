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

    var self = this;
    var global = options.global || j$.getGlobal();
    var customPromise;

    var totalSpecsDefined = 0;

    var realSetTimeout = global.setTimeout;
    var realClearTimeout = global.clearTimeout;
    var clearStack = j$.getClearStack(global);
    this.clock = new j$.Clock(
      global,
      function() {
        return new j$.DelayedFunctionScheduler();
      },
      new j$.MockDate(global)
    );

    var runnableResources = {};

    var currentSpec = null;
    var currentlyExecutingSuites = [];
    var currentDeclarationSuite = null;
    var hasFailures = false;

    /**
     * This represents the available options to configure Jasmine.
     * Options that are not provided will use their default values.
     * @see Env#configure
     * @interface Configuration
     * @since 3.3.0
     */
    var config = {
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
       * @name Configuration#failFast
       * @since 3.3.0
       * @type Boolean
       * @default false
       * @deprecated Use the `stopOnSpecFailure` config property instead.
       */
      failFast: false,
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
       * @name Configuration#oneFailurePerSpec
       * @since 3.3.0
       * @type Boolean
       * @default false
       * @deprecated Use the `stopSpecOnExpectationFailure` config property instead.
       */
      oneFailurePerSpec: false,
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
       * Set to provide a custom promise library that Jasmine will use if it needs
       * to create a promise. If not set, it will default to whatever global Promise
       * library is available (if any).
       * @name Configuration#Promise
       * @since 3.5.0
       * @type function
       * @default undefined
       * @deprecated In a future version, Jasmine will ignore the Promise config
       * property and always create native promises instead.
       */
      Promise: undefined,
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

    var currentSuite = function() {
      return currentlyExecutingSuites[currentlyExecutingSuites.length - 1];
    };

    var currentRunnable = function() {
      return currentSpec || currentSuite();
    };

    var globalErrors = null;

    var installGlobalErrors = function() {
      if (globalErrors) {
        return;
      }

      globalErrors = new j$.GlobalErrors();
      globalErrors.install();
    };

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
      var booleanProps = [
        'random',
        'failSpecWithNoExpectations',
        'hideDisabled',
        'autoCleanClosures'
      ];

      booleanProps.forEach(function(prop) {
        if (typeof configuration[prop] !== 'undefined') {
          config[prop] = !!configuration[prop];
        }
      });

      if (typeof configuration.failFast !== 'undefined') {
        // We can't unconditionally issue a warning here because then users who
        // get the configuration from Jasmine, modify it, and pass it back would
        // see the warning.
        if (configuration.failFast !== config.failFast) {
          this.deprecated(
            'The `failFast` config property is deprecated and will be removed ' +
              'in a future version of Jasmine. Please use `stopOnSpecFailure` ' +
              'instead.',
            { ignoreRunnable: true }
          );
        }

        if (typeof configuration.stopOnSpecFailure !== 'undefined') {
          if (configuration.stopOnSpecFailure !== configuration.failFast) {
            throw new Error(
              'stopOnSpecFailure and failFast are aliases for ' +
                "each other. Don't set failFast if you also set stopOnSpecFailure."
            );
          }
        }

        config.failFast = configuration.failFast;
        config.stopOnSpecFailure = configuration.failFast;
      } else if (typeof configuration.stopOnSpecFailure !== 'undefined') {
        config.failFast = configuration.stopOnSpecFailure;
        config.stopOnSpecFailure = configuration.stopOnSpecFailure;
      }

      if (typeof configuration.oneFailurePerSpec !== 'undefined') {
        // We can't unconditionally issue a warning here because then users who
        // get the configuration from Jasmine, modify it, and pass it back would
        // see the warning.
        if (configuration.oneFailurePerSpec !== config.oneFailurePerSpec) {
          this.deprecated(
            'The `oneFailurePerSpec` config property is deprecated and will be ' +
              'removed in a future version of Jasmine. Please use ' +
              '`stopSpecOnExpectationFailure` instead.',
            { ignoreRunnable: true }
          );
        }

        if (typeof configuration.stopSpecOnExpectationFailure !== 'undefined') {
          if (
            configuration.stopSpecOnExpectationFailure !==
            configuration.oneFailurePerSpec
          ) {
            throw new Error(
              'stopSpecOnExpectationFailure and oneFailurePerSpec are aliases for ' +
                "each other. Don't set oneFailurePerSpec if you also set stopSpecOnExpectationFailure."
            );
          }
        }

        config.oneFailurePerSpec = configuration.oneFailurePerSpec;
        config.stopSpecOnExpectationFailure = configuration.oneFailurePerSpec;
      } else if (
        typeof configuration.stopSpecOnExpectationFailure !== 'undefined'
      ) {
        config.oneFailurePerSpec = configuration.stopSpecOnExpectationFailure;
        config.stopSpecOnExpectationFailure =
          configuration.stopSpecOnExpectationFailure;
      }

      if (configuration.specFilter) {
        config.specFilter = configuration.specFilter;
      }

      if (typeof configuration.seed !== 'undefined') {
        config.seed = configuration.seed;
      }

      // Don't use hasOwnProperty to check for Promise existence because Promise
      // can be initialized to undefined, either explicitly or by using the
      // object returned from Env#configuration. In particular, Karma does this.
      if (configuration.Promise) {
        if (
          typeof configuration.Promise.resolve === 'function' &&
          typeof configuration.Promise.reject === 'function'
        ) {
          customPromise = configuration.Promise;
          self.deprecated(
            'The `Promise` config property is deprecated. Future versions ' +
              'of Jasmine will create native promises even if the `Promise` ' +
              'config property is set. Please remove it.'
          );
        } else {
          throw new Error(
            'Custom promise library missing `resolve`/`reject` functions'
          );
        }
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
      var result = {};
      for (var property in config) {
        result[property] = config[property];
      }
      return result;
    };

    Object.defineProperty(this, 'specFilter', {
      get: function() {
        self.deprecated(
          'Getting specFilter directly from Env is deprecated and will be ' +
            'removed in a future version of Jasmine. Please check the ' +
            'specFilter option from `configuration` instead.',
          { ignoreRunnable: true }
        );
        return config.specFilter;
      },
      set: function(val) {
        self.deprecated(
          'Setting specFilter directly on Env is deprecated and will be ' +
            'removed in a future version of Jasmine. Please use the ' +
            'specFilter option in `configure` instead.',
          { ignoreRunnable: true }
        );
        config.specFilter = val;
      }
    });

    this.setDefaultSpyStrategy = function(defaultStrategyFn) {
      if (!currentRunnable()) {
        throw new Error(
          'Default spy strategy must be set in a before function or a spec'
        );
      }
      runnableResources[
        currentRunnable().id
      ].defaultStrategyFn = defaultStrategyFn;
    };

    this.addSpyStrategy = function(name, fn) {
      if (!currentRunnable()) {
        throw new Error(
          'Custom spy strategies must be added in a before function or a spec'
        );
      }
      runnableResources[currentRunnable().id].customSpyStrategies[name] = fn;
    };

    this.addCustomEqualityTester = function(tester) {
      if (!currentRunnable()) {
        throw new Error(
          'Custom Equalities must be added in a before function or a spec'
        );
      }
      runnableResources[currentRunnable().id].customEqualityTesters.push(
        tester
      );
    };

    this.addMatchers = function(matchersToAdd) {
      if (!currentRunnable()) {
        throw new Error(
          'Matchers must be added in a before function or a spec'
        );
      }
      var customMatchers =
        runnableResources[currentRunnable().id].customMatchers;

      for (var matcherName in matchersToAdd) {
        if (matchersToAdd[matcherName].length > 1) {
          self.deprecated(
            'The matcher factory for "' +
              matcherName +
              '" ' +
              'accepts custom equality testers, but this parameter will no longer be ' +
              'passed in a future release. ' +
              'See <https://jasmine.github.io/tutorials/upgrading_to_Jasmine_4.0#matchers-cet> for details.'
          );
        }

        customMatchers[matcherName] = matchersToAdd[matcherName];
      }
    };

    this.addAsyncMatchers = function(matchersToAdd) {
      if (!currentRunnable()) {
        throw new Error(
          'Async Matchers must be added in a before function or a spec'
        );
      }
      var customAsyncMatchers =
        runnableResources[currentRunnable().id].customAsyncMatchers;

      for (var matcherName in matchersToAdd) {
        if (matchersToAdd[matcherName].length > 1) {
          self.deprecated(
            'The matcher factory for "' +
              matcherName +
              '" ' +
              'accepts custom equality testers, but this parameter will no longer be ' +
              'passed in a future release. ' +
              'See <https://jasmine.github.io/tutorials/upgrading_to_Jasmine_4.0#matchers-cet> for details.'
          );
        }

        customAsyncMatchers[matcherName] = matchersToAdd[matcherName];
      }
    };

    this.addCustomObjectFormatter = function(formatter) {
      if (!currentRunnable()) {
        throw new Error(
          'Custom object formatters must be added in a before function or a spec'
        );
      }

      runnableResources[currentRunnable().id].customObjectFormatters.push(
        formatter
      );
    };

    j$.Expectation.addCoreMatchers(j$.matchers);
    j$.Expectation.addAsyncCoreMatchers(j$.asyncMatchers);

    var nextSpecId = 0;
    var getNextSpecId = function() {
      return 'spec' + nextSpecId++;
    };

    var nextSuiteId = 0;
    var getNextSuiteId = function() {
      return 'suite' + nextSuiteId++;
    };

    var makePrettyPrinter = function() {
      var customObjectFormatters =
        runnableResources[currentRunnable().id].customObjectFormatters;
      return j$.makePrettyPrinter(customObjectFormatters);
    };

    var makeMatchersUtil = function() {
      var customEqualityTesters =
        runnableResources[currentRunnable().id].customEqualityTesters;
      return new j$.MatchersUtil({
        customTesters: customEqualityTesters,
        pp: makePrettyPrinter()
      });
    };

    var expectationFactory = function(actual, spec) {
      var customEqualityTesters =
        runnableResources[spec.id].customEqualityTesters;

      return j$.Expectation.factory({
        matchersUtil: makeMatchersUtil(),
        customEqualityTesters: customEqualityTesters,
        customMatchers: runnableResources[spec.id].customMatchers,
        actual: actual,
        addExpectationResult: addExpectationResult
      });

      function addExpectationResult(passed, result) {
        return spec.addExpectationResult(passed, result);
      }
    };

    function recordLateExpectation(runable, runableType, result) {
      var delayedExpectationResult = {};
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

    var asyncExpectationFactory = function(actual, spec, runableType) {
      return j$.Expectation.asyncFactory({
        matchersUtil: makeMatchersUtil(),
        customEqualityTesters: runnableResources[spec.id].customEqualityTesters,
        customAsyncMatchers: runnableResources[spec.id].customAsyncMatchers,
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
    var suiteAsyncExpectationFactory = function(actual, suite) {
      return asyncExpectationFactory(actual, suite, 'Suite');
    };

    var specAsyncExpectationFactory = function(actual, suite) {
      return asyncExpectationFactory(actual, suite, 'Spec');
    };

    var defaultResourcesForRunnable = function(id, parentRunnableId) {
      var resources = {
        spies: [],
        customEqualityTesters: [],
        customMatchers: {},
        customAsyncMatchers: {},
        customSpyStrategies: {},
        defaultStrategyFn: undefined,
        customObjectFormatters: []
      };

      if (runnableResources[parentRunnableId]) {
        resources.customEqualityTesters = j$.util.clone(
          runnableResources[parentRunnableId].customEqualityTesters
        );
        resources.customMatchers = j$.util.clone(
          runnableResources[parentRunnableId].customMatchers
        );
        resources.customAsyncMatchers = j$.util.clone(
          runnableResources[parentRunnableId].customAsyncMatchers
        );
        resources.customObjectFormatters = j$.util.clone(
          runnableResources[parentRunnableId].customObjectFormatters
        );
        resources.defaultStrategyFn =
          runnableResources[parentRunnableId].defaultStrategyFn;
      }

      runnableResources[id] = resources;
    };

    var clearResourcesForRunnable = function(id) {
      spyRegistry.clearSpies();
      delete runnableResources[id];
    };

    var beforeAndAfterFns = function(targetSuite) {
      return function() {
        var befores = [],
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
    };

    var getSpecName = function(spec, suite) {
      var fullName = [spec.description],
        suiteFullName = suite.getFullName();

      if (suiteFullName !== '') {
        fullName.unshift(suiteFullName);
      }
      return fullName.join(' ');
    };

    // TODO: we may just be able to pass in the fn instead of wrapping here
    var buildExpectationResult = j$.buildExpectationResult,
      exceptionFormatter = new j$.ExceptionFormatter(),
      expectationResultFactory = function(attrs) {
        attrs.messageFormatter = exceptionFormatter.message;
        attrs.stackFormatter = exceptionFormatter.stack;

        return buildExpectationResult(attrs);
      };

    /**
     * Sets whether Jasmine should throw an Error when an expectation fails.
     * This causes a spec to only have one expectation failure.
     * @name Env#throwOnExpectationFailure
     * @since 2.3.0
     * @function
     * @param {Boolean} value Whether to throw when a expectation fails
     * @deprecated Use the `stopSpecOnExpectationFailure` option with {@link Env#configure}
     */
    this.throwOnExpectationFailure = function(value) {
      this.deprecated(
        'Setting throwOnExpectationFailure directly on Env is deprecated and ' +
          'will be removed in a future version of Jasmine. Please use the ' +
          'stopSpecOnExpectationFailure option in `configure`.',
        { ignoreRunnable: true }
      );
      this.configure({ oneFailurePerSpec: !!value });
    };

    this.throwingExpectationFailures = function() {
      this.deprecated(
        'Getting throwingExpectationFailures directly from Env is deprecated ' +
          'and will be removed in a future version of Jasmine. Please check ' +
          'the stopSpecOnExpectationFailure option from `configuration`.',
        { ignoreRunnable: true }
      );
      return config.oneFailurePerSpec;
    };

    /**
     * Set whether to stop suite execution when a spec fails
     * @name Env#stopOnSpecFailure
     * @since 2.7.0
     * @function
     * @param {Boolean} value Whether to stop suite execution when a spec fails
     * @deprecated Use the `stopOnSpecFailure` option with {@link Env#configure}
     */
    this.stopOnSpecFailure = function(value) {
      this.deprecated(
        'Setting stopOnSpecFailure directly is deprecated and will be ' +
          'removed in a future version of Jasmine. Please use the ' +
          'stopOnSpecFailure option in `configure`.',
        { ignoreRunnable: true }
      );
      this.configure({ stopOnSpecFailure: !!value });
    };

    this.stoppingOnSpecFailure = function() {
      this.deprecated(
        'Getting stoppingOnSpecFailure directly from Env is deprecated and ' +
          'will be removed in a future version of Jasmine. Please check the ' +
          'stopOnSpecFailure option from `configuration`.',
        { ignoreRunnable: true }
      );
      return config.failFast;
    };

    /**
     * Set whether to randomize test execution order
     * @name Env#randomizeTests
     * @since 2.4.0
     * @function
     * @param {Boolean} value Whether to randomize execution order
     * @deprecated Use the `random` option with {@link Env#configure}
     */
    this.randomizeTests = function(value) {
      this.deprecated(
        'Setting randomizeTests directly is deprecated and will be removed ' +
          'in a future version of Jasmine. Please use the random option in ' +
          '`configure` instead.',
        { ignoreRunnable: true }
      );
      config.random = !!value;
    };

    this.randomTests = function() {
      this.deprecated(
        'Getting randomTests directly from Env is deprecated and will be ' +
          'removed in a future version of Jasmine. Please check the random ' +
          'option from `configuration` instead.',
        { ignoreRunnable: true }
      );
      return config.random;
    };

    /**
     * Set the random number seed for spec randomization
     * @name Env#seed
     * @since 2.4.0
     * @function
     * @param {Number} value The seed value
     * @deprecated Use the `seed` option with {@link Env#configure}
     */
    this.seed = function(value) {
      this.deprecated(
        'Setting seed directly is deprecated and will be removed in a ' +
          'future version of Jasmine. Please use the seed option in ' +
          '`configure` instead.',
        { ignoreRunnable: true }
      );
      if (value) {
        config.seed = value;
      }
      return config.seed;
    };

    this.hidingDisabled = function(value) {
      this.deprecated(
        'Getting hidingDisabled directly from Env is deprecated and will ' +
          'be removed in a future version of Jasmine. Please check the ' +
          'hideDisabled option from `configuration` instead.',
        { ignoreRunnable: true }
      );
      return config.hideDisabled;
    };

    /**
     * @name Env#hideDisabled
     * @since 3.2.0
     * @function
     * @deprecated Use the `hideDisabled` option with {@link Env#configure}
     */
    this.hideDisabled = function(value) {
      this.deprecated(
        'Setting hideDisabled directly is deprecated and will be removed ' +
          'in a future version of Jasmine. Please use the hideDisabled option ' +
          'in `configure` instead.',
        { ignoreRunnable: true }
      );
      config.hideDisabled = !!value;
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
      var runnable = currentRunnable() || topSuite;
      deprecator.addDeprecationWarning(runnable, deprecation, options);
    };

    var queueRunnerFactory = function(options, args) {
      var failFast = false;
      if (options.isLeaf) {
        failFast = config.stopSpecOnExpectationFailure;
      } else if (!options.isReporter) {
        failFast = config.stopOnSpecFailure;
      }
      options.clearStack = options.clearStack || clearStack;
      options.timeout = {
        setTimeout: realSetTimeout,
        clearTimeout: realClearTimeout
      };
      options.fail = self.fail;
      options.globalErrors = globalErrors;
      options.completeOnFirstError = failFast;
      options.onException =
        options.onException ||
        function(e) {
          (currentRunnable() || topSuite).onException(e);
        };
      options.deprecated = self.deprecated;

      new j$.QueueRunner(options).execute(args);
    };

    var topSuite = new j$.Suite({
      env: this,
      id: getNextSuiteId(),
      description: 'Jasmine__TopLevel__Suite',
      expectationFactory: expectationFactory,
      asyncExpectationFactory: suiteAsyncExpectationFactory,
      expectationResultFactory: expectationResultFactory,
      autoCleanClosures: config.autoCleanClosures
    });
    var deprecator = new j$.Deprecator(topSuite);
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
      return j$.deprecatingSuiteProxy(topSuite, null, this);
    };

    /**
     * This represents the available reporter callback for an object passed to {@link Env#addReporter}.
     * @interface Reporter
     * @see custom_reporter
     */
    var reporter = new j$.ReportDispatcher(
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
      self.deprecated
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
     * specs/suites to run, pass null or undefined as the first parameter.
     *
     * execute should not be called more than once.
     *
     * If the environment supports promises, execute will return a promise that
     * is resolved after the suite finishes executing. The promise will be
     * resolved (not rejected) as long as the suite runs to completion. Use a
     * {@link Reporter} to determine whether or not the suite passed.
     *
     * @name Env#execute
     * @since 2.0.0
     * @function
     * @param {(string[])=} runnablesToRun IDs of suites and/or specs to run
     * @param {Function=} onComplete Function that will be called after all specs have run
     * @return {Promise<undefined>}
     */
    this.execute = function(runnablesToRun, onComplete) {
      if (this._executedBefore) {
        topSuite.reset();
      }
      this._executedBefore = true;
      defaultResourcesForRunnable(topSuite.id);
      installGlobalErrors();

      if (!runnablesToRun) {
        if (focusedRunnables.length) {
          runnablesToRun = focusedRunnables;
        } else {
          runnablesToRun = [topSuite.id];
        }
      }

      var order = new j$.Order({
        random: config.random,
        seed: config.seed
      });

      var processor = new j$.TreeProcessor({
        tree: topSuite,
        runnableIds: runnablesToRun,
        queueRunnerFactory: queueRunnerFactory,
        failSpecWithNoExpectations: config.failSpecWithNoExpectations,
        nodeStart: function(suite, next) {
          currentlyExecutingSuites.push(suite);
          defaultResourcesForRunnable(suite.id, suite.parentSuite.id);
          reporter.suiteStarted(suite.result, next);
          suite.startTimer();
        },
        nodeComplete: function(suite, result, next) {
          if (suite !== currentSuite()) {
            throw new Error('Tried to complete the wrong suite');
          }

          clearResourcesForRunnable(suite.id);
          currentlyExecutingSuites.pop();

          if (result.status === 'failed') {
            hasFailures = true;
          }
          suite.endTimer();
          reporter.suiteDone(result, next);
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

      var jasmineTimer = new j$.Timer();
      jasmineTimer.start();

      var Promise = customPromise || global.Promise;

      if (Promise) {
        return new Promise(function(resolve) {
          runAll(function() {
            if (onComplete) {
              onComplete();
            }

            resolve();
          });
        });
      } else {
        runAll(function() {
          if (onComplete) {
            onComplete();
          }
        });
      }

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
              clearResourcesForRunnable(topSuite.id);
              currentlyExecutingSuites.pop();
              var overallStatus, incompleteReason;

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
              reporter.jasmineDone(
                {
                  overallStatus: overallStatus,
                  totalTime: jasmineTimer.elapsed(),
                  incompleteReason: incompleteReason,
                  order: order,
                  failedExpectations: topSuite.result.failedExpectations,
                  deprecationWarnings: topSuite.result.deprecationWarnings
                },
                done
              );
            });
          }
        );
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

    var spyFactory = new j$.SpyFactory(
      function getCustomStrategies() {
        var runnable = currentRunnable();

        if (runnable) {
          return runnableResources[runnable.id].customSpyStrategies;
        }

        return {};
      },
      function getDefaultStrategyFn() {
        var runnable = currentRunnable();

        if (runnable) {
          return runnableResources[runnable.id].defaultStrategyFn;
        }

        return undefined;
      },
      function getPromise() {
        return customPromise || global.Promise;
      }
    );

    var spyRegistry = new j$.SpyRegistry({
      currentSpies: function() {
        if (!currentRunnable()) {
          throw new Error(
            'Spies must be created in a before function or a spec'
          );
        }
        return runnableResources[currentRunnable().id].spies;
      },
      createSpy: function(name, originalFn) {
        return self.createSpy(name, originalFn);
      }
    });

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
      spyRegistry.allowRespy(allow);
    };

    this.spyOn = function() {
      return spyRegistry.spyOn.apply(spyRegistry, arguments);
    };

    this.spyOnProperty = function() {
      return spyRegistry.spyOnProperty.apply(spyRegistry, arguments);
    };

    this.spyOnAllFunctions = function() {
      return spyRegistry.spyOnAllFunctions.apply(spyRegistry, arguments);
    };

    this.createSpy = function(name, originalFn) {
      if (arguments.length === 1 && j$.isFunction_(name)) {
        originalFn = name;
        name = originalFn.name;
      }

      return spyFactory.createSpy(name, originalFn);
    };

    this.createSpyObj = function(baseName, methodNames, propertyNames) {
      return spyFactory.createSpyObj(baseName, methodNames, propertyNames);
    };

    var ensureIsFunction = function(fn, caller) {
      if (!j$.isFunction_(fn)) {
        throw new Error(
          caller + ' expects a function argument; received ' + j$.getType_(fn)
        );
      }
    };

    var ensureIsFunctionOrAsync = function(fn, caller) {
      if (!j$.isFunction_(fn) && !j$.isAsyncFunction_(fn)) {
        throw new Error(
          caller + ' expects a function argument; received ' + j$.getType_(fn)
        );
      }
    };

    function ensureIsNotNested(method) {
      var runnable = currentRunnable();
      if (runnable !== null && runnable !== undefined) {
        throw new Error(
          "'" + method + "' should only be used in 'describe' function"
        );
      }
    }

    var suiteFactory = function(description) {
      var suite = new j$.Suite({
        env: self,
        id: getNextSuiteId(),
        description: description,
        parentSuite: currentDeclarationSuite,
        timer: new j$.Timer(),
        expectationFactory: expectationFactory,
        asyncExpectationFactory: suiteAsyncExpectationFactory,
        expectationResultFactory: expectationResultFactory,
        throwOnExpectationFailure: config.oneFailurePerSpec,
        autoCleanClosures: config.autoCleanClosures
      });

      return suite;
    };

    this.describe = function(description, specDefinitions) {
      ensureIsNotNested('describe');
      ensureIsFunction(specDefinitions, 'describe');
      var suite = suiteFactory(description);
      if (specDefinitions.length > 0) {
        throw new Error('describe does not expect any arguments');
      }
      if (currentDeclarationSuite.markedExcluding) {
        suite.exclude();
      }
      addSpecsToSuite(suite, specDefinitions);
      if (suite.parentSuite && !suite.children.length) {
        this.deprecated(
          'describe with no children (describe() or it()) is ' +
            'deprecated and will be removed in a future version of Jasmine. ' +
            'Please either remove the describe or add children to it.'
        );
      }
      return j$.deprecatingSuiteProxy(suite, suite.parentSuite, this);
    };

    this.xdescribe = function(description, specDefinitions) {
      ensureIsNotNested('xdescribe');
      ensureIsFunction(specDefinitions, 'xdescribe');
      var suite = suiteFactory(description);
      suite.exclude();
      addSpecsToSuite(suite, specDefinitions);
      return j$.deprecatingSuiteProxy(suite, suite.parentSuite, this);
    };

    var focusedRunnables = [];

    this.fdescribe = function(description, specDefinitions) {
      ensureIsNotNested('fdescribe');
      ensureIsFunction(specDefinitions, 'fdescribe');
      var suite = suiteFactory(description);
      suite.isFocused = true;

      focusedRunnables.push(suite.id);
      unfocusAncestor();
      addSpecsToSuite(suite, specDefinitions);

      return j$.deprecatingSuiteProxy(suite, suite.parentSuite, this);
    };

    function addSpecsToSuite(suite, specDefinitions) {
      var parentSuite = currentDeclarationSuite;
      parentSuite.addChild(suite);
      currentDeclarationSuite = suite;

      var declarationError = null;
      try {
        specDefinitions.call(j$.deprecatingThisProxy(suite, self));
      } catch (e) {
        declarationError = e;
      }

      if (declarationError) {
        suite.onException(declarationError);
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
      var focusedAncestor = findFocusedAncestor(currentDeclarationSuite);
      if (focusedAncestor) {
        for (var i = 0; i < focusedRunnables.length; i++) {
          if (focusedRunnables[i] === focusedAncestor) {
            focusedRunnables.splice(i, 1);
            break;
          }
        }
      }
    }

    var specFactory = function(description, fn, suite, timeout) {
      totalSpecsDefined++;
      var spec = new j$.Spec({
        id: getNextSpecId(),
        beforeAndAfterFns: beforeAndAfterFns(suite),
        expectationFactory: expectationFactory,
        asyncExpectationFactory: specAsyncExpectationFactory,
        deprecated: self.deprecated,
        resultCallback: specResultCallback,
        getSpecName: function(spec) {
          return getSpecName(spec, suite);
        },
        onStart: specStarted,
        description: description,
        expectationResultFactory: expectationResultFactory,
        queueRunnerFactory: queueRunnerFactory,
        userContext: function() {
          return suite.clonedSharedUserContext();
        },
        queueableFn: {
          fn: fn,
          timeout: timeout || 0
        },
        throwOnExpectationFailure: config.oneFailurePerSpec,
        autoCleanClosures: config.autoCleanClosures,
        timer: new j$.Timer()
      });
      return spec;

      function specResultCallback(result, next) {
        clearResourcesForRunnable(spec.id);
        currentSpec = null;

        if (result.status === 'failed') {
          hasFailures = true;
        }

        reporter.specDone(result, next);
      }

      function specStarted(spec, next) {
        currentSpec = spec;
        defaultResourcesForRunnable(spec.id, suite.id);
        reporter.specStarted(spec.result, next);
      }
    };

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

      var spec = specFactory(description, fn, currentDeclarationSuite, timeout);
      if (currentDeclarationSuite.markedExcluding) {
        spec.exclude();
      }
      currentDeclarationSuite.addChild(spec);

      return spec;
    };

    this.it = function(description, fn, timeout) {
      var spec = this.it_(description, fn, timeout);
      return j$.deprecatingSpecProxy(spec, this);
    };

    this.xit = function(description, fn, timeout) {
      ensureIsNotNested('xit');
      // xit(), like it(), doesn't always have a fn argument, so only check the
      // type when needed.
      if (arguments.length > 1 && typeof fn !== 'undefined') {
        ensureIsFunctionOrAsync(fn, 'xit');
      }
      var spec = this.it_.apply(this, arguments);
      spec.exclude('Temporarily disabled with xit');
      return j$.deprecatingSpecProxy(spec, this);
    };

    this.fit = function(description, fn, timeout) {
      ensureIsNotNested('fit');
      ensureIsFunctionOrAsync(fn, 'fit');

      if (timeout) {
        j$.util.validateTimeout(timeout);
      }
      var spec = specFactory(description, fn, currentDeclarationSuite, timeout);
      currentDeclarationSuite.addChild(spec);
      focusedRunnables.push(spec.id);
      unfocusAncestor();
      return j$.deprecatingSpecProxy(spec, this);
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
      var fullMessage = j$.Spec.pendingSpecExceptionMessage;
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

      var message = 'Failed';
      if (error) {
        message += ': ';
        if (error.message) {
          message += error.message;
        } else if (j$.isString_(error)) {
          message += error;
        } else {
          // pretty print all kind of objects. This includes arrays.
          message += makePrettyPrinter()(error);
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

      if (config.oneFailurePerSpec) {
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
