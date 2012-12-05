/**
 * Environment for Jasmine
 *
 * @constructor
 */
(function() {
  jasmine.Env = function() {
    var self = this;
    var suiteConstructor = jasmine.Suite;
    var isSuite = function(thing) {
      return thing instanceof suiteConstructor;
    }
    this.jasmine = jasmine;
    this.currentRunner_ = new jasmine.Runner(this, isSuite);
    this.spies_ = [];
    this.currentSpec = null;
    this.catchExceptions = jasmine.CATCH_EXCEPTIONS;
    this.undefined = jasmine.undefined;

    this.reporter = new jasmine.MultiReporter();

    this.updateInterval = jasmine.DEFAULT_UPDATE_INTERVAL;
    this.defaultTimeoutInterval = jasmine.DEFAULT_TIMEOUT_INTERVAL;
    this.lastUpdate = 0;
    this.specFilter = function() {
      return true;
    };

    this.nextSpecId_ = 0;
    this.nextSuiteId_ = 0;
    this.equalityTesters_ = [];

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

    var startCallback = function(spec) {
      self.currentSpec = spec;
      self.reporter.reportSpecStarting(spec);
    };

    var beforeFns = function(currentSuite) {
      return function() {
        var befores = [];
        for (var suite = currentSuite; suite; suite = suite.parentSuite) {
          befores = befores.concat(suite.before_)
        }
        return befores.concat(self.currentRunner_.before_).reverse();
      }
    };

    var afterFns = function(currentSuite) {
      return function() {
        var afters = [];
        for (var suite = currentSuite; suite; suite = suite.parentSuite) {
          afters = afters.concat(suite.after_)
        }
        return afters.concat(self.currentRunner_.after_)
      }
    };

    var exceptionFormatter = jasmine.util.formatException;

    var specConstructor = jasmine.Spec;

    // TODO: this deserves a better name (not a Factory the way others are)
    var fullNameFactory = function(spec, currentSuite) {
      var descriptions = [];
      for (var suite = currentSuite; suite; suite = suite.parentSuite) {
        descriptions.push(suite.description)
      }
      descriptions.push(spec.description);
      return descriptions.join(' ') + '.';
    };

    var buildExpectationResult = jasmine.buildExpectationResult;
    var expectationResultFactory = function(attrs) {
      return buildExpectationResult(attrs);
    };

    this.specFactory = function(description, fn, suite) {
      var spec = new specConstructor({
        id: self.nextSpecId(),
        beforeFns: beforeFns(suite),
        afterFns: afterFns(suite),
        expectationFactory: expectationFactory,
        exceptionFormatter: exceptionFormatter,
        //TODO: move spec creation to more appropriate level and remove this shim
        resultCallback: function(result) { self.currentSpec = null; suite.specComplete(result); },
        fullNameFactory: function(spec) { return fullNameFactory(spec, suite) },
        startCallback: startCallback,
        description: description,
        catchExceptions: self.catchExceptions,
        expectationResultFactory: expectationResultFactory,
        fn: fn
      });

      if (!self.specFilter(spec)) {
        spec.disable();
      }

      return spec;
    };


    var queueConstructor = jasmine.Queue;
    var queueFactory = function() {
      return new queueConstructor(self);
    };
    this.suiteFactory = function(description, specDefinitions) {
      return new suiteConstructor(self, description, specDefinitions, self.currentSuite, queueFactory, isSuite);
    };

  };


  jasmine.Env.prototype.setTimeout = jasmine.setTimeout;
  jasmine.Env.prototype.clearTimeout = jasmine.clearTimeout;
  jasmine.Env.prototype.setInterval = jasmine.setInterval;
  jasmine.Env.prototype.clearInterval = jasmine.clearInterval;

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
  /**
   * @returns an object containing jasmine version build info, if set.
   */
  jasmine.Env.prototype.version = function () {
    if (this.jasmine.version_) {
      return this.jasmine.version_;
    } else {
      throw new Error('Version not set');
    }
  };

  jasmine.Env.prototype.expect = function(actual) {
   return this.currentSpec.expect(actual);
  };

  jasmine.Env.prototype.spyOn = function(obj, methodName) {
    if (obj == this.undefined) {
      throw "spyOn could not find an object to spy upon for " + methodName + "()";
    }

    if (obj[methodName] === this.undefined) {
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

  jasmine.Env.prototype.removeAllSpies = function() {
    for (var i = 0; i < this.spies_.length; i++) {
      var spy = this.spies_[i];
      spy.baseObj[spy.methodName] = spy.originalValue;
    }
    this.spies_ = [];
  };
  /**
   * @returns string containing jasmine version build info, if set.
   */
  jasmine.Env.prototype.versionString = function() {
    if (!this.jasmine.version_) {
      return "version unknown";
    }

    var version = this.version();
    var versionString = version.major + "." + version.minor + "." + version.build;
    if (version.release_candidate) {
      versionString += ".rc" + version.release_candidate;
    }
    versionString += " revision " + version.revision;
    return versionString;
  };

  /**
   * @returns a sequential integer starting at 0
   */
  jasmine.Env.prototype.nextSpecId = function () {
    return this.nextSpecId_++;
  };

  /**
   * @returns a sequential integer starting at 0
   */
  jasmine.Env.prototype.nextSuiteId = function () {
    return this.nextSuiteId_++;
  };

  /**
   * Register a reporter to receive status updates from Jasmine.
   * @param {jasmine.Reporter} reporter An object which will receive status updates.
   */
  jasmine.Env.prototype.addReporter = function(reporter) {
    this.reporter.addReporter(reporter);
  };

  jasmine.Env.prototype.execute = function() {
    this.currentRunner_.execute();
  };

  jasmine.Env.prototype.describe = function(description, specDefinitions) {
    var suite = this.suiteFactory(description, specDefinitions);

    var parentSuite = this.currentSuite;
    if (parentSuite) {
      parentSuite.add(suite);
    } else {
      this.currentRunner_.addSuite(suite);
    }

    this.currentSuite = suite;

    var declarationError = null;
    try {
      specDefinitions.call(suite);
    } catch(e) {
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

  jasmine.Env.prototype.beforeEach = function(beforeEachFunction) {
    if (this.currentSuite) {
      this.currentSuite.beforeEach(beforeEachFunction);
    } else {
      this.currentRunner_.beforeEach(beforeEachFunction);
    }
  };

  jasmine.Env.prototype.currentRunner = function () {
    return this.currentRunner_;
  };

  jasmine.Env.prototype.afterEach = function(afterEachFunction) {
    if (this.currentSuite) {
      this.currentSuite.afterEach(afterEachFunction);
    } else {
      this.currentRunner_.afterEach(afterEachFunction);
    }

  };

  jasmine.Env.prototype.xdescribe = function(desc, specDefinitions) {
    return {
      execute: function() {
      }
    };
  };

  jasmine.Env.prototype.it = function(description, fn) {
    var spec = this.specFactory(description, fn, this.currentSuite);
    this.currentSuite.add(spec);
    return spec;
  };

  jasmine.Env.prototype.xit = function(desc, func) {
    return {
      id: this.nextSpecId(),
      runs: function() {
      }
    };
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
      return obj !== null && obj[keyName] !== this.undefined;
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
      if (result !== this.undefined) return result;
    }

    if (a === b) return true;

    if (a === this.undefined || a === null || b === this.undefined || b === null) {
      return (a == this.undefined && b == this.undefined);
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
