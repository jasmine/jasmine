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

/**
 * Top level namespace for Jasmine, a lightweight JavaScript BDD/spec/testing framework.
 *
 * @namespace
 */
var jasmine = {};

// TODO: do we need this now that we have boot.js?
if (typeof window == "undefined" && typeof exports == "object") {
  exports.jasmine = jasmine;
}

/**
 * @private
 */
jasmine.unimplementedMethod_ = function() {
  throw new Error("unimplemented method");
};

/**
 * Default interval in milliseconds for event loop yields (e.g. to allow network activity or to refresh the screen with the HTML-based runner). Small values here may result in slow test running. Zero means no updates until all tests have completed.
 *
 */
jasmine.DEFAULT_UPDATE_INTERVAL = 250;

/**
 * Maximum levels of nesting that will be included when an object is pretty-printed
 */
jasmine.MAX_PRETTY_PRINT_DEPTH = 40;

/**
 * Default timeout interval in milliseconds for waitsFor() blocks.
 */
jasmine.DEFAULT_TIMEOUT_INTERVAL = 5000;

jasmine.getGlobal = function() {
  function getGlobal() {
    return this;
  }

  return getGlobal();
};

/**
 * Getter for the Jasmine environment. Ensures one gets created
 */
jasmine.getEnv = function(options) {
  var env = jasmine.currentEnv_ = jasmine.currentEnv_ || new jasmine.Env(options);
  //jasmine. singletons in here (setTimeout blah blah).
  return env;
};

/**
 * @ignore
 * @private
 * @param value
 * @returns {Boolean}
 */
jasmine.isArray_ = function(value) {
  return jasmine.isA_("Array", value);
};

/**
 * @ignore
 * @private
 * @param value
 * @returns {Boolean}
 */
jasmine.isString_ = function(value) {
  return jasmine.isA_("String", value);
};

/**
 * @ignore
 * @private
 * @param value
 * @returns {Boolean}
 */
jasmine.isNumber_ = function(value) {
  return jasmine.isA_("Number", value);
};

/**
 * @ignore
 * @private
 * @param {String} typeName
 * @param value
 * @returns {Boolean}
 */
jasmine.isA_ = function(typeName, value) {
  return Object.prototype.toString.apply(value) === '[object ' + typeName + ']';
};

/**
 * Pretty printer for expecations.  Takes any object and turns it into a human-readable string.
 *
 * @param value {Object} an object to be outputted
 * @returns {String}
 */
jasmine.pp = function(value) {
  var stringPrettyPrinter = new jasmine.StringPrettyPrinter();
  stringPrettyPrinter.format(value);
  return stringPrettyPrinter.string;
};

/**
 * Returns true if the object is a DOM Node.
 *
 * @param {Object} obj object to check
 * @returns {Boolean}
 */
jasmine.isDomNode = function(obj) {
  return obj.nodeType > 0;
};

/**
 * Returns a matchable 'generic' object of the class type.  For use in expecations of type when values don't matter.
 *
 * @example
 * // don't care about which function is passed in, as long as it's a function
 * expect(mySpy).toHaveBeenCalledWith(jasmine.any(Function));
 *
 * @param {Class} clazz
 * @returns matchable object of the type clazz
 */
jasmine.any = function(clazz) {
  return new jasmine.Matchers.Any(clazz);
};

/**
 * Returns a matchable subset of a JSON object. For use in expectations when you don't care about all of the
 * attributes on the object.
 *
 * @example
 * // don't care about any other attributes than foo.
 * expect(mySpy).toHaveBeenCalledWith(jasmine.objectContaining({foo: "bar"});
 *
 * @param sample {Object} sample
 * @returns matchable object for the sample
 */
jasmine.objectContaining = function (sample) {
    return new jasmine.Matchers.ObjectContaining(sample);
};

