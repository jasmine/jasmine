(function() {
  jasmine.Env = function(options) {
    options = options || {};
    var self = this;
    var global = options.global || jasmine.getGlobal();

    var catchExceptions = true;

    this.clock = new jasmine.Clock(global, new jasmine.DelayedFunctionScheduler());

    this.jasmine = jasmine;
    this.spies_ = [];
    this.currentSpec = null;

    this.reporter = new jasmine.ReportDispatcher([
      "jasmineStarted",
      "jasmineDone",
      "suiteStarted",
      "suiteDone",
      "specStarted",
      "specDone"
    ]);

    this.lastUpdate = 0;
    this.specFilter = function(spec) {
      return this.exclusive_ <= spec.exclusive_;
    };

    this.nextSpecId_ = 0;
    this.nextSuiteId_ = 0;
    this.equalityTesters_ = [];

    // 0 - normal
    // 1 - contains some ddescribe
    // 2 - contains some iit
    this.exclusive_ = 0;

    // wrap matchers
    this.matchersClass = function() {
      jasmine.Matchers.apply(this, arguments);
    };
    jasmine.util.inherit(this.matchersClass, jasmine.Matchers);

    jasmine.Matchers.wrapInto_(jasmine.Matchers.prototype, this.matchersClass);

    var expectationFactory = function(actual, spec) {
      var expect = new (self.matchersClass)(self, actual, spec);
      expect.not = new (self.matchersClass)(self, actual, spec, true);
      return expect;
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

    var specConstructor = jasmine.Spec;

    var getSpecName = function(spec, currentSuite) {
      return currentSuite.getFullName() + ' ' + spec.description + '.';
    };

    // TODO: we may just be able to pass in the fn instead of wrapping here
    var buildExpectationResult = jasmine.buildExpectationResult,
      exceptionFormatter = new jasmine.ExceptionFormatter(),
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

    this.catchException = function(e){
      return jasmine.Spec.isPendingSpecException(e) || catchExceptions;
    };

    var maximumSpecCallbackDepth = 100;
    var currentSpecCallbackDepth = 0;

    function encourageGarbageCollection(fn) {
      currentSpecCallbackDepth++;
      if (currentSpecCallbackDepth > maximumSpecCallbackDepth) {
        currentSpecCallbackDepth = 0;
        global.setTimeout(fn, 0);
      } else {
        fn();
      }
    }

    var queueRunnerFactory = function(options) {
      options.catchException = self.catchException;
      options.encourageGC = options.encourageGarbageCollection || encourageGarbageCollection;

      new jasmine.QueueRunner(options).run(options.fns, 0);
    };

    var totalSpecsDefined = 0;
    this.specFactory = function(description, fn, suite) {
      totalSpecsDefined++;

      var spec = new specConstructor({
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
        fn: fn
      });

      if (!self.specFilter(spec)) {
        spec.disable();
      }

      return spec;

      function specResultCallback(result) {
        self.removeAllSpies();
        self.clock.uninstall();
        self.currentSpec = null;
        self.reporter.specDone(result);
      }
    };

    var suiteStarted = function(suite) {
      self.reporter.suiteStarted(suite.result);
    };

    var suiteConstructor = jasmine.Suite;

    this.topSuite = new jasmine.Suite({
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
      this.topSuite.execute(this.reporter.jasmineDone);
    };
  };

  //TODO: shim Spec addMatchers behavior into Env. Should be rewritten to remove globals, etc.
  jasmine.Env.prototype.addMatchers = function(matchersPrototype) {
    var parent = this.matchersClass;
    var newMatchersClass = function() {
      parent.apply(this, arguments);
    };
    jasmine.util.inherit(newMatchersClass, parent);
    jasmine.Matchers.wrapInto_(matchersPrototype, newMatchersClass);
    this.matchersClass = newMatchersClass;
  };

  jasmine.Env.prototype.version = function() {
    return jasmine.version;
  };

  jasmine.Env.prototype.expect = function(actual) {
    return this.currentSpec.expect(actual);
  };

  jasmine.Env.prototype.spyOn = function(obj, methodName) {
    if (jasmine.util.isUndefined(obj)) {
      throw "spyOn could not find an object to spy upon for " + methodName + "()";
    }

    if (jasmine.util.isUndefined(obj[methodName])) {
      throw methodName + '() method does not exist';
    }

    if (obj[methodName] && obj[methodName].isSpy) {
      //TODO?: should this return the current spy? Downside: may cause user confusion about spy state
      throw new Error(methodName + ' has already been spied upon');
    }

    var spyObj = jasmine.createSpy(methodName);

    this.spies_.push(spyObj);
    spyObj.baseObj = obj;
    spyObj.methodName = methodName;
    spyObj.originalValue = obj[methodName];

    obj[methodName] = spyObj;

    return spyObj;
  };

  // TODO: move this to closure
  jasmine.Env.prototype.removeAllSpies = function() {
    for (var i = 0; i < this.spies_.length; i++) {
      var spy = this.spies_[i];
      spy.baseObj[spy.methodName] = spy.originalValue;
    }
    this.spies_ = [];
  };

  // TODO: move this to closure
  jasmine.Env.prototype.versionString = function() {
    console.log("DEPRECATED == use jasmine.version");
    return jasmine.version;
  };

  // TODO: move this to closure
  jasmine.Env.prototype.nextSpecId = function() {
    return this.nextSpecId_++;
  };

  // TODO: move this to closure
  jasmine.Env.prototype.nextSuiteId = function() {
    return this.nextSuiteId_++;
  };

  // TODO: move this to closure
  jasmine.Env.prototype.addReporter = function(reporter) {
    this.reporter.addReporter(reporter);
  };

  // TODO: move this to closure
  jasmine.Env.prototype.describe = function(description, specDefinitions) {
    var suite = new jasmine.Suite(this, description, null, this.currentSuite);
    return this.describe_(suite, specDefinitions);
  };

  jasmine.Env.prototype.describe_ = function(suite, specDefinitions) {
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
  jasmine.Env.prototype.ddescribe = function(description, specDefinitions) {
    var suite = new jasmine.Suite(this, description, null, this.currentSuite);
    suite.exclusive_ = 1;
    this.exclusive_ = Math.max(this.exclusive_, 1);

    return this.describe_(suite, specDefinitions);
  };

  // TODO: move this to closure
  jasmine.Env.prototype.xdescribe = function(description, specDefinitions) {
    var suite = this.describe(description, specDefinitions);
    suite.disable();
    return suite;
  };

  // TODO: move this to closure
  jasmine.Env.prototype.it = function(description, fn) {
    var spec = this.specFactory(description, fn, this.currentSuite);
    spec.exclusive_ = this.currentSuite.exclusive_;
    this.currentSuite.addSpec(spec);
    return spec;
  };

  // TODO: move this to closure
  jasmine.Env.prototype.iit = function(description, fn) {
    var spec = this.it(description, fn);
    spec.exclusive_ = 2;
    this.exclusive_ = 2;

    return spec;
  };

  // TODO: move this to closure
  jasmine.Env.prototype.xit = function(description, fn) {
    var spec = this.it(description, fn);
    spec.pend();
    return spec;
  };

  // TODO: move this to closure
  jasmine.Env.prototype.beforeEach = function(beforeEachFunction) {
    this.currentSuite.beforeEach(beforeEachFunction);
  };

  // TODO: move this to closure
  jasmine.Env.prototype.afterEach = function(afterEachFunction) {
    this.currentSuite.afterEach(afterEachFunction);
  };

  // TODO: move this to closure
  jasmine.Env.prototype.pending = function() {
    throw new Error(jasmine.Spec.pendingSpecExceptionMessage);
  };

  // TODO: Still needed?
  jasmine.Env.prototype.currentRunner = function() {
    return this.topSuite;
  };

  jasmine.Env.prototype.compareRegExps_ = function(a, b, mismatchKeys, mismatchValues) {
    if (a.source != b.source)
      mismatchValues.push("expected pattern /" + b.source + "/ is not equal to the pattern /" + a.source + "/");

    if (a.ignoreCase != b.ignoreCase)
      mismatchValues.push("expected modifier i was" + (b.ignoreCase ? " " : " not ") + "set and does not equal the origin modifier");

    if (a.global != b.global)
      mismatchValues.push("expected modifier g was" + (b.global ? " " : " not ") + "set and does not equal the origin modifier");

    if (a.multiline != b.multiline)
      mismatchValues.push("expected modifier m was" + (b.multiline ? " " : " not ") + "set and does not equal the origin modifier");

    if (a.sticky != b.sticky)
      mismatchValues.push("expected modifier y was" + (b.sticky ? " " : " not ") + "set and does not equal the origin modifier");

    return (mismatchValues.length === 0);
  };

  jasmine.Env.prototype.compareObjects_ = function(a, b, mismatchKeys, mismatchValues) {
    if (a.__Jasmine_been_here_before__ === b && b.__Jasmine_been_here_before__ === a) {
      return true;
    }

    a.__Jasmine_been_here_before__ = b;
    b.__Jasmine_been_here_before__ = a;

    var hasKey = function(obj, keyName) {
      return obj !== null && !jasmine.util.isUndefined(obj[keyName]);
    };

    for (var property in b) {
      if (!hasKey(a, property) && hasKey(b, property)) {
        mismatchKeys.push("expected has key '" + property + "', but missing from actual.");
      }
    }
    for (property in a) {
      if (!hasKey(b, property) && hasKey(a, property)) {
        mismatchKeys.push("expected missing key '" + property + "', but present in actual.");
      }
    }
    for (property in b) {
      if (property == '__Jasmine_been_here_before__') continue;
      if (!this.equals_(a[property], b[property], mismatchKeys, mismatchValues)) {
        mismatchValues.push("'" + property + "' was '" + (b[property] ? jasmine.util.htmlEscape(b[property].toString()) : b[property]) + "' in expected, but was '" + (a[property] ? jasmine.util.htmlEscape(a[property].toString()) : a[property]) + "' in actual.");
      }
    }

    if (jasmine.isArray_(a) && jasmine.isArray_(b) && a.length != b.length) {
      mismatchValues.push("arrays were not the same length");
    }

    delete a.__Jasmine_been_here_before__;
    delete b.__Jasmine_been_here_before__;
    return (mismatchKeys.length === 0 && mismatchValues.length === 0);
  };

  jasmine.Env.prototype.equals_ = function(a, b, mismatchKeys, mismatchValues) {
    mismatchKeys = mismatchKeys || [];
    mismatchValues = mismatchValues || [];

    for (var i = 0; i < this.equalityTesters_.length; i++) {
      var equalityTester = this.equalityTesters_[i];
      var result = equalityTester(a, b, this, mismatchKeys, mismatchValues);
      if (!jasmine.util.isUndefined(result)) {
        return result;
      }
    }

    if (a === b) return true;

    if (jasmine.util.isUndefined(a) || a === null || jasmine.util.isUndefined(b) || b === null) {
      return (jasmine.util.isUndefined(a) && jasmine.util.isUndefined(b));
    }

    if (jasmine.isDomNode(a) && jasmine.isDomNode(b)) {
      return a === b;
    }

    if (a instanceof Date && b instanceof Date) {
      return a.getTime() == b.getTime();
    }

    if (a.jasmineMatches) {
      return a.jasmineMatches(b);
    }

    if (b.jasmineMatches) {
      return b.jasmineMatches(a);
    }

    if (a instanceof jasmine.Matchers.ObjectContaining) {
      return a.matches(b);
    }

    if (b instanceof jasmine.Matchers.ObjectContaining) {
      return b.matches(a);
    }

    if (jasmine.isString_(a) && jasmine.isString_(b)) {
      return (a == b);
    }

    if (jasmine.isNumber_(a) && jasmine.isNumber_(b)) {
      return (a == b);
    }

    if (a instanceof RegExp && b instanceof RegExp) {
      return this.compareRegExps_(a, b, mismatchKeys, mismatchValues);
    }

    if (typeof a === "object" && typeof b === "object") {
      return this.compareObjects_(a, b, mismatchKeys, mismatchValues);
    }

    //Straight check
    return (a === b);
  };

  jasmine.Env.prototype.contains_ = function(haystack, needle) {
    if (jasmine.isArray_(haystack)) {
      for (var i = 0; i < haystack.length; i++) {
        if (this.equals_(haystack[i], needle)) return true;
      }
      return false;
    }
    return haystack.indexOf(needle) >= 0;
  };

  jasmine.Env.prototype.addEqualityTester = function(equalityTester) {
    this.equalityTesters_.push(equalityTester);
  };
}());
