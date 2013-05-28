/*
Copyright (c) 2008-2013 Pivotal Labs

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
"Software"), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/
function getJasmineRequireObj() {
  if (typeof module !== "undefined" && module.exports) {
    return exports;
  } else {
    window.jasmineRequire = window.jasmineRequire || {};
    return window.jasmineRequire;
  }
}

getJasmineRequireObj().core = function(jRequire) {
  j$ = {};

  jRequire.base(j$);
  j$.util = jRequire.util();
  j$.Clock = jRequire.Clock();
  j$.DelayedFunctionScheduler = jRequire.DelayedFunctionScheduler();
  j$.Env = jRequire.Env(j$);
  j$.ExceptionFormatter = jRequire.ExceptionFormatter();
  j$.buildExpectationResult = jRequire.buildExpectationResult();
  j$.JsApiReporter = jRequire.JsApiReporter();
  j$.Matchers = jRequire.Matchers(j$);
  j$.StringPrettyPrinter = jRequire.StringPrettyPrinter(j$);
  j$.QueueRunner = jRequire.QueueRunner();
  j$.ReportDispatcher = jRequire.ReportDispatcher();
  j$.Spec = jRequire.Spec();
  j$.Suite = jRequire.Suite();
  j$.version = jRequire.version();

  return j$;
};

getJasmineRequireObj().base = function(j$) {
  j$.unimplementedMethod_ = function() {
    throw new Error("unimplemented method");
  };

  j$.DEFAULT_UPDATE_INTERVAL = 250;
  j$.MAX_PRETTY_PRINT_DEPTH = 40;
  j$.DEFAULT_TIMEOUT_INTERVAL = 5000;

  j$.getGlobal = function() {
    function getGlobal() {
      return this;
    }

    return getGlobal();
  };

  j$.getEnv = function(options) {
    var env = j$.currentEnv_ = j$.currentEnv_ || new j$.Env(options);
    //jasmine. singletons in here (setTimeout blah blah).
    return env;
  };

  j$.isArray_ = function(value) {
    return j$.isA_("Array", value);
  };

  j$.isString_ = function(value) {
    return j$.isA_("String", value);
  };

  j$.isNumber_ = function(value) {
    return j$.isA_("Number", value);
  };

  j$.isA_ = function(typeName, value) {
    return Object.prototype.toString.apply(value) === '[object ' + typeName + ']';
  };

  j$.pp = function(value) {
    var stringPrettyPrinter = new j$.StringPrettyPrinter();
    stringPrettyPrinter.format(value);
    return stringPrettyPrinter.string;
  };

  j$.isDomNode = function(obj) {
    return obj.nodeType > 0;
  };

  j$.any = function(clazz) {
    return new j$.Matchers.Any(clazz);
  };

  j$.objectContaining = function(sample) {
    return new j$.Matchers.ObjectContaining(sample);
  };

  j$.Spy = function(name) {
    this.identity = name || 'unknown';
    this.isSpy = true;
    this.plan = function() {
    };
    this.mostRecentCall = {};

    this.argsForCall = [];
    this.calls = [];
  };

  j$.Spy.prototype.andCallThrough = function() {
    this.plan = this.originalValue;
    return this;
  };

  j$.Spy.prototype.andReturn = function(value) {
    this.plan = function() {
      return value;
    };
    return this;
  };

  j$.Spy.prototype.andThrow = function(exceptionMsg) {
    this.plan = function() {
      throw exceptionMsg;
    };
    return this;
  };

  j$.Spy.prototype.andCallFake = function(fakeFunc) {
    this.plan = fakeFunc;
    return this;
  };

  j$.Spy.prototype.reset = function() {
    this.wasCalled = false;
    this.callCount = 0;
    this.argsForCall = [];
    this.calls = [];
    this.mostRecentCall = {};
  };

  j$.createSpy = function(name) {

    var spyObj = function() {
      spyObj.wasCalled = true;
      spyObj.callCount++;
      var args = j$.util.argsToArray(arguments);
      spyObj.mostRecentCall.object = this;
      spyObj.mostRecentCall.args = args;
      spyObj.argsForCall.push(args);
      spyObj.calls.push({object: this, args: args});
      return spyObj.plan.apply(this, arguments);
    };

    var spy = new j$.Spy(name);

    for (var prop in spy) {
      spyObj[prop] = spy[prop];
    }

    spyObj.reset();

    return spyObj;
  };

  j$.isSpy = function(putativeSpy) {
    return putativeSpy && putativeSpy.isSpy;
  };

  j$.createSpyObj = function(baseName, methodNames) {
    if (!j$.isArray_(methodNames) || methodNames.length === 0) {
      throw new Error('createSpyObj requires a non-empty array of method names to create spies for');
    }
    var obj = {};
    for (var i = 0; i < methodNames.length; i++) {
      obj[methodNames[i]] = j$.createSpy(baseName + '.' + methodNames[i]);
    }
    return obj;
  };
};

getJasmineRequireObj().util = function() {

  var util = {};

  util.inherit = function(childClass, parentClass) {
    var subclass = function() {
    };
    subclass.prototype = parentClass.prototype;
    childClass.prototype = new subclass();
  };

  util.formatException = function(e) {
    var lineNumber;
    if (e.line) {
      lineNumber = e.line;
    }
    else if (e.lineNumber) {
      lineNumber = e.lineNumber;
    }

    var file;

    if (e.sourceURL) {
      file = e.sourceURL;
    }
    else if (e.fileName) {
      file = e.fileName;
    }

    var message = (e.name && e.message) ? (e.name + ': ' + e.message) : e.toString();

    if (file && lineNumber) {
      message += ' in ' + file + ' (line ' + lineNumber + ')';
    }

    return message;
  };

  util.htmlEscape = function(str) {
    if (!str) return str;
    return str.replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  };

  util.argsToArray = function(args) {
    var arrayOfArgs = [];
    for (var i = 0; i < args.length; i++) arrayOfArgs.push(args[i]);
    return arrayOfArgs;
  };

  util.isUndefined = function(obj) {
    return obj === void 0;
  };

  return util;
};

getJasmineRequireObj().Spec = function() {
  function Spec(attrs) {
    this.encounteredExpectations = false;
    this.expectationFactory = attrs.expectationFactory;
    this.resultCallback = attrs.resultCallback || function() {};
    this.id = attrs.id;
    this.description = attrs.description || '';
    this.fn = attrs.fn;
    this.beforeFns = attrs.beforeFns || function() {};
    this.afterFns = attrs.afterFns || function() {};
    this.catchingExceptions = attrs.catchingExceptions;
    this.onStart = attrs.onStart || function() {};
    this.exceptionFormatter = attrs.exceptionFormatter || function() {};
    this.getSpecName = attrs.getSpecName || function() { return ''; };
    this.expectationResultFactory = attrs.expectationResultFactory || function() { };
    this.queueRunner = attrs.queueRunner || function() {};
    this.catchingExceptions = attrs.catchingExceptions || function() { return true; };

    if (!this.fn) {
      this.pend();
    }

    this.result = {
      id: this.id,
      description: this.description,
      fullName: this.getFullName(),
      status: this.status(),
      failedExpectations: []
    };
  }

  Spec.prototype.addExpectationResult = function(passed, data) {
    this.encounteredExpectations = true;
    if (passed) {
      return;
    }
    this.result.failedExpectations.push(this.expectationResultFactory(data));
  };

  Spec.prototype.expect = function(actual) {
    return this.expectationFactory(actual, this);
  };

  Spec.prototype.execute = function(onComplete) {
    var self = this;

    this.onStart(this);

    if (this.markedPending || this.disabled) {
      complete();
      return;
    }

    var befores = this.beforeFns() || [],
      afters = this.afterFns() || [];
    var allFns = befores.concat(this.fn).concat(afters);

    this.queueRunner({
      fns: allFns,
      onException: function(e) {
        if (Spec.isPendingSpecException(e)) {
          self.pend();
          return;
        }

        self.addExpectationResult(false, {
          matcherName: "",
          passed: false,
          expected: "",
          actual: "",
          error: e
        });
      },
      onComplete: complete
    });

    function complete() {
      self.result.status = self.status();
      self.resultCallback(self.result);

      if (onComplete) {
        onComplete();
      }
    }
  };

  Spec.prototype.disable = function() {
    this.disabled = true;
  };

  Spec.prototype.pend = function() {
    this.markedPending = true;
  };

  Spec.prototype.status = function() {
    if (this.disabled) {
      return 'disabled';
    }

    if (this.markedPending || !this.encounteredExpectations) {
      return 'pending';
    }

    if (this.result.failedExpectations.length > 0) {
      return 'failed';
    } else {
      return 'passed';
    }
  };

  Spec.prototype.getFullName = function() {
    return this.getSpecName(this);
  };

  Spec.pendingSpecExceptionMessage = "=> marked Pending";

  Spec.isPendingSpecException = function(e) {
    return e.toString().indexOf(Spec.pendingSpecExceptionMessage) !== -1;
  };

  return Spec;
};

if (typeof window == void 0 && typeof exports == "object") {
  exports.Spec = jasmineRequire.Spec;
}

getJasmineRequireObj().Env = function(j$) {
  function Env(options) {
    options = options || {};
    var self = this;
    var global = options.global || j$.getGlobal();

    var catchExceptions = true;

    this.clock = new j$.Clock(global, new j$.DelayedFunctionScheduler());

    this.spies_ = [];
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

    // wrap matchers
    this.matchersClass = function() {
      j$.Matchers.apply(this, arguments);
    };
    j$.util.inherit(this.matchersClass, j$.Matchers);

    j$.Matchers.wrapInto_(j$.Matchers.prototype, this.matchersClass);

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

    var specConstructor = j$.Spec;

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

    this.catchException = function(e){
      return j$.Spec.isPendingSpecException(e) || catchExceptions;
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

      new j$.QueueRunner(options).run(options.fns, 0);
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
      this.topSuite.execute(this.reporter.jasmineDone);
    };
  }

  //TODO: shim Spec addMatchers behavior into Env. Should be rewritten to remove globals, etc.
  Env.prototype.addMatchers = function(matchersPrototype) {
    var parent = this.matchersClass;
    var newMatchersClass = function() {
      parent.apply(this, arguments);
    };
    j$.util.inherit(newMatchersClass, parent);
    j$.Matchers.wrapInto_(matchersPrototype, newMatchersClass);
    this.matchersClass = newMatchersClass;
  };

  Env.prototype.version = function() {
    return j$.version;
  };

  Env.prototype.expect = function(actual) {
    return this.currentSpec.expect(actual);
  };

  Env.prototype.spyOn = function(obj, methodName) {
    if (j$.util.isUndefined(obj)) {
      throw "spyOn could not find an object to spy upon for " + methodName + "()";
    }

    if (j$.util.isUndefined(obj[methodName])) {
      throw methodName + '() method does not exist';
    }

    if (obj[methodName] && obj[methodName].isSpy) {
      //TODO?: should this return the current spy? Downside: may cause user confusion about spy state
      throw new Error(methodName + ' has already been spied upon');
    }

    var spyObj = j$.createSpy(methodName);

    this.spies_.push(spyObj);
    spyObj.baseObj = obj;
    spyObj.methodName = methodName;
    spyObj.originalValue = obj[methodName];

    obj[methodName] = spyObj;

    return spyObj;
  };

  // TODO: move this to closure
  Env.prototype.removeAllSpies = function() {
    for (var i = 0; i < this.spies_.length; i++) {
      var spy = this.spies_[i];
      spy.baseObj[spy.methodName] = spy.originalValue;
    }
    this.spies_ = [];
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
    var suite = this.suiteFactory(description, specDefinitions);

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
    throw new Error(j$.Spec.pendingSpecExceptionMessage);
  };

  // TODO: Still needed?
  Env.prototype.currentRunner = function() {
    return this.topSuite;
  };

  Env.prototype.compareRegExps_ = function(a, b, mismatchKeys, mismatchValues) {
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

  Env.prototype.compareObjects_ = function(a, b, mismatchKeys, mismatchValues) {
    if (a.__Jasmine_been_here_before__ === b && b.__Jasmine_been_here_before__ === a) {
      return true;
    }

    a.__Jasmine_been_here_before__ = b;
    b.__Jasmine_been_here_before__ = a;

    var hasKey = function(obj, keyName) {
      return obj !== null && !j$.util.isUndefined(obj[keyName]);
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
        mismatchValues.push("'" + property + "' was '" + (b[property] ? j$.util.htmlEscape(b[property].toString()) : b[property]) + "' in expected, but was '" + (a[property] ? j$.util.htmlEscape(a[property].toString()) : a[property]) + "' in actual.");
      }
    }

    if (j$.isArray_(a) && j$.isArray_(b) && a.length != b.length) {
      mismatchValues.push("arrays were not the same length");
    }

    delete a.__Jasmine_been_here_before__;
    delete b.__Jasmine_been_here_before__;
    return (mismatchKeys.length === 0 && mismatchValues.length === 0);
  };

  Env.prototype.equals_ = function(a, b, mismatchKeys, mismatchValues) {
    mismatchKeys = mismatchKeys || [];
    mismatchValues = mismatchValues || [];

    for (var i = 0; i < this.equalityTesters_.length; i++) {
      var equalityTester = this.equalityTesters_[i];
      var result = equalityTester(a, b, this, mismatchKeys, mismatchValues);
      if (!j$.util.isUndefined(result)) {
        return result;
      }
    }

    if (a === b) return true;

    if (j$.util.isUndefined(a) || a === null || j$.util.isUndefined(b) || b === null) {
      return (j$.util.isUndefined(a) && j$.util.isUndefined(b));
    }

    if (j$.isDomNode(a) && j$.isDomNode(b)) {
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

    if (a instanceof j$.Matchers.ObjectContaining) {
      return a.matches(b);
    }

    if (b instanceof j$.Matchers.ObjectContaining) {
      return b.matches(a);
    }

    if (j$.isString_(a) && j$.isString_(b)) {
      return (a == b);
    }

    if (j$.isNumber_(a) && j$.isNumber_(b)) {
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

  Env.prototype.contains_ = function(haystack, needle) {
    if (j$.isArray_(haystack)) {
      for (var i = 0; i < haystack.length; i++) {
        if (this.equals_(haystack[i], needle)) return true;
      }
      return false;
    }
    return haystack.indexOf(needle) >= 0;
  };

  Env.prototype.addEqualityTester = function(equalityTester) {
    this.equalityTesters_.push(equalityTester);
  };

  return Env;
};

getJasmineRequireObj().JsApiReporter = function() {
  function JsApiReporter(jasmine) {  // TODO: this doesn't appear to be used
    this.jasmine = jasmine || {};
    this.started = false;
    this.finished = false;

    var status = 'loaded';

    this.jasmineStarted = function() {
      this.started = true;
      status = 'started';
    };

    this.jasmineDone = function() {
      this.finished = true;
      status = 'done';
    };

    this.status = function() {
      return status;
    };

    var suites = {};

    this.suiteStarted = function(result) {
      storeSuite(result);
    };

    this.suiteDone = function(result) {
      storeSuite(result);
    };

    function storeSuite(result) {
      suites[result.id] = result;
    }

    this.suites = function() {
      return suites;
    };

    var specs = [];
    this.specStarted = function(result) { };

    this.specDone = function(result) {
      specs.push(result);
    };

    this.specResults = function(index, length) {
      return specs.slice(index, index + length);
    };

    this.specs = function() {
      return specs;
    };

  }

  return JsApiReporter;
};

getJasmineRequireObj().Clock = function() {
  function Clock(global, delayedFunctionScheduler) {
    var self = this,
      realTimingFunctions = {
        setTimeout: global.setTimeout,
        clearTimeout: global.clearTimeout,
        setInterval: global.setInterval,
        clearInterval: global.clearInterval
      },
      fakeTimingFunctions = {
        setTimeout: setTimeout,
        clearTimeout: clearTimeout,
        setInterval: setInterval,
        clearInterval: clearInterval
      },
      timer = realTimingFunctions,
      installed = false;

    self.install = function() {
      installed = true;
      timer = fakeTimingFunctions;
    };

    self.uninstall = function() {
      delayedFunctionScheduler.reset();
      installed = false;
      timer = realTimingFunctions;
    };

    self.setTimeout = function(fn, delay, params) {
      if (legacyIE()) {
        if (arguments.length > 2) {
          throw new Error("IE < 9 cannot support extra params to setTimeout without a polyfill");
        }
        return timer.setTimeout(fn, delay);
      }
      return timer.setTimeout.apply(global, arguments);
    };

    self.setInterval = function(fn, delay, params) {
      if (legacyIE()) {
        if (arguments.length > 2) {
          throw new Error("IE < 9 cannot support extra params to setInterval without a polyfill");
        }
        return timer.setInterval(fn, delay);
      }
      return timer.setInterval.apply(global, arguments);
    };

    self.clearTimeout = function(id) {
      return timer.clearTimeout.call(global, id);
    };

    self.clearInterval = function(id) {
      return timer.clearInterval.call(global, id);
    };

    self.tick = function(millis) {
      if (installed) {
        delayedFunctionScheduler.tick(millis);
      } else {
        throw new Error("Mock clock is not installed, use jasmine.Clock.useMock()");
      }
    };

    return self;

    function legacyIE() {
      //if these methods are polyfilled, apply will be present
      //TODO: it may be difficult to load the polyfill before jasmine loads
      //(env should be new-ed inside of onload)
      return !(global.setTimeout || global.setInterval).apply;
    }

    function setTimeout(fn, delay) {
      return delayedFunctionScheduler.scheduleFunction(fn, delay, argSlice(arguments, 2));
    }

    function clearTimeout(id) {
      return delayedFunctionScheduler.removeFunctionWithId(id);
    }

    function setInterval(fn, interval) {
      return delayedFunctionScheduler.scheduleFunction(fn, interval, argSlice(arguments, 2), true);
    }

    function clearInterval(id) {
      return delayedFunctionScheduler.removeFunctionWithId(id);
    }

    function argSlice(argsObj, n) {
      return Array.prototype.slice.call(argsObj, 2);
    }
  }

  return Clock;
};

getJasmineRequireObj().DelayedFunctionScheduler = function() {
  function DelayedFunctionScheduler() {
    var self = this;
    var scheduledFunctions = {};
    var currentTime = 0;
    var delayedFnCount = 0;

    self.tick = function(millis) {
      millis = millis || 0;
      runFunctionsWithinRange(currentTime, currentTime + millis);
      currentTime = currentTime + millis;
    };

    self.scheduleFunction = function(funcToCall, millis, params, recurring, timeoutKey, runAtMillis) {
      millis = millis || 0;
      timeoutKey = timeoutKey || ++delayedFnCount;
      runAtMillis = runAtMillis || (currentTime + millis);
      scheduledFunctions[timeoutKey] = {
        runAtMillis: runAtMillis,
        funcToCall: funcToCall,
        recurring: recurring,
        params: params,
        timeoutKey: timeoutKey,
        millis: millis
      };
      return timeoutKey;
    };

    self.removeFunctionWithId = function(timeoutKey) {
      delete scheduledFunctions[timeoutKey];
    };

    self.reset = function() {
      currentTime = 0;
      scheduledFunctions = {};
      delayedFnCount = 0;
    };

    return self;

    // finds/dupes functions within range and removes them.
    function functionsWithinRange(startMillis, endMillis) {
      var fnsToRun = [];
      for (var timeoutKey in scheduledFunctions) {
        var scheduledFunc = scheduledFunctions[timeoutKey];
        if (scheduledFunc &&
          scheduledFunc.runAtMillis >= startMillis &&
          scheduledFunc.runAtMillis <= endMillis) {

          // remove fn -- we'll reschedule later if it is recurring.
          self.removeFunctionWithId(timeoutKey);
          if (!scheduledFunc.recurring) {
            fnsToRun.push(scheduledFunc); // schedules each function only once
          } else {
            fnsToRun.push(buildNthInstanceOf(scheduledFunc, 0));
            var additionalTimesFnRunsInRange =
              Math.floor((endMillis - scheduledFunc.runAtMillis) / scheduledFunc.millis);
            for (var i = 0; i < additionalTimesFnRunsInRange; i++) {
              fnsToRun.push(buildNthInstanceOf(scheduledFunc, i + 1));
            }
            reschedule(buildNthInstanceOf(scheduledFunc, additionalTimesFnRunsInRange));
          }
        }
      }

      return fnsToRun;
    }

    function buildNthInstanceOf(scheduledFunc, n) {
      return {
        runAtMillis: scheduledFunc.runAtMillis + (scheduledFunc.millis * n),
        funcToCall: scheduledFunc.funcToCall,
        params: scheduledFunc.params,
        millis: scheduledFunc.millis,
        recurring: scheduledFunc.recurring,
        timeoutKey: scheduledFunc.timeoutKey
      };
    }

    function reschedule(scheduledFn) {
      self.scheduleFunction(scheduledFn.funcToCall,
        scheduledFn.millis,
        scheduledFn.params,
        true,
        scheduledFn.timeoutKey,
        scheduledFn.runAtMillis + scheduledFn.millis);
    }


    function runFunctionsWithinRange(startMillis, endMillis) {
      var funcsToRun = functionsWithinRange(startMillis, endMillis);
      if (funcsToRun.length === 0) {
        return;
      }

      funcsToRun.sort(function(a, b) {
        return a.runAtMillis - b.runAtMillis;
      });

      for (var i = 0; i < funcsToRun.length; ++i) {
        var funcToRun = funcsToRun[i];
        funcToRun.funcToCall.apply(null, funcToRun.params);
      }
    }
  }

  return DelayedFunctionScheduler;
};

getJasmineRequireObj().ExceptionFormatter = function() {
  function ExceptionFormatter() {
    this.message = function(error) {
      var message = error.name +
        ': ' +
        error.message;

      if (error.fileName || error.sourceURL) {
        message += " in " + (error.fileName || error.sourceURL);
      }

      if (error.line || error.lineNumber) {
        message += " (line " + (error.line || error.lineNumber) + ")";
      }

      return message;
    };

    this.stack = function(error) {
      return error ? error.stack : null;
    };
  }

  return ExceptionFormatter;
};

//TODO: expectation result may make more sense as a presentation of an expectation.
getJasmineRequireObj().buildExpectationResult = function() {
  function buildExpectationResult(options) {
    var messageFormatter = options.messageFormatter || function() {},
      stackFormatter = options.stackFormatter || function() {};

    return {
      matcherName: options.matcherName,
      expected: options.expected,
      actual: options.actual,
      message: message(),
      stack: stack(),
      passed: options.passed
    };

    function message() {
      if (options.passed) {
        return "Passed.";
      } else if (options.message) {
        return options.message;
      } else if (options.error) {
        return messageFormatter(options.error);
      }
      return "";
    }

    function stack() {
      if (options.passed) {
        return "";
      }

      var error = options.error;
      if (!error) {
        try {
          throw new Error(message());
        } catch (e) {
          error = e;
        }
      }
      return stackFormatter(error);
    }
  }

  return buildExpectationResult;
};

getJasmineRequireObj().Matchers = function(j$) {
  function Matchers(env, actual, spec, opt_isNot) {
    //TODO: true dependency: equals, contains
    this.env = env;
    this.actual = actual;
    this.spec = spec;
    this.isNot = opt_isNot || false;
  }

  Matchers.wrapInto_ = function(prototype, matchersClass) {
    for (var methodName in prototype) {
      var orig = prototype[methodName];
      matchersClass.prototype[methodName] = Matchers.matcherFn_(methodName, orig);
    }
  };

  Matchers.matcherFn_ = function(matcherName, matcherFunction) {
    return function() {
      var matcherArgs = j$.util.argsToArray(arguments);
      var result = matcherFunction.apply(this, arguments);

      if (this.isNot) {
        result = !result;
      }

      var message;
      if (!result) {
        if (this.message) {
          message = this.message.apply(this, arguments);
          if (j$.isArray_(message)) {
            message = message[this.isNot ? 1 : 0];
          }
        } else {
          var englishyPredicate = matcherName.replace(/[A-Z]/g, function(s) { return ' ' + s.toLowerCase(); });
          message = "Expected " + j$.pp(this.actual) + (this.isNot ? " not " : " ") + englishyPredicate;
          if (matcherArgs.length > 0) {
            for (var i = 0; i < matcherArgs.length; i++) {
              if (i > 0) message += ",";
              message += " " + j$.pp(matcherArgs[i]);
            }
          }
          message += ".";
        }
      }

      this.spec.addExpectationResult(result, {
        matcherName: matcherName,
        passed: result,
        expected: matcherArgs.length > 1 ? matcherArgs : matcherArgs[0],
        actual: this.actual,
        message: message
      });
      return void 0;
    };
  };

  Matchers.prototype.toBe = function(expected) {
    return this.actual === expected;
  };

  Matchers.prototype.toNotBe = function(expected) {
    return this.actual !== expected;
  };

  Matchers.prototype.toEqual = function(expected) {
    return this.env.equals_(this.actual, expected);
  };

  Matchers.prototype.toNotEqual = function(expected) {
    return !this.env.equals_(this.actual, expected);
  };

  Matchers.prototype.toMatch = function(expected) {
    return new RegExp(expected).test(this.actual);
  };

  Matchers.prototype.toNotMatch = function(expected) {
    return !(new RegExp(expected).test(this.actual));
  };

  Matchers.prototype.toBeDefined = function() {
    return !j$.util.isUndefined(this.actual);
  };

  Matchers.prototype.toBeUndefined = function() {
    return j$.util.isUndefined(this.actual);
  };

  Matchers.prototype.toBeNull = function() {
    return (this.actual === null);
  };

  Matchers.prototype.toBeNaN = function() {
    this.message = function() {
      return [ "Expected " + j$.pp(this.actual) + " to be NaN." ];
    };

    return (this.actual !== this.actual);
  };

  Matchers.prototype.toBeTruthy = function() {
    return !!this.actual;
  };

  Matchers.prototype.toBeFalsy = function() {
    return !this.actual;
  };

  Matchers.prototype.toHaveBeenCalled = function() {
    if (arguments.length > 0) {
      throw new Error('toHaveBeenCalled does not take arguments, use toHaveBeenCalledWith');
    }

    if (!j$.isSpy(this.actual)) {
      throw new Error('Expected a spy, but got ' + j$.pp(this.actual) + '.');
    }

    this.message = function() {
      return [
        "Expected spy " + this.actual.identity + " to have been called.",
        "Expected spy " + this.actual.identity + " not to have been called."
      ];
    };

    return this.actual.wasCalled;
  };

// TODO: kill this for 2.0
  Matchers.prototype.wasCalled = Matchers.prototype.toHaveBeenCalled;

  Matchers.prototype.wasNotCalled = function() {
    if (arguments.length > 0) {
      throw new Error('wasNotCalled does not take arguments');
    }

    if (!j$.isSpy(this.actual)) {
      throw new Error('Expected a spy, but got ' + j$.pp(this.actual) + '.');
    }

    this.message = function() {
      return [
        "Expected spy " + this.actual.identity + " to not have been called.",
        "Expected spy " + this.actual.identity + " to have been called."
      ];
    };

    return !this.actual.wasCalled;
  };

  Matchers.prototype.toHaveBeenCalledWith = function() {
    var expectedArgs = j$.util.argsToArray(arguments);
    if (!j$.isSpy(this.actual)) {
      throw new Error('Expected a spy, but got ' + j$.pp(this.actual) + '.');
    }
    this.message = function() {
      var invertedMessage = "Expected spy " + this.actual.identity + " not to have been called with " + j$.pp(expectedArgs) + " but it was.";
      var positiveMessage = "";
      if (this.actual.callCount === 0) {
        positiveMessage = "Expected spy " + this.actual.identity + " to have been called with " + j$.pp(expectedArgs) + " but it was never called.";
      } else {
        positiveMessage = "Expected spy " + this.actual.identity + " to have been called with " + j$.pp(expectedArgs) + " but actual calls were " + j$.pp(this.actual.argsForCall).replace(/^\[ | \]$/g, '');
      }
      return [positiveMessage, invertedMessage];
    };

    return this.env.contains_(this.actual.argsForCall, expectedArgs);
  };

// TODO: kill for 2.0
  Matchers.prototype.wasCalledWith = Matchers.prototype.toHaveBeenCalledWith;

// TODO: kill for 2.0
  Matchers.prototype.wasNotCalledWith = function() {
    var expectedArgs = j$.util.argsToArray(arguments);
    if (!j$.isSpy(this.actual)) {
      throw new Error('Expected a spy, but got ' + j$.pp(this.actual) + '.');
    }

    this.message = function() {
      return [
        "Expected spy not to have been called with " + j$.pp(expectedArgs) + " but it was",
        "Expected spy to have been called with " + j$.pp(expectedArgs) + " but it was"
      ];
    };

    return !this.env.contains_(this.actual.argsForCall, expectedArgs);
  };

  Matchers.prototype.toContain = function(expected) {
    return this.env.contains_(this.actual, expected);
  };

  Matchers.prototype.toNotContain = function(expected) {
    return !this.env.contains_(this.actual, expected);
  };

  Matchers.prototype.toBeLessThan = function(expected) {
    return this.actual < expected;
  };

  Matchers.prototype.toBeGreaterThan = function(expected) {
    return this.actual > expected;
  };

  Matchers.prototype.toBeCloseTo = function(expected, precision) {
    if (precision !== 0) {
      precision = precision || 2;
    }
    return Math.abs(expected - this.actual) < (Math.pow(10, -precision) / 2);
  };

  Matchers.prototype.toThrow = function(expected) {
    var result = false;
    var exception, exceptionMessage;
    if (typeof this.actual != 'function') {
      throw new Error('Actual is not a function');
    }
    try {
      this.actual();
    } catch (e) {
      exception = e;
    }

    if (exception) {
      exceptionMessage = exception.message || exception;
      result = (j$.util.isUndefined(expected) || this.env.equals_(exceptionMessage, expected.message || expected) || (j$.isA_("RegExp", expected) && expected.test(exceptionMessage)));
    }

    var not = this.isNot ? "not " : "";
    var regexMatch = j$.isA_("RegExp", expected) ? " an exception matching" : "";

    this.message = function() {
      if (exception) {
        return ["Expected function " + not + "to throw" + regexMatch, expected ? expected.message || expected : "an exception", ", but it threw", exceptionMessage].join(' ');
      } else {
        return "Expected function to throw an exception.";
      }
    };

    return result;
  };

  Matchers.Any = function(expectedClass) {
    this.expectedClass = expectedClass;
  };

  Matchers.Any.prototype.jasmineMatches = function(other) {
    if (this.expectedClass == String) {
      return typeof other == 'string' || other instanceof String;
    }

    if (this.expectedClass == Number) {
      return typeof other == 'number' || other instanceof Number;
    }

    if (this.expectedClass == Function) {
      return typeof other == 'function' || other instanceof Function;
    }

    if (this.expectedClass == Object) {
      return typeof other == 'object';
    }

    return other instanceof this.expectedClass;
  };

  Matchers.Any.prototype.jasmineToString = function() {
    return '<jasmine.any(' + this.expectedClass + ')>';
  };

  Matchers.ObjectContaining = function(sample) {
    this.sample = sample;
  };

  Matchers.ObjectContaining.prototype.jasmineMatches = function(other, mismatchKeys, mismatchValues) {
    mismatchKeys = mismatchKeys || [];
    mismatchValues = mismatchValues || [];

    var env = j$.getEnv();

    var hasKey = function(obj, keyName) {
      return obj !== null && !j$.util.isUndefined(obj[keyName]);
    };

    for (var property in this.sample) {
      if (!hasKey(other, property) && hasKey(this.sample, property)) {
        mismatchKeys.push("expected has key '" + property + "', but missing from actual.");
      }
      else if (!env.equals_(this.sample[property], other[property], mismatchKeys, mismatchValues)) {
        mismatchValues.push("'" + property + "' was '" + (other[property] ? j$.util.htmlEscape(other[property].toString()) : other[property]) + "' in expected, but was '" + (this.sample[property] ? j$.util.htmlEscape(this.sample[property].toString()) : this.sample[property]) + "' in actual.");
      }
    }

    return (mismatchKeys.length === 0 && mismatchValues.length === 0);
  };

  Matchers.ObjectContaining.prototype.jasmineToString = function() {
    return "<jasmine.objectContaining(" + j$.pp(this.sample) + ")>";
  };

  return Matchers;

};

getJasmineRequireObj().StringPrettyPrinter = function(j$) {

  function PrettyPrinter() {
    this.ppNestLevel_ = 0;
  }

  PrettyPrinter.prototype.format = function(value) {
    this.ppNestLevel_++;
    try {
      if (j$.util.isUndefined(value)) {
        this.emitScalar('undefined');
      } else if (value === null) {
        this.emitScalar('null');
      } else if (value === j$.getGlobal()) {
        this.emitScalar('<global>');
      } else if (value.jasmineToString) {
        this.emitScalar(value.jasmineToString());
      } else if (typeof value === 'string') {
        this.emitString(value);
      } else if (j$.isSpy(value)) {
        this.emitScalar("spy on " + value.identity);
      } else if (value instanceof RegExp) {
        this.emitScalar(value.toString());
      } else if (typeof value === 'function') {
        this.emitScalar('Function');
      } else if (typeof value.nodeType === 'number') {
        this.emitScalar('HTMLNode');
      } else if (value instanceof Date) {
        this.emitScalar('Date(' + value + ')');
      } else if (value.__Jasmine_been_here_before__) {
        this.emitScalar('<circular reference: ' + (j$.isArray_(value) ? 'Array' : 'Object') + '>');
      } else if (j$.isArray_(value) || typeof value == 'object') {
        value.__Jasmine_been_here_before__ = true;
        if (j$.isArray_(value)) {
          this.emitArray(value);
        } else {
          this.emitObject(value);
        }
        delete value.__Jasmine_been_here_before__;
      } else {
        this.emitScalar(value.toString());
      }
    } finally {
      this.ppNestLevel_--;
    }
  };

  PrettyPrinter.prototype.iterateObject = function(obj, fn) {
    for (var property in obj) {
      if (!obj.hasOwnProperty(property)) continue;
      if (property == '__Jasmine_been_here_before__') continue;
      fn(property, obj.__lookupGetter__ ? (!j$.util.isUndefined(obj.__lookupGetter__(property)) &&
        obj.__lookupGetter__(property) !== null) : false);
    }
  };

  PrettyPrinter.prototype.emitArray = j$.unimplementedMethod_;
  PrettyPrinter.prototype.emitObject = j$.unimplementedMethod_;
  PrettyPrinter.prototype.emitScalar = j$.unimplementedMethod_;
  PrettyPrinter.prototype.emitString = j$.unimplementedMethod_;

  function StringPrettyPrinter() {
    PrettyPrinter.call(this);

    this.string = '';
  }
  j$.util.inherit(StringPrettyPrinter, PrettyPrinter);

  StringPrettyPrinter.prototype.emitScalar = function(value) {
    this.append(value);
  };

  StringPrettyPrinter.prototype.emitString = function(value) {
    this.append("'" + value + "'");
  };

  StringPrettyPrinter.prototype.emitArray = function(array) {
    if (this.ppNestLevel_ > j$.MAX_PRETTY_PRINT_DEPTH) {
      this.append("Array");
      return;
    }

    this.append('[ ');
    for (var i = 0; i < array.length; i++) {
      if (i > 0) {
        this.append(', ');
      }
      this.format(array[i]);
    }
    this.append(' ]');
  };

  StringPrettyPrinter.prototype.emitObject = function(obj) {
    if (this.ppNestLevel_ > j$.MAX_PRETTY_PRINT_DEPTH) {
      this.append("Object");
      return;
    }

    var self = this;
    this.append('{ ');
    var first = true;

    this.iterateObject(obj, function(property, isGetter) {
      if (first) {
        first = false;
      } else {
        self.append(', ');
      }

      self.append(property);
      self.append(' : ');
      if (isGetter) {
        self.append('<getter>');
      } else {
        self.format(obj[property]);
      }
    });

    this.append(' }');
  };

  StringPrettyPrinter.prototype.append = function(value) {
    this.string += value;
  };

  return StringPrettyPrinter;
};

getJasmineRequireObj().QueueRunner = function() {

  function QueueRunner(attrs) {
    this.fns = attrs.fns || [];
    this.onComplete = attrs.onComplete || function() {};
    this.encourageGC = attrs.encourageGC || function(fn) {fn();};
    this.onException = attrs.onException || function() {};
    this.catchException = attrs.catchException || function() { return true; };
  }

  QueueRunner.prototype.execute = function() {
    this.run(this.fns, 0);
  };

  QueueRunner.prototype.run = function(fns, index) {
    if (index >= fns.length) {
      this.encourageGC(this.onComplete);
      return;
    }

    var fn = fns[index];
    var self = this;
    if (fn.length > 0) {
      attempt(function() { fn.call(self, function() { self.run(fns, index + 1); }); });
    } else {
      attempt(function() { fn.call(self); });
      self.run(fns, index + 1);
    }

    function attempt(fn) {
      try {
        fn();
      } catch (e) {
        self.onException(e);
        if (!self.catchException(e)) {
          //TODO: set a var when we catch an exception and
          //use a finally block to close the loop in a nice way..
          throw e;
        }
      }
    }
  };

  return QueueRunner;
};

getJasmineRequireObj().ReportDispatcher = function() {
  function ReportDispatcher(methods) {

    var dispatchedMethods = methods || [];

    for (var i = 0; i < dispatchedMethods.length; i++) {
      var method = dispatchedMethods[i];
      this[method] = function(m) {
        return function() {
          dispatch(m, arguments);
        };
      }(method);
    }

    var reporters = [];

    this.addReporter = function(reporter) {
      reporters.push(reporter);
    };

    return this;

    function dispatch(method, args) {
      for (var i = 0; i < reporters.length; i++) {
        var reporter = reporters[i];
        if (reporter[method]) {
          reporter[method].apply(reporter, args);
        }
      }
    }
  }

  return ReportDispatcher;
};


getJasmineRequireObj().Suite = function() {
  function Suite(attrs) {
    this.env = attrs.env;
    this.id = attrs.id;
    this.parentSuite = attrs.parentSuite;
    this.description = attrs.description;
    this.onStart = attrs.onStart || function() {};
    this.completeCallback = attrs.completeCallback || function() {};
    this.resultCallback = attrs.resultCallback || function() {};
    this.encourageGC = attrs.encourageGC || function(fn) {fn();};

    this.beforeFns = [];
    this.afterFns = [];
    this.queueRunner = attrs.queueRunner || function() {};
    this.disabled = false;

    this.children_ = []; // TODO: rename
    this.suites = []; // TODO: needed?
    this.specs = [];  // TODO: needed?

    this.result = {
      id: this.id,
      status: this.disabled ? 'disabled' : '',
      description: this.description,
      fullName: this.getFullName()
    };
  }

  Suite.prototype.getFullName = function() {
    var fullName = this.description;
    for (var parentSuite = this.parentSuite; parentSuite; parentSuite = parentSuite.parentSuite) {
      if (parentSuite.parentSuite) {
        fullName = parentSuite.description + ' ' + fullName;
      }
    }
    return fullName;
  };

  Suite.prototype.disable = function() {
    this.disabled = true;
  };

  Suite.prototype.beforeEach = function(fn) {
    this.beforeFns.unshift(fn);
  };

  Suite.prototype.afterEach = function(fn) {
    this.afterFns.unshift(fn);
  };

  Suite.prototype.addSpec = function(spec) {
    this.children_.push(spec);
    this.specs.push(spec);   // TODO: needed?
  };

  Suite.prototype.addSuite = function(suite) {
    suite.parentSuite = this;
    this.children_.push(suite);
    this.suites.push(suite);    // TODO: needed?
  };

  Suite.prototype.children = function() {
    return this.children_;
  };

  Suite.prototype.execute = function(onComplete) {
    var self = this;
    if (this.disabled) {
      complete();
      return;
    }

    var allFns = [],
      children = this.children_;

    for (var i = 0; i < children.length; i++) {
      allFns.push(wrapChild(children[i]));
    }

    this.onStart(this);

    this.queueRunner({
      fns: allFns,
      onComplete: complete
    });

    function complete() {
      self.resultCallback(self.result);

      if (onComplete) {
        onComplete();
      }
    }

    function wrapChild(child) {
      return function(done) {
        child.execute(done);
      };
    }
  };
  
  return Suite;
};

if (typeof window == void 0 && typeof exports == "object") {
  exports.Suite = jasmineRequire.Suite;
}

getJasmineRequireObj().version = function() {
  return "2.0.0-alpha";
};