/**
 * Jasmine Spies are test doubles that can act as stubs, spies, fakes or when used in an expecation, mocks.
 *
 * Spies should be created in test setup, before expectations.  They can then be checked, using the standard Jasmine
 * expectation syntax. Spies can be checked if they were called or not and what the calling params were.
 *
 * A Spy has the following fields: wasCalled, callCount, mostRecentCall, and argsForCall (see docs).
 *
 * Spies are torn down at the end of every spec.
 *
 * Note: Do <b>not</b> call new jasmine.Spy() directly - a spy must be created using spyOn, jasmine.createSpy or jasmine.createSpyObj.
 *
 * @example
 * // a stub
 * var myStub = jasmine.createSpy('myStub');  // can be used anywhere
 *
 * // spy example
 * var foo = {
 *   not: function(bool) { return !bool; }
 * }
 *
 * // actual foo.not will not be called, execution stops
 * spyOn(foo, 'not');

 // foo.not spied upon, execution will continue to implementation
 * spyOn(foo, 'not').andCallThrough();
 *
 * // fake example
 * var foo = {
 *   not: function(bool) { return !bool; }
 * }
 *
 * // foo.not(val) will return val
 * spyOn(foo, 'not').andCallFake(function(value) {return value;});
 *
 * // mock example
 * foo.not(7 == 7);
 * expect(foo.not).toHaveBeenCalled();
 * expect(foo.not).toHaveBeenCalledWith(true);
 *
 * @constructor
 * @see spyOn, jasmine.createSpy, jasmine.createSpyObj
 * @param {String} name
 */
jasmine.Spy = function(name) {
  /**
   * The name of the spy, if provided.
   */
  this.identity = name || 'unknown';
  /**
   *  Is this Object a spy?
   */
  this.isSpy = true;
  /**
   * The actual function this spy stubs.
   */
  this.plan = function() {
  };
  /**
   * Tracking of the most recent call to the spy.
   * @example
   * var mySpy = jasmine.createSpy('foo');
   * mySpy(1, 2);
   * mySpy.mostRecentCall.args = [1, 2];
   */
  this.mostRecentCall = {};

  /**
   * Holds arguments for each call to the spy, indexed by call count
   * @example
   * var mySpy = jasmine.createSpy('foo');
   * mySpy(1, 2);
   * mySpy(7, 8);
   * mySpy.mostRecentCall.args = [7, 8];
   * mySpy.argsForCall[0] = [1, 2];
   * mySpy.argsForCall[1] = [7, 8];
   */
  this.argsForCall = [];
  this.calls = [];
};

/**
 * Tells a spy to call through to the actual implemenatation.
 *
 * @example
 * var foo = {
 *   bar: function() { // do some stuff }
 * }
 *
 * // defining a spy on an existing property: foo.bar
 * spyOn(foo, 'bar').andCallThrough();
 */
jasmine.Spy.prototype.andCallThrough = function() {
  this.plan = this.originalValue;
  return this;
};

/**
 * For setting the return value of a spy.
 *
 * @example
 * // defining a spy from scratch: foo() returns 'baz'
 * var foo = jasmine.createSpy('spy on foo').andReturn('baz');
 *
 * // defining a spy on an existing property: foo.bar() returns 'baz'
 * spyOn(foo, 'bar').andReturn('baz');
 *
 * @param {Object} value
 */
jasmine.Spy.prototype.andReturn = function(value) {
  this.plan = function() {
    return value;
  };
  return this;
};

/**
 * For throwing an exception when a spy is called.
 *
 * @example
 * // defining a spy from scratch: foo() throws an exception w/ message 'ouch'
 * var foo = jasmine.createSpy('spy on foo').andThrow('baz');
 *
 * // defining a spy on an existing property: foo.bar() throws an exception w/ message 'ouch'
 * spyOn(foo, 'bar').andThrow('baz');
 *
 * @param {String} exceptionMsg
 */
jasmine.Spy.prototype.andThrow = function(exceptionMsg) {
  this.plan = function() {
    throw exceptionMsg;
  };
  return this;
};

