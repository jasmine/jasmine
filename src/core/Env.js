getJasmineRequireObj().Env = function(j$) {
  /**
   * _Note:_ Do not construct this directly, Jasmine will make one during booting.
   * @name Env
   * @classdesc The Jasmine environment
   * @constructor
   */
  function Env(options) {
    options = options || {};

    var self = this;
    var global = options.global || j$.getGlobal();

    var hasExecuted = false;

    var totalSpecsDefined = 0;

    var catchExceptions = true;

    var realSetTimeout = j$.getGlobal().setTimeout;
    var realClearTimeout = j$.getGlobal().clearTimeout;
    var clearStack = j$.getClearStack(j$.getGlobal());
    this.clock = new j$.Clock(global, function () { return new j$.DelayedFunctionScheduler(); }, new j$.MockDate(global));

    var runnableResources = {};

    var currentSpec = null;
    var currentlyExecutingSuites = [];
    var currentDeclarationSuite = null;
    var throwOnExpectationFailure = false;
    var random = false;
    var seed = null;

    var currentSuite = function() {
      return currentlyExecutingSuites[currentlyExecutingSuites.length - 1];
    };

    var currentRunnable = function() {
      return currentSpec || currentSuite();
    };

    /**
     * This represents the available reporter callback for an object passed to {@link Env#addReporter}.
     * @interface Reporter
     */
    var reporter = new j$.ReportDispatcher([
      /**
       * `jasmineStarted` is called after all of the specs have been loaded, but just before execution starts.
       * @function
       * @name Reporter#jasmineStarted
       * @param {JasmineStartedInfo} suiteInfo Information about the full Jasmine suite that is being run
       */
      'jasmineStarted',
      /**
       * When the entire suite has finished execution `jasmineDone` is called
       * @function
       * @name Reporter#jasmineDone
       * @param {JasmineDoneInfo} suiteInfo Information about the full Jasmine suite that just finished running.
       */
      'jasmineDone',
      /**
       * `suiteStarted` is invoked when a `describe` starts to run
       * @function
       * @name Reporter#suiteStarted
       * @param {SuiteResult} result Information about the individual {@link describe} being run
       */
      'suiteStarted',
      /**
       * `suiteDone` is invoked when all of the child specs and suites for a given suite have been run
       *
       * While jasmine doesn't require any specific functions, not defining a `suiteDone` will make it impossible for a reporter to know when a suite has failures in an `afterAll`.
       * @function
       * @name Reporter#suiteDone
       * @param {SuiteResult} result
       */
      'suiteDone',
      /**
       * `specStarted` is invoked when an `it` starts to run (including associated `beforeEach` functions)
       * @function
       * @name Reporter#specStarted
       * @param {SpecResult} result Information about the individual {@link it} being run
       */
      'specStarted',
      /**
       * `specDone` is invoked when an `it` and its associated `beforeEach` and `afterEach` functions have been run.
       *
       * While jasmine doesn't require any specific functions, not defining a `specDone` will make it impossible for a reporter to know when a spec has failed.
       * @function
       * @name Reporter#specDone
       * @param {SpecResult} result
       */
      'specDone'
    ]);

    var globalErrors = new j$.GlobalErrors();

    this.specFilter = function() {
      return true;
    };

    this.addCustomEqualityTester = function(tester) {
      if(!currentRunnable()) {
        throw new Error('Custom Equalities must be added in a before function or a spec');
      }
      runnableResources[currentRunnable().id].customEqualityTesters.push(tester);
    };

    this.addMatchers = function(matchersToAdd) {
      if(!currentRunnable()) {
        throw new Error('Matchers must be added in a before function or a spec');
      }
      var customMatchers = runnableResources[currentRunnable().id].customMatchers;
      for (var matcherName in matchersToAdd) {
        customMatchers[matcherName] = matchersToAdd[matcherName];
      }
    };

    j$.Expectation.addCoreMatchers(j$.matchers);

    var nextSpecId = 0;
    var getNextSpecId = function() {
      return 'spec' + nextSpecId++;
    };

    var nextSuiteId = 0;
    var getNextSuiteId = function() {
      return 'suite' + nextSuiteId++;
    };

    var expectationFactory = function(actual, spec) {
      return j$.Expectation.Factory({
        util: j$.matchersUtil,
        customEqualityTesters: runnableResources[spec.id].customEqualityTesters,
        customMatchers: runnableResources[spec.id].customMatchers,
        actual: actual,
        addExpectationResult: addExpectationResult
      });

      function addExpectationResult(passed, result) {
        return spec.addExpectationResult(passed, result);
      }
    };

    var defaultResourcesForRunnable = function(id, parentRunnableId) {
      var resources = {spies: [], customEqualityTesters: [], customMatchers: {}};

      if(runnableResources[parentRunnableId]){
        resources.customEqualityTesters = j$.util.clone(runnableResources[parentRunnableId].customEqualityTesters);
        resources.customMatchers = j$.util.clone(runnableResources[parentRunnableId].customMatchers);
      }

      runnableResources[id] = resources;
    };

    var clearResourcesForRunnable = function(id) {
        spyRegistry.clearSpies();
        delete runnableResources[id];
    };

    var beforeAndAfterFns = function(suite) {
      return function() {
        var befores = [],
          afters = [];

        while(suite) {
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

    // TODO: fix this naming, and here's where the value comes in
    this.catchExceptions = function(value) {
      this.deprecated('The catchExceptions option is deprecated and will be replaced with stopOnSpecFailure in Jasmine 3.0');
      catchExceptions = !!value;
      return catchExceptions;
    };

    this.catchingExceptions = function() {
      return catchExceptions;
    };

    var maximumSpecCallbackDepth = 20;
    var currentSpecCallbackDepth = 0;

    var catchException = function(e) {
      return j$.Spec.isPendingSpecException(e) || catchExceptions;
    };

    this.throwOnExpectationFailure = function(value) {
      throwOnExpectationFailure = !!value;
    };

    this.throwingExpectationFailures = function() {
      return throwOnExpectationFailure;
    };

    this.randomizeTests = function(value) {
      random = !!value;
    };

    this.randomTests = function() {
      return random;
    };

    this.seed = function(value) {
      if (value) {
        seed = value;
      }
      return seed;
    };

    this.deprecated = function(msg) {
      var runnable = currentRunnable() || topSuite;
      runnable.addDeprecationWarning(msg);
      if(typeof console !== 'undefined' && typeof console.warn !== 'undefined') {
        console.error('DEPRECATION: ' + msg);
      }
    };

    var queueRunnerFactory = function(options) {
      options.catchException = catchException;
      options.clearStack = options.clearStack || clearStack;
      options.timeout = {setTimeout: realSetTimeout, clearTimeout: realClearTimeout};
      options.fail = self.fail;
      options.globalErrors = globalErrors;
      options.completeOnFirstError = throwOnExpectationFailure && options.isLeaf;
      options.deprecated = self.deprecated;

      new j$.QueueRunner(options).execute();
    };

    var topSuite = new j$.Suite({
      env: this,
      id: getNextSuiteId(),
      description: 'Jasmine__TopLevel__Suite',
      expectationFactory: expectationFactory,
      expectationResultFactory: expectationResultFactory
    });
    defaultResourcesForRunnable(topSuite.id);
    currentDeclarationSuite = topSuite;

    this.topSuite = function() {
      return topSuite;
    };

    this.execute = function(runnablesToRun) {
      if (hasExecuted) {
        this.deprecated('Executing the same Jasmine multiple times will no longer work in Jasmine 3.0');
      }

      hasExecuted = true;

      if(!runnablesToRun) {
        if (focusedRunnables.length) {
          runnablesToRun = focusedRunnables;
        } else {
          runnablesToRun = [topSuite.id];
        }
      }

      var order = new j$.Order({
        random: random,
        seed: seed
      });

      var processor = new j$.TreeProcessor({
        tree: topSuite,
        runnableIds: runnablesToRun,
        queueRunnerFactory: queueRunnerFactory,
        nodeStart: function(suite) {
          currentlyExecutingSuites.push(suite);
          defaultResourcesForRunnable(suite.id, suite.parentSuite.id);
          reporter.suiteStarted(suite.result);
        },
        nodeComplete: function(suite, result) {
          if (suite !== currentSuite()) {
            throw new Error('Tried to complete the wrong suite');
          }

          if (!suite.markedPending) {
            clearResourcesForRunnable(suite.id);
          }
          currentlyExecutingSuites.pop();
          reporter.suiteDone(result);
        },
        orderChildren: function(node) {
          return order.sort(node.children);
        }
      });

      if(!processor.processTree().valid) {
        throw new Error('Invalid order: would cause a beforeAll or afterAll to be run multiple times');
      }

      /**
       * Information passed to the {@link Reporter#jasmineStarted} event.
       * @typedef JasmineStartedInfo
       * @property {Int} totalSpecsDefined - The total number of specs defined in this suite.
       * @property {Order} order - Information about the ordering (random or not) of this execution of the suite.
       */
      reporter.jasmineStarted({
        totalSpecsDefined: totalSpecsDefined,
        order: order
      });

      currentlyExecutingSuites.push(topSuite);

      globalErrors.install();
      processor.execute(function() {
        clearResourcesForRunnable(topSuite.id);
        currentlyExecutingSuites.pop();
        globalErrors.uninstall();

        /**
         * Information passed to the {@link Reporter#jasmineDone} event.
         * @typedef JasmineDoneInfo
         * @property {Order} order - Information about the ordering (random or not) of this execution of the suite.
         * @property {Expectation[]} failedExpectations - List of expectations that failed in an {@link afterAll} at the global level.
         * @property {Expectation[]} deprecationWarnings - List of deprecation warnings that occurred at the global level.
         */
        reporter.jasmineDone({
          order: order,
          failedExpectations: topSuite.result.failedExpectations,
          deprecationWarnings: topSuite.result.deprecationWarnings
        });
      });
    };

    /**
     * Add a custom reporter to the Jasmine environment.
     * @name Env#addReporter
     * @function
     * @param {Reporter} reporterToAdd The reporter to be added.
     * @see custom_reporter
     */
    this.addReporter = function(reporterToAdd) {
      reporter.addReporter(reporterToAdd);
    };

    this.provideFallbackReporter = function(reporterToAdd) {
      reporter.provideFallbackReporter(reporterToAdd);
    };

    this.clearReporters = function() {
      reporter.clearReporters();
    };

    var spyRegistry = new j$.SpyRegistry({currentSpies: function() {
      if(!currentRunnable()) {
        throw new Error('Spies must be created in a before function or a spec');
      }
      return runnableResources[currentRunnable().id].spies;
    }});

    this.allowRespy = function(allow){
      spyRegistry.allowRespy(allow);
    };

    this.spyOn = function() {
      return spyRegistry.spyOn.apply(spyRegistry, arguments);
    };

    this.unspy = function(obj, methodName) {
    return spyRegistry.clearSpy.apply(spyRegistry, [obj, methodName]);
    };

    this.spyOnProperty = function() {
      return spyRegistry.spyOnProperty.apply(spyRegistry, arguments);
    };

    this.unspyProperty = function(obj, propertyName, accessType) {
      accessType = accessType || 'get';
      return spyRegistry.clearSpy.apply(spyRegistry, [obj, propertyName, accessType]);
    };

    var ensureIsFunction = function(fn, caller) {
      if (!j$.isFunction_(fn)) {
        throw new Error(caller + ' expects a function argument; received ' + j$.getType_(fn));
      }
    };

    var ensureIsFunctionOrAsync = function(fn, caller) {
      if (!j$.isFunction_(fn) && !j$.isAsyncFunction_(fn)) {
        throw new Error(caller + ' expects a function argument; received ' + j$.getType_(fn));
      }
    };

    function ensureIsNotNested(method) {
      var runnable = currentRunnable();
      if (runnable !== null && runnable !== undefined) {
        throw new Error('\'' + method + '\' should only be used in \'describe\' function');
      }
    }

    var suiteFactory = function(description) {
      var suite = new j$.Suite({
        env: self,
        id: getNextSuiteId(),
        description: description,
        parentSuite: currentDeclarationSuite,
        expectationFactory: expectationFactory,
        expectationResultFactory: expectationResultFactory,
        throwOnExpectationFailure: throwOnExpectationFailure
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
      if (currentDeclarationSuite.markedPending) {
        suite.pend();
      }
      addSpecsToSuite(suite, specDefinitions);
      return suite;
    };

    this.xdescribe = function(description, specDefinitions) {
      ensureIsNotNested('xdescribe');
      ensureIsFunction(specDefinitions, 'xdescribe');
      var suite = suiteFactory(description);
      suite.pend();
      addSpecsToSuite(suite, specDefinitions);
      return suite;
    };

    var focusedRunnables = [];

    this.fdescribe = function(description, specDefinitions) {
      this.deprecated('fit and fdescribe will cause your suite to report an \'incomplete\' status in Jasmine 3.0');
      ensureIsNotNested('fdescribe');
      ensureIsFunction(specDefinitions, 'fdescribe');
      var suite = suiteFactory(description);
      suite.isFocused = true;

      focusedRunnables.push(suite.id);
      unfocusAncestor();
      addSpecsToSuite(suite, specDefinitions);

      return suite;
    };

    function addSpecsToSuite(suite, specDefinitions) {
      var parentSuite = currentDeclarationSuite;
      parentSuite.addChild(suite);
      currentDeclarationSuite = suite;

      var declarationError = null;
      try {
        specDefinitions.call(suite);
      } catch (e) {
        declarationError = e;
      }

      if (declarationError) {
        self.it('encountered a declaration exception', function() {
          throw declarationError;
        });
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
        resultCallback: specResultCallback,
        getSpecName: function(spec) {
          return getSpecName(spec, suite);
        },
        onStart: specStarted,
        description: description,
        expectationResultFactory: expectationResultFactory,
        queueRunnerFactory: queueRunnerFactory,
        userContext: function() { return suite.clonedSharedUserContext(); },
        queueableFn: {
          fn: fn,
          timeout: function() { return timeout || j$.DEFAULT_TIMEOUT_INTERVAL; }
        },
        throwOnExpectationFailure: throwOnExpectationFailure
      });

      if (!self.specFilter(spec)) {
        spec.disable();
      }

      return spec;

      function specResultCallback(result) {
        clearResourcesForRunnable(spec.id);
        currentSpec = null;
        reporter.specDone(result);
      }

      function specStarted(spec) {
        currentSpec = spec;
        defaultResourcesForRunnable(spec.id, suite.id);
        reporter.specStarted(spec.result);
      }
    };

    this.it = function(description, fn, timeout) {
      ensureIsNotNested('it');
      // it() sometimes doesn't have a fn argument, so only check the type if
      // it's given.
      if (arguments.length > 1 && typeof fn !== 'undefined') {
        ensureIsFunctionOrAsync(fn, 'it');
      }
      var spec = specFactory(description, fn, currentDeclarationSuite, timeout);
      if (currentDeclarationSuite.markedPending) {
        spec.pend();
      }
      currentDeclarationSuite.addChild(spec);
      return spec;
    };

    this.xit = function(description, fn, timeout) {
      ensureIsNotNested('xit');
      // xit(), like it(), doesn't always have a fn argument, so only check the
      // type when needed.
      if (arguments.length > 1 && typeof fn !== 'undefined') {
        ensureIsFunctionOrAsync(fn, 'xit');
      }
      var spec = this.it.apply(this, arguments);
      spec.pend('Temporarily disabled with xit');
      return spec;
    };

    this.fit = function(description, fn, timeout){
      this.deprecated('fit and fdescribe will cause your suite to report an \'incomplete\' status in Jasmine 3.0');
      ensureIsNotNested('fit');
      ensureIsFunctionOrAsync(fn, 'fit');
      var spec = specFactory(description, fn, currentDeclarationSuite, timeout);
      currentDeclarationSuite.addChild(spec);
      focusedRunnables.push(spec.id);
      unfocusAncestor();
      return spec;
    };

    this.expect = function(actual) {
      if (!currentRunnable()) {
        throw new Error('\'expect\' was used when there was no current spec, this could be because an asynchronous test timed out');
      }

      return currentRunnable().expect(actual);
    };

    this.beforeEach = function(beforeEachFunction, timeout) {
      ensureIsNotNested('beforeEach');
      ensureIsFunctionOrAsync(beforeEachFunction, 'beforeEach');
      currentDeclarationSuite.beforeEach({
        fn: beforeEachFunction,
        timeout: function() { return timeout || j$.DEFAULT_TIMEOUT_INTERVAL; }
      });
    };

    this.beforeAll = function(beforeAllFunction, timeout) {
      ensureIsNotNested('beforeAll');
      ensureIsFunctionOrAsync(beforeAllFunction, 'beforeAll');
      currentDeclarationSuite.beforeAll({
        fn: beforeAllFunction,
        timeout: function() { return timeout || j$.DEFAULT_TIMEOUT_INTERVAL; }
      });
    };

    this.afterEach = function(afterEachFunction, timeout) {
      ensureIsNotNested('afterEach');
      ensureIsFunctionOrAsync(afterEachFunction, 'afterEach');
      afterEachFunction.isCleanup = true;
      currentDeclarationSuite.afterEach({
        fn: afterEachFunction,
        timeout: function() { return timeout || j$.DEFAULT_TIMEOUT_INTERVAL; }
      });
    };

    this.afterAll = function(afterAllFunction, timeout) {
      ensureIsNotNested('afterAll');
      ensureIsFunctionOrAsync(afterAllFunction, 'afterAll');
      currentDeclarationSuite.afterAll({
        fn: afterAllFunction,
        timeout: function() { return timeout || j$.DEFAULT_TIMEOUT_INTERVAL; }
      });
    };

    this.pending = function(message) {
      var fullMessage = j$.Spec.pendingSpecExceptionMessage;
      if(message) {
        fullMessage += message;
      }
      throw fullMessage;
    };

    this.fail = function(error) {
      if (!currentRunnable()) {
        throw new Error('\'fail\' was used when there was no current spec, this could be because an asynchronous test timed out');
      }

      var message = 'Failed';
      if (error) {
        message += ': ';
        if (error.message) {
          message += error.message;
        } else if (jasmine.isString_(error)) {
          message += error;
        } else {
          // pretty print all kind of objects. This includes arrays.
          message += jasmine.pp(error);
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

      if (self.throwingExpectationFailures()) {
        throw new Error(message);
      }
    };
  }

  return Env;
};
