getJasmineRequireObj().Env = function(j$) {
  function Env(options) {
    options = options || {};

    var self = this;
    var global = options.global || j$.getGlobal();

    var totalSpecsDefined = 0;

    var catchExceptions = true;

    var realSetTimeout = j$.getGlobal().setTimeout;
    var realClearTimeout = j$.getGlobal().clearTimeout;
    this.clock = new j$.Clock(global, new j$.DelayedFunctionScheduler(), new j$.MockDate(global));

    var runnableLookupTable = {};
    var runnableResources = {};

    var currentSpec = null;
    var currentlyExecutingSuites = [];
    var currentDeclarationSuite = null;

    var currentSuite = function() {
      return currentlyExecutingSuites[currentlyExecutingSuites.length - 1];
    };

    var currentRunnable = function() {
      return currentSpec || currentSuite();
    };

    var reporter = new j$.ReportDispatcher([
      'jasmineStarted',
      'jasmineDone',
      'suiteStarted',
      'suiteDone',
      'specStarted',
      'specDone',
      'afterAllEvent'
    ]);

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

    var beforeAndAfterFns = function(suite, runnablesExplictlySet) {
      return function() {
        var befores = [];
        var afters = [];
        while(suite) {
          if (runnablesExplictlySet()) {
            befores = befores.concat(suite.beforeAllFns);
            afters = afters.concat(suite.afterAllFns);
          }
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
      return suite.getFullName() + ' ' + spec.description;
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
      catchExceptions = !!value;
      return catchExceptions;
    };

    this.catchingExceptions = function() {
      return catchExceptions;
    };

    var maximumSpecCallbackDepth = 20;
    var currentSpecCallbackDepth = 0;

    function clearStack(fn) {
      currentSpecCallbackDepth++;
      if (currentSpecCallbackDepth >= maximumSpecCallbackDepth) {
        currentSpecCallbackDepth = 0;
        realSetTimeout(fn, 0);
      } else {
        fn();
      }
    }

    var catchException = function(e) {
      return j$.Spec.isPendingSpecException(e) || catchExceptions;
    };

    var queueRunnerFactory = function(options) {
      options.catchException = catchException;
      options.clearStack = options.clearStack || clearStack;
      options.timer = {setTimeout: realSetTimeout, clearTimeout: realClearTimeout};
      options.reportException = function(e, type) {
        if (type === 'afterAll') {
          reporter.afterAllEvent('Error thrown: '+ (e.message || e.description));
        }
      };

      new j$.QueueRunner(options).execute();
    };

    var topSuite = new j$.Suite({
      env: this,
      id: getNextSuiteId(),
      description: 'Jasmine__TopLevel__Suite',
      queueRunner: queueRunnerFactory,
      resultCallback: function() {}, // TODO - hook this up
      reportExpectationFailure: reportExpectationFailure
    });
    runnableLookupTable[topSuite.id] = topSuite;
    defaultResourcesForRunnable(topSuite.id);
    currentDeclarationSuite = topSuite;

    this.topSuite = function() {
      return topSuite;
    };

    this.execute = function(runnablesToRun) {
      if(runnablesToRun) {
        runnablesExplictlySet = true;
      }
      runnablesToRun = runnablesToRun || [topSuite.id];

      var allFns = [];
      for(var i = 0; i < runnablesToRun.length; i++) {
        var runnable = runnableLookupTable[runnablesToRun[i]];
        allFns.push((function(runnable) { return { fn: function(done) { runnable.execute(done); } }; })(runnable));
      }

      reporter.jasmineStarted({
        totalSpecsDefined: totalSpecsDefined
      });

      queueRunnerFactory({queueableFns: allFns, onComplete: reporter.jasmineDone});
    };

    this.addReporter = function(reporterToAdd) {
      reporter.addReporter(reporterToAdd);
    };

    var spyRegistry = new j$.SpyRegistry({currentSpies: function() {
      if(!currentRunnable()) {
        throw new Error('Spies must be created in a before function or a spec');
      }
      return runnableResources[currentRunnable().id].spies;
    }});

    this.spyOn = function() {
      return spyRegistry.spyOn.apply(spyRegistry, arguments);
    };

    var suiteFactory = function(description) {
      var suite = new j$.Suite({
        env: self,
        id: getNextSuiteId(),
        description: description,
        parentSuite: currentDeclarationSuite,
        queueRunner: queueRunnerFactory,
        onStart: suiteStarted,
        expectationFactory: expectationFactory,
        resultCallback: function(attrs) {
          if (!suite.disabled) {
            clearResourcesForRunnable(suite.id);
            currentlyExecutingSuites.pop();
          }
          reporter.suiteDone(attrs);
        },
        reportExpectationFailure: reportExpectationFailure
      });

      runnableLookupTable[suite.id] = suite;
      return suite;

      function suiteStarted(suite) {
        currentlyExecutingSuites.push(suite);
        defaultResourcesForRunnable(suite.id, suite.parentSuite.id);
        reporter.suiteStarted(suite.result);
      }
    };

    this.describe = function(description, specDefinitions) {
      var suite = suiteFactory(description);

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
        this.it('encountered a declaration exception', function() {
          throw declarationError;
        });
      }

      currentDeclarationSuite = parentSuite;

      return suite;
    };

    this.xdescribe = function(description, specDefinitions) {
      var suite = this.describe(description, specDefinitions);
      suite.disable();
      return suite;
    };

    var runnablesExplictlySet = false;

    var runnablesExplictlySetGetter = function(){
      return runnablesExplictlySet;
    };

    var specFactory = function(description, fn, suite) {
      totalSpecsDefined++;
      var spec = new j$.Spec({
        id: getNextSpecId(),
        beforeAndAfterFns: beforeAndAfterFns(suite, runnablesExplictlySetGetter),
        expectationFactory: expectationFactory,
        exceptionFormatter: exceptionFormatter,
        resultCallback: specResultCallback,
        getSpecName: function(spec) {
          return getSpecName(spec, suite);
        },
        onStart: specStarted,
        description: description,
        expectationResultFactory: expectationResultFactory,
        queueRunnerFactory: queueRunnerFactory,
        userContext: function() { return suite.clonedSharedUserContext(); },
        queueableFn: { fn: fn, type: 'it', timeout: function() { return j$.DEFAULT_TIMEOUT_INTERVAL; } }
      });

      runnableLookupTable[spec.id] = spec;

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

    this.it = function(description, fn) {
      var spec = specFactory(description, fn, currentDeclarationSuite);
      currentDeclarationSuite.addChild(spec);
      return spec;
    };

    this.xit = function(description, fn) {
      var spec = this.it(description, fn);
      spec.pend();
      return spec;
    };

    this.expect = function(actual) {
      return currentRunnable().expect(actual);
    };

    this.beforeEach = function(beforeEachFunction) {
      currentDeclarationSuite.beforeEach({ fn: beforeEachFunction, type: 'beforeEach', timeout: function() { return j$.DEFAULT_TIMEOUT_INTERVAL; } });
    };

    this.beforeAll = function(beforeAllFunction) {
      currentDeclarationSuite.beforeAll({ fn: beforeAllFunction, type: 'beforeAll', timeout: function() { return j$.DEFAULT_TIMEOUT_INTERVAL; } });
    };

    this.afterEach = function(afterEachFunction) {
      currentDeclarationSuite.afterEach({ fn: afterEachFunction, type: 'afterEach', timeout: function() { return j$.DEFAULT_TIMEOUT_INTERVAL; } });
    };

    this.afterAll = function(afterAllFunction) {
      currentDeclarationSuite.afterAll({ fn: afterAllFunction, type: 'afterAll', timeout: function() { return j$.DEFAULT_TIMEOUT_INTERVAL; } });
    };

    this.pending = function() {
      throw j$.Spec.pendingSpecExceptionMessage;
    };

    function reportExpectationFailure(message) {
      reporter.afterAllEvent('Expectation failed: '+ message);
    }
  }

  return Env;
};