/**
 * Calls an alternate implementation when a spy is called.
 *
 * @example
 * var baz = function() {
 *   // do some stuff, return something
 * }
 * // defining a spy from scratch: foo() calls the function baz
 * var foo = jasmine.createSpy('spy on foo').andCall(baz);
 *
 * // defining a spy on an existing property: foo.bar() calls an anonymnous function
 * spyOn(foo, 'bar').andCall(function() { return 'baz';} );
 *
 * @param {Function} fakeFunc
 */
jasmine.Spy.prototype.andCallFake = function(fakeFunc) {
  this.plan = fakeFunc;
  return this;
};

/**
 * Resets all of a spy's the tracking variables so that it can be used again.
 *
 * @example
 * spyOn(foo, 'bar');
 *
 * foo.bar();
 *
 * expect(foo.bar.callCount).toEqual(1);
 *
 * foo.bar.reset();
 *
 * expect(foo.bar.callCount).toEqual(0);
 */
jasmine.Spy.prototype.reset = function() {
  this.wasCalled = false;
  this.callCount = 0;
  this.argsForCall = [];
  this.calls = [];
  this.mostRecentCall = {};
};

jasmine.createSpy = function(name) {

  var spyObj = function() {
    spyObj.wasCalled = true;
    spyObj.callCount++;
    var args = jasmine.util.argsToArray(arguments);
    spyObj.mostRecentCall.object = this;
    spyObj.mostRecentCall.args = args;
    spyObj.argsForCall.push(args);
    spyObj.calls.push({object: this, args: args});
    return spyObj.plan.apply(this, arguments);
  };

  var spy = new jasmine.Spy(name);

  for (var prop in spy) {
    spyObj[prop] = spy[prop];
  }

  spyObj.reset();

  return spyObj;
};

/**
 * Determines whether an object is a spy.
 *
 * @param {jasmine.Spy|Object} putativeSpy
 * @returns {Boolean}
 */
jasmine.isSpy = function(putativeSpy) {
  return putativeSpy && putativeSpy.isSpy;
};

/**
 * Creates a more complicated spy: an Object that has every property a function that is a spy.  Used for stubbing something
 * large in one call.
 *
 * @param {String} baseName name of spy class
 * @param {Array} methodNames array of names of methods to make spies
 */
jasmine.createSpyObj = function(baseName, methodNames) {
  if (!jasmine.isArray_(methodNames) || methodNames.length === 0) {
    throw new Error('createSpyObj requires a non-empty array of method names to create spies for');
  }
  var obj = {};
  for (var i = 0; i < methodNames.length; i++) {
    obj[methodNames[i]] = jasmine.createSpy(baseName + '.' + methodNames[i]);
  }
  return obj;
};

jasmine.util = {};

jasmine.util.inherit = function(childClass, parentClass) {
  var subclass = function() {
  };
  subclass.prototype = parentClass.prototype;
  childClass.prototype = new subclass();
};

