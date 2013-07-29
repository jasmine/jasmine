getJasmineRequireObj().Env = function(j$) {
  function Env(options) {
    options = options || {};

    var self = this;
    var global = options.global || j$.getGlobal();

    var catchExceptions = true;

    var realSetTimeout = j$.getGlobal().setTimeout;
    var realClearTimeout = j$.getGlobal().clearTimeout;
    this.clock = new j$.Clock(global, new j$.DelayedFunctionScheduler());

    var spies = [];

    this.currentSpec = null;

    this.reporter = new j$.ReportDispatcher([
      "jasmineStarted",
      "jasmineDone",
      "suiteStarted",
      "suiteDone",
      "specStarted",
      "specDone"
    ]);

    this.lastUpdate = 0;
    this.specFilter = function() {
      return true;
    };

    this.nextSpecId_ = 0;
    this.nextSuiteId_ = 0;
    this.equalityTesters_ = [];

    var customEqualityTesters = [];
    this.addCustomEqualityTester = function(tester) {
      customEqualityTesters.push(tester);
    };

    j$.Expectation.addCoreMatchers(j$.matchers);

    var expectationFactory = function(actual, spec) {
      return j$.Expectation.Factory({
        util: j$.matchersUtil,
        customEqualityTesters: customEqualityTesters,
        actual: actual,
        addExpectationResult: addExpectationResult
      });

      function addExpectationResult(passed, result) {
        return spec.addExpectationResult(passed, result);
      }
    };

    var specStarted = function(spec) {
      self.currentSpec = spec;
      self.reporter.specStarted(spec.result);
    };

    var beforeFns = function(currentSuite) {
      return function() {
        var befores = [];
        for (var suite = currentSuite; suite; suite = suite.parentSuite) {
          befores = befores.concat(suite.beforeFns);
        }
        return befores.reverse();
      };
    };

    var afterFns = function(currentSuite) {
      return function() {
        var afters = [];
        for (var suite = currentSuite; suite; suite = suite.parentSuite) {
          afters = afters.concat(suite.afterFns);
        }
        return afters;
      };
    };

    var getSpecName = function(spec, currentSuite) {
      return currentSuite.getFullName() + ' ' + spec.description + '.';
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

    this.catchException = function(e) {
      return j$.Spec.isPendingSpecException(e) || catchExceptions;
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

    var queueRunnerFactory = function(options) {
      options.catchException = self.catchException;
      options.clearStack = options.clearStack || clearStack;

      new j$.QueueRunner(options).run(options.fns, 0);
    };

    var totalSpecsDefined = 0;
    this.specFactory = function(description, fn, suite) {
      totalSpecsDefined++;

      var spec = new j$.Spec({
        id: self.nextSpecId(),
        beforeFns: beforeFns(suite),
        afterFns: afterFns(suite),
        expectationFactory: expectationFactory,
        exceptionFormatter: exceptionFormatter,
        resultCallback: specResultCallback,
        getSpecName: function(spec) {
          return getSpecName(spec, suite);
        },
        onStart: specStarted,
        description: description,
        expectationResultFactory: expectationResultFactory,
        queueRunner: queueRunnerFactory,
        fn: fn,
        timer: {setTimeout: realSetTimeout, clearTimeout: realClearTimeout}
      });

      if (!self.specFilter(spec)) {
        spec.disable();
      }

      return spec;

      function removeAllSpies() {
        for (var i = 0; i < spies.length; i++) {
          var spyEntry = spies[i];
          spyEntry.baseObj[spyEntry.methodName] = spyEntry.originalValue;
        }
        spies = [];
      }

      function specResultCallback(result) {
        removeAllSpies();
        j$.Expectation.resetMatchers();
        customEqualityTesters.length = 0;
        self.clock.uninstall();
        self.currentSpec = null;
        self.reporter.specDone(result);
      }
    };

    var suiteStarted = function(suite) {
      self.reporter.suiteStarted(suite.result);
    };

    var suiteConstructor = j$.Suite;

    this.topSuite = new j$.Suite({
      env: this,
      id: this.nextSuiteId(),
      description: 'Jasmine__TopLevel__Suite',
      queueRunner: queueRunnerFactory,
      completeCallback: function() {}, // TODO - hook this up
      resultCallback: function() {} // TODO - hook this up
    });
    this.currentSuite = this.topSuite;

    this.suiteFactory = function(description) {
      return new suiteConstructor({
        env: self,
        id: self.nextSuiteId(),
        description: description,
        parentSuite: self.currentSuite,
        queueRunner: queueRunnerFactory,
        onStart: suiteStarted,
        resultCallback: function(attrs) {
          self.reporter.suiteDone(attrs);
        }
      });
    };

    this.execute = function() {
      this.reporter.jasmineStarted({
        totalSpecsDefined: totalSpecsDefined
      });
      this.topSuite.execute(self.reporter.jasmineDone);
    };

    this.spyOn = function(obj, methodName) {
      if (j$.util.isUndefined(obj)) {
        throw new Error("spyOn could not find an object to spy upon for " + methodName + "()");
      }

      if (j$.util.isUndefined(obj[methodName])) {
        throw new Error(methodName + '() method does not exist');
      }

      if (obj[methodName] && j$.isSpy(obj[methodName])) {
        //TODO?: should this return the current spy? Downside: may cause user confusion about spy state
        throw new Error(methodName + ' has already been spied upon');
      }

      var spy = j$.createSpy(methodName, obj[methodName]);

      spies.push({
        spy: spy,
        baseObj: obj,
        methodName: methodName,
        originalValue: obj[methodName]
      });

      obj[methodName] = spy;

      return spy;
    };
  }

  Env.prototype.addMatchers = function(matchersToAdd) {
    j$.Expectation.addMatchers(matchersToAdd);
  };

  Env.prototype.version = function() {
    return j$.version;
  };

  Env.prototype.expect = function(actual) {
    return this.currentSpec.expect(actual);
  };


  // TODO: move this to closure
  Env.prototype.versionString = function() {
    console.log("DEPRECATED == use j$.version");
    return j$.version;
  };

  // TODO: move this to closure
  Env.prototype.nextSpecId = function() {
    return this.nextSpecId_++;
  };

  // TODO: move this to closure
  Env.prototype.nextSuiteId = function() {
    return this.nextSuiteId_++;
  };

  // TODO: move this to closure
  Env.prototype.addReporter = function(reporter) {
    this.reporter.addReporter(reporter);
  };

  // TODO: move this to closure
  Env.prototype.describe = function(description, specDefinitions) {
    var suite = this.suiteFactory(description);

    var parentSuite = this.currentSuite;
    parentSuite.addSuite(suite);
    this.currentSuite = suite;

    var declarationError = null;
    try {
      specDefinitions.call(suite);
    } catch (e) {
      declarationError = e;
    }

    if (declarationError) {
      this.it("encountered a declaration exception", function() {
        throw declarationError;
      });
    }

    this.currentSuite = parentSuite;

    return suite;
  };

  // TODO: move this to closure
  Env.prototype.xdescribe = function(description, specDefinitions) {
    var suite = this.describe(description, specDefinitions);
    suite.disable();
    return suite;
  };

  // TODO: move this to closure
  Env.prototype.it = function(description, fn) {
    var spec = this.specFactory(description, fn, this.currentSuite);
    this.currentSuite.addSpec(spec);
    return spec;
  };

  // TODO: move this to closure
  Env.prototype.xit = function(description, fn) {
    var spec = this.it(description, fn);
    spec.pend();
    return spec;
  };

  // TODO: move this to closure
  Env.prototype.beforeEach = function(beforeEachFunction) {
    this.currentSuite.beforeEach(beforeEachFunction);
  };

  // TODO: move this to closure
  Env.prototype.afterEach = function(afterEachFunction) {
    this.currentSuite.afterEach(afterEachFunction);
  };

  // TODO: move this to closure
  Env.prototype.pending = function() {
    throw j$.Spec.pendingSpecExceptionMessage;
  };

  // TODO: Still needed?
  Env.prototype.currentRunner = function() {
    return this.topSuite;
  };

  return Env;
};