jasmine.util.formatException = function(e) {
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

jasmine.util.htmlEscape = function(str) {
  if (!str) return str;
  return str.replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
};

jasmine.util.argsToArray = function(args) {
  var arrayOfArgs = [];
  for (var i = 0; i < args.length; i++) arrayOfArgs.push(args[i]);
  return arrayOfArgs;
};

jasmine.util.isUndefined = function(obj) {
  return obj === void 0;
};

jasmine.Spec = function(attrs) {
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
};

jasmine.Spec.prototype.addExpectationResult = function(passed, data) {
  this.encounteredExpectations = true;
  if (passed) {
    return;
  }
  this.result.failedExpectations.push(this.expectationResultFactory(data));
};

jasmine.Spec.prototype.expect = function(actual) {
  return this.expectationFactory(actual, this);
};

jasmine.Spec.prototype.execute = function(onComplete) {
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
      if (jasmine.Spec.isPendingSpecException(e)) {
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

jasmine.Spec.prototype.disable = function() {
  this.disabled = true;
};

jasmine.Spec.prototype.pend = function() {
  this.markedPending = true;
};

jasmine.Spec.prototype.status = function() {
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

jasmine.Spec.prototype.getFullName = function() {
  return this.getSpecName(this);
};

jasmine.Spec.pendingSpecExceptionMessage = "=> marked Pending";

jasmine.Spec.isPendingSpecException = function(e) {
  return e.toString().indexOf(jasmine.Spec.pendingSpecExceptionMessage) !== -1;
};
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
  jasmine.Env.prototype.xdescribe = function(description, specDefinitions) {
    var suite = this.describe(description, specDefinitions);
    suite.disable();
    return suite;
  };

  // TODO: move this to closure
  jasmine.Env.prototype.it = function(description, fn) {
    var spec = this.specFactory(description, fn, this.currentSuite);
    this.currentSuite.addSpec(spec);
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

jasmine.JsApiReporter = function(jasmine) {
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

};
jasmine.Clock = function(global, delayedFunctionScheduler) {
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
    return timer.setTimeout.apply(null, arguments);
  };

  self.setInterval = function(fn, delay, params) {
    if (legacyIE()) {
      if (arguments.length > 2) {
        throw new Error("IE < 9 cannot support extra params to setInterval without a polyfill");
      }
      return timer.setInterval(fn, delay);
    }
    return timer.setInterval.apply(null, arguments);
  };

  self.clearTimeout = function(id) {
    return timer.clearTimeout(id);
  };

  self.clearInterval = function(id) {
    return timer.clearInterval(id);
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
};

jasmine.DelayedFunctionScheduler = function() {
  var self = this;
  var scheduledFunctions = {};
  var currentTime = 0;
  var delayedFnCount = 0;

  self.tick = function(millis) {
    runFunctionsWithinRange(currentTime, currentTime + millis);
    currentTime = currentTime + millis;
  };

  self.scheduleFunction = function(funcToCall, millis, params, recurring, timeoutKey, runAtMillis) {
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


  //finds/dupes functions within range and removes them.
  function functionsWithinRange(startMillis, endMillis) {
    var fnsToRun = [];
    for (var timeoutKey in scheduledFunctions) {
      var scheduledFunc = scheduledFunctions[timeoutKey];
      if (scheduledFunc &&
          scheduledFunc.runAtMillis >= startMillis &&
            scheduledFunc.runAtMillis <= endMillis) {
        //remove fn -- we'll reschedule later if it is recurring.
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
};

jasmine.ExceptionFormatter = function() {
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
};
//TODO: expectation result may make more sense as a presentation of an expectation.
jasmine.buildExpectationResult = function(options) {
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
};

/**
 * @constructor
 * @param {jasmine.Env} env
 * @param actual
 * @param {jasmine.Spec} spec
 */
jasmine.Matchers = function(env, actual, spec, opt_isNot) {
  //TODO: true dependency: equals, contains
  this.env = env;
  this.actual = actual;
  this.spec = spec;
  this.isNot = opt_isNot || false;
};

// todo: @deprecated as of Jasmine 0.11, remove soon [xw]
jasmine.Matchers.pp = function(str) {
  throw new Error("jasmine.Matchers.pp() is no longer supported, please use jasmine.pp() instead!");
};


jasmine.Matchers.wrapInto_ = function(prototype, matchersClass) {
  for (var methodName in prototype) {
    var orig = prototype[methodName];
    matchersClass.prototype[methodName] = jasmine.Matchers.matcherFn_(methodName, orig);
  }
};

jasmine.Matchers.matcherFn_ = function(matcherName, matcherFunction) {
  return function() {
    var matcherArgs = jasmine.util.argsToArray(arguments);
    var result = matcherFunction.apply(this, arguments);

    if (this.isNot) {
      result = !result;
    }

    var message;
    if (!result) {
      if (this.message) {
        message = this.message.apply(this, arguments);
        if (jasmine.isArray_(message)) {
          message = message[this.isNot ? 1 : 0];
        }
      } else {
        var englishyPredicate = matcherName.replace(/[A-Z]/g, function(s) { return ' ' + s.toLowerCase(); });
        message = "Expected " + jasmine.pp(this.actual) + (this.isNot ? " not " : " ") + englishyPredicate;
        if (matcherArgs.length > 0) {
          for (var i = 0; i < matcherArgs.length; i++) {
            if (i > 0) message += ",";
            message += " " + jasmine.pp(matcherArgs[i]);
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


/**
 * toBe: compares the actual to the expected using ===
 * @param expected
 */
jasmine.Matchers.prototype.toBe = function(expected) {
  return this.actual === expected;
};

/**
 * toNotBe: compares the actual to the expected using !==
 * @param expected
 * @deprecated as of 1.0. Use not.toBe() instead.
 */
jasmine.Matchers.prototype.toNotBe = function(expected) {
  return this.actual !== expected;
};

/**
 * toEqual: compares the actual to the expected using common sense equality. Handles Objects, Arrays, etc.
 *
 * @param expected
 */
jasmine.Matchers.prototype.toEqual = function(expected) {
  return this.env.equals_(this.actual, expected);
};

/**
 * toNotEqual: compares the actual to the expected using the ! of jasmine.Matchers.toEqual
 * @param expected
 * @deprecated as of 1.0. Use not.toEqual() instead.
 */
jasmine.Matchers.prototype.toNotEqual = function(expected) {
  return !this.env.equals_(this.actual, expected);
};

/**
 * Matcher that compares the actual to the expected using a regular expression.  Constructs a RegExp, so takes
 * a pattern or a String.
 *
 * @param expected
 */
jasmine.Matchers.prototype.toMatch = function(expected) {
  return new RegExp(expected).test(this.actual);
};

/**
 * Matcher that compares the actual to the expected using the boolean inverse of jasmine.Matchers.toMatch
 * @param expected
 * @deprecated as of 1.0. Use not.toMatch() instead.
 */
jasmine.Matchers.prototype.toNotMatch = function(expected) {
  return !(new RegExp(expected).test(this.actual));
};

/**
 * Matcher that compares the actual to jasmine.undefined.
 */
jasmine.Matchers.prototype.toBeDefined = function() {
  return !jasmine.util.isUndefined(this.actual);
};

/**
 * Matcher that compares the actual to jasmine.undefined.
 */
jasmine.Matchers.prototype.toBeUndefined = function() {
  return jasmine.util.isUndefined(this.actual);
};

/**
 * Matcher that compares the actual to null.
 */
jasmine.Matchers.prototype.toBeNull = function() {
  return (this.actual === null);
};

/**
 * Matcher that compares the actual to NaN.
 */
jasmine.Matchers.prototype.toBeNaN = function() {
  this.message = function() {
      return [ "Expected " + jasmine.pp(this.actual) + " to be NaN." ];
  };

  return (this.actual !== this.actual);
};

/**
 * Matcher that boolean not-nots the actual.
 */
jasmine.Matchers.prototype.toBeTruthy = function() {
  return !!this.actual;
};


/**
 * Matcher that boolean nots the actual.
 */
jasmine.Matchers.prototype.toBeFalsy = function() {
  return !this.actual;
};


/**
 * Matcher that checks to see if the actual, a Jasmine spy, was called.
 */
jasmine.Matchers.prototype.toHaveBeenCalled = function() {
  if (arguments.length > 0) {
    throw new Error('toHaveBeenCalled does not take arguments, use toHaveBeenCalledWith');
  }

  if (!jasmine.isSpy(this.actual)) {
    throw new Error('Expected a spy, but got ' + jasmine.pp(this.actual) + '.');
  }

  this.message = function() {
    return [
      "Expected spy " + this.actual.identity + " to have been called.",
      "Expected spy " + this.actual.identity + " not to have been called."
    ];
  };

  return this.actual.wasCalled;
};

/** @deprecated Use expect(xxx).toHaveBeenCalled() instead */
jasmine.Matchers.prototype.wasCalled = jasmine.Matchers.prototype.toHaveBeenCalled;

/**
 * Matcher that checks to see if the actual, a Jasmine spy, was not called.
 *
 * @deprecated Use expect(xxx).not.toHaveBeenCalled() instead
 */
jasmine.Matchers.prototype.wasNotCalled = function() {
  if (arguments.length > 0) {
    throw new Error('wasNotCalled does not take arguments');
  }

  if (!jasmine.isSpy(this.actual)) {
    throw new Error('Expected a spy, but got ' + jasmine.pp(this.actual) + '.');
  }

  this.message = function() {
    return [
      "Expected spy " + this.actual.identity + " to not have been called.",
      "Expected spy " + this.actual.identity + " to have been called."
    ];
  };

  return !this.actual.wasCalled;
};

/**
 * Matcher that checks to see if the actual, a Jasmine spy, was called with a set of parameters.
 *
 * @example
 *
 */
jasmine.Matchers.prototype.toHaveBeenCalledWith = function() {
  var expectedArgs = jasmine.util.argsToArray(arguments);
  if (!jasmine.isSpy(this.actual)) {
    throw new Error('Expected a spy, but got ' + jasmine.pp(this.actual) + '.');
  }
  this.message = function() {
    var invertedMessage = "Expected spy " + this.actual.identity + " not to have been called with " + jasmine.pp(expectedArgs) + " but it was.";
    var positiveMessage = "";
    if (this.actual.callCount === 0) {
      positiveMessage = "Expected spy " + this.actual.identity + " to have been called with " + jasmine.pp(expectedArgs) + " but it was never called.";
    } else {
      positiveMessage = "Expected spy " + this.actual.identity + " to have been called with " + jasmine.pp(expectedArgs) + " but actual calls were " + jasmine.pp(this.actual.argsForCall).replace(/^\[ | \]$/g, '');
    }
    return [positiveMessage, invertedMessage];
  };

  return this.env.contains_(this.actual.argsForCall, expectedArgs);
};

/** @deprecated Use expect(xxx).toHaveBeenCalledWith() instead */
jasmine.Matchers.prototype.wasCalledWith = jasmine.Matchers.prototype.toHaveBeenCalledWith;

/** @deprecated Use expect(xxx).not.toHaveBeenCalledWith() instead */
jasmine.Matchers.prototype.wasNotCalledWith = function() {
  var expectedArgs = jasmine.util.argsToArray(arguments);
  if (!jasmine.isSpy(this.actual)) {
    throw new Error('Expected a spy, but got ' + jasmine.pp(this.actual) + '.');
  }

  this.message = function() {
    return [
      "Expected spy not to have been called with " + jasmine.pp(expectedArgs) + " but it was",
      "Expected spy to have been called with " + jasmine.pp(expectedArgs) + " but it was"
    ];
  };

  return !this.env.contains_(this.actual.argsForCall, expectedArgs);
};

/**
 * Matcher that checks that the expected item is an element in the actual Array.
 *
 * @param {Object} expected
 */
jasmine.Matchers.prototype.toContain = function(expected) {
  return this.env.contains_(this.actual, expected);
};

/**
 * Matcher that checks that the expected item is NOT an element in the actual Array.
 *
 * @param {Object} expected
 * @deprecated as of 1.0. Use not.toContain() instead.
 */
jasmine.Matchers.prototype.toNotContain = function(expected) {
  return !this.env.contains_(this.actual, expected);
};

jasmine.Matchers.prototype.toBeLessThan = function(expected) {
  return this.actual < expected;
};

jasmine.Matchers.prototype.toBeGreaterThan = function(expected) {
  return this.actual > expected;
};

/**
 * Matcher that checks that the expected item is equal to the actual item
 * up to a given level of decimal precision (default 2).
 *
 * @param {Number} expected
 * @param {Number} precision, as number of decimal places
 */
jasmine.Matchers.prototype.toBeCloseTo = function(expected, precision) {
  if (precision !== 0) {
    precision = precision || 2;
  }
  return Math.abs(expected - this.actual) < (Math.pow(10, -precision) / 2);
};

/**
 * Matcher that checks that the expected exception was thrown by the actual.
 *
 * @param {String} [expected]
 */
jasmine.Matchers.prototype.toThrow = function(expected) {
  var result = false;
  var exception;
  if (typeof this.actual != 'function') {
    throw new Error('Actual is not a function');
  }
  try {
    this.actual();
  } catch (e) {
    exception = e;
  }

  if (exception) {
    result = (jasmine.util.isUndefined(expected) || this.env.equals_(exception.message || exception, expected.message || expected));
  }

  var not = this.isNot ? "not " : "";

  this.message = function() {
    if (exception && (jasmine.util.isUndefined(expected) || !this.env.equals_(exception.message || exception, expected.message || expected))) {
      return ["Expected function " + not + "to throw", expected ? expected.message || expected : "an exception", ", but it threw", exception.message || exception].join(' ');
    } else {
      return "Expected function to throw an exception.";
    }
  };

  return result;
};

jasmine.Matchers.Any = function(expectedClass) {
  this.expectedClass = expectedClass;
};

jasmine.Matchers.Any.prototype.jasmineMatches = function(other) {
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

jasmine.Matchers.Any.prototype.jasmineToString = function() {
  return '<jasmine.any(' + this.expectedClass + ')>';
};

jasmine.Matchers.ObjectContaining = function(sample) {
  this.sample = sample;
};

jasmine.Matchers.ObjectContaining.prototype.jasmineMatches = function(other, mismatchKeys, mismatchValues) {
  mismatchKeys = mismatchKeys || [];
  mismatchValues = mismatchValues || [];

  var env = jasmine.getEnv();

  var hasKey = function(obj, keyName) {
    return obj !== null && !jasmine.util.isUndefined(obj[keyName]);
  };

  for (var property in this.sample) {
    if (!hasKey(other, property) && hasKey(this.sample, property)) {
      mismatchKeys.push("expected has key '" + property + "', but missing from actual.");
    }
    else if (!env.equals_(this.sample[property], other[property], mismatchKeys, mismatchValues)) {
      mismatchValues.push("'" + property + "' was '" + (other[property] ? jasmine.util.htmlEscape(other[property].toString()) : other[property]) + "' in expected, but was '" + (this.sample[property] ? jasmine.util.htmlEscape(this.sample[property].toString()) : this.sample[property]) + "' in actual.");
    }
  }

  return (mismatchKeys.length === 0 && mismatchValues.length === 0);
};

jasmine.Matchers.ObjectContaining.prototype.jasmineToString = function() {
  return "<jasmine.objectContaining(" + jasmine.pp(this.sample) + ")>";
};

/**
 * Base class for pretty printing for expectation results.
 */
jasmine.PrettyPrinter = function() {
  this.ppNestLevel_ = 0;
};

/**
 * Formats a value in a nice, human-readable string.
 *
 * @param value
 */
jasmine.PrettyPrinter.prototype.format = function(value) {
  this.ppNestLevel_++;
  try {
    if (jasmine.util.isUndefined(value)) {
      this.emitScalar('undefined');
    } else if (value === null) {
      this.emitScalar('null');
    } else if (value === jasmine.getGlobal()) {
      this.emitScalar('<global>');
    } else if (value.jasmineToString) {
      this.emitScalar(value.jasmineToString());
    } else if (typeof value === 'string') {
      this.emitString(value);
    } else if (jasmine.isSpy(value)) {
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
      this.emitScalar('<circular reference: ' + (jasmine.isArray_(value) ? 'Array' : 'Object') + '>');
    } else if (jasmine.isArray_(value) || typeof value == 'object') {
      value.__Jasmine_been_here_before__ = true;
      if (jasmine.isArray_(value)) {
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

jasmine.PrettyPrinter.prototype.iterateObject = function(obj, fn) {
  for (var property in obj) {
    if (!obj.hasOwnProperty(property)) continue;
    if (property == '__Jasmine_been_here_before__') continue;
    fn(property, obj.__lookupGetter__ ? (!jasmine.util.isUndefined(obj.__lookupGetter__(property)) &&
                                         obj.__lookupGetter__(property) !== null) : false);
  }
};

jasmine.PrettyPrinter.prototype.emitArray = jasmine.unimplementedMethod_;
jasmine.PrettyPrinter.prototype.emitObject = jasmine.unimplementedMethod_;
jasmine.PrettyPrinter.prototype.emitScalar = jasmine.unimplementedMethod_;
jasmine.PrettyPrinter.prototype.emitString = jasmine.unimplementedMethod_;

jasmine.StringPrettyPrinter = function() {
  jasmine.PrettyPrinter.call(this);

  this.string = '';
};
jasmine.util.inherit(jasmine.StringPrettyPrinter, jasmine.PrettyPrinter);

jasmine.StringPrettyPrinter.prototype.emitScalar = function(value) {
  this.append(value);
};

jasmine.StringPrettyPrinter.prototype.emitString = function(value) {
  this.append("'" + value + "'");
};

jasmine.StringPrettyPrinter.prototype.emitArray = function(array) {
  if (this.ppNestLevel_ > jasmine.MAX_PRETTY_PRINT_DEPTH) {
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

jasmine.StringPrettyPrinter.prototype.emitObject = function(obj) {
  if (this.ppNestLevel_ > jasmine.MAX_PRETTY_PRINT_DEPTH) {
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

jasmine.StringPrettyPrinter.prototype.append = function(value) {
  this.string += value;
};

jasmine.QueueRunner = function(attrs) {
  this.fns = attrs.fns || [];
  this.onComplete = attrs.onComplete || function() {};
  this.encourageGC = attrs.encourageGC || function(fn) {fn();};
  this.onException = attrs.onException || function() {};
  this.catchException = attrs.catchException || function() { return true; };
};

jasmine.QueueRunner.prototype.execute = function() {
  this.run(this.fns, 0);
};

jasmine.QueueRunner.prototype.run = function(fns, index) {
  if (index >= fns.length) {
    this.encourageGC(this.onComplete);
    return;
  }

  var fn = fns[index];
  var self = this;
  if (fn.length > 0) {
    attempt(function() { fn.call(self, function() {  self.run(fns, index + 1); }); });
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

jasmine.ReportDispatcher = function(methods) {

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
};
jasmine.Suite = function(attrs) {
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
};

jasmine.Suite.prototype.getFullName = function() {
  var fullName = this.description;
  for (var parentSuite = this.parentSuite; parentSuite; parentSuite = parentSuite.parentSuite) {
    if (parentSuite.parentSuite) {
      fullName = parentSuite.description + ' ' + fullName;
    }
  }
  return fullName;
};

jasmine.Suite.prototype.disable = function() {
  this.disabled = true;
};

jasmine.Suite.prototype.beforeEach = function(fn) {
  this.beforeFns.unshift(fn);
};

jasmine.Suite.prototype.afterEach = function(fn) {
  this.afterFns.unshift(fn);
};

jasmine.Suite.prototype.addSpec = function(spec) {
  this.children_.push(spec);
  this.specs.push(spec);   // TODO: needed?
};

jasmine.Suite.prototype.addSuite = function(suite) {
  suite.parentSuite = this;
  this.children_.push(suite);
  this.suites.push(suite);    // TODO: needed?
};

jasmine.Suite.prototype.children = function() {
  return this.children_;
};

jasmine.Suite.prototype.execute = function(onComplete) {
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
    return function (done) {
      child.execute(done);
    };
  }
};

jasmine.version = "2.0.0-alpha";