/*
 * Jasmine internal classes & objects
 */

var Jasmine = {};

Jasmine.util = {};

/** @deprecated Use Jasmine.util instead */
Jasmine.Util = Jasmine.util;

Jasmine.util.inherit = function(childClass, parentClass) {
  var subclass = function() { };
  subclass.prototype = parentClass.prototype;
  childClass.prototype = new subclass;
};

/*
 * Holds results; allows for the results array to hold another Jasmine.NestedResults
 */
Jasmine.NestedResults = function() {
  this.totalCount = 0;
  this.passedCount = 0;
  this.failedCount = 0;
  this.results = [];
};

Jasmine.NestedResults.prototype.rollupCounts = function(result) {
  this.totalCount += result.totalCount;
  this.passedCount += result.passedCount;
  this.failedCount += result.failedCount;
};

Jasmine.NestedResults.prototype.push = function(result) {
  if (result.results) {
    this.rollupCounts(result);
  } else {
    this.totalCount++;
    if (result.passed) {
      this.passedCount++;
    } else {
      this.failedCount++;
    }
  }
  this.results.push(result);
};

Jasmine.NestedResults.prototype.passed = function() {
  return this.passedCount === this.totalCount;
};


/*
 * base for Runner & Suite: allows for a queue of functions to get executed, allowing for
 *   any one action to complete, including asynchronous calls, before going to the next
 *   action.
 *
 **/
Jasmine.ActionCollection = function() {
  this.actions = [];
  this.index = 0;
  this.finished = false;
  this.results = new Jasmine.NestedResults();
};

Jasmine.ActionCollection.prototype.finish = function() {
  if (this.finishCallback) {
    this.finishCallback();
  }
  this.finished = true;
};

Jasmine.ActionCollection.prototype.report = function(result) {
  this.results.push(result);
};

Jasmine.ActionCollection.prototype.execute = function() {
  if (this.actions.length > 0) {
    this.next();
  }
};

Jasmine.ActionCollection.prototype.getCurrentAction = function() {
  return this.actions[this.index];
};

Jasmine.ActionCollection.prototype.next = function() {
  if (this.index >= this.actions.length) {
    this.finish();
    return;
  }

  var currentAction = this.getCurrentAction();

  currentAction.execute(this);

  if (currentAction.afterCallbacks) {
    for (var i = 0; i < currentAction.afterCallbacks.length; i++) {
      try {
        currentAction.afterCallbacks[i]();
      } catch (e) {
        alert(e);
      }
    }
  }

  this.waitForDone(currentAction);
};

Jasmine.ActionCollection.prototype.waitForDone = function(action) {
  var self = this;
  var afterExecute = function() {
    self.report(action.results);
    self.index++;
    self.next();
  };

  if (action.finished) {
    afterExecute();
    return;
  }
  
  var id = setInterval(function() {
    if (action.finished) {
      clearInterval(id);
      afterExecute();
    }
  }, 150);
};

Jasmine.safeExecuteBeforeOrAfter = function(spec, func) {
  try {
    func.apply(spec);
  } catch (e) {
    var fail = {passed: false, message: func.typeName + '() fail: ' + Jasmine.util.formatException(e)};
    spec.results.push(fail);
  }
};

/*
 * QueuedFunction is how ActionCollections' actions are implemented
 */
Jasmine.QueuedFunction = function(func, timeout, latchFunction, spec) {
  this.func = func;
  this.timeout = timeout;
  this.latchFunction = latchFunction;
  this.spec = spec;

  this.totalTimeSpentWaitingForLatch = 0;
  this.latchTimeoutIncrement = 100;
};

Jasmine.QueuedFunction.prototype.next = function() {
  this.spec.finish(); // default value is to be done after one function
};

Jasmine.QueuedFunction.prototype.safeExecute = function() {
  if (console) {
    console.log('>> Jasmine Running ' + this.spec.suite.description + ' ' + this.spec.description + '...');
  }

  try {
    this.func.apply(this.spec);
  } catch (e) {
    this.fail(e);
  }
};

Jasmine.QueuedFunction.prototype.execute = function() {
  var self = this;
  var executeNow = function() {
    self.safeExecute();
    self.next();
  };

  var executeLater = function() {
    setTimeout(executeNow, self.timeout);
  };

  var executeNowOrLater = function() {
    var latchFunctionResult;

    try {
      latchFunctionResult = self.latchFunction.apply(self.spec);
    } catch (e) {
      self.fail(e);
      self.next();
      return;
    }

    if (latchFunctionResult) {
      executeNow();
    } else if (self.totalTimeSpentWaitingForLatch >= self.timeout) {
      var message = 'timed out after ' + self.timeout + ' msec waiting for ' + (self.latchFunction.description || 'something to happen');
      self.fail({ name: 'timeout', message: message });
      self.next();
    } else {
      self.totalTimeSpentWaitingForLatch += self.latchTimeoutIncrement;
      setTimeout(executeNowOrLater, self.latchTimeoutIncrement);
    }
  };

  if (this.latchFunction !== undefined) {
    executeNowOrLater();
  } else if (this.timeout > 0) {
    executeLater();
  } else {
    executeNow();
  }
};

Jasmine.QueuedFunction.prototype.fail = function(e) {
  this.spec.results.push({passed:false, message: Jasmine.util.formatException(e)});
};

/******************************************************************************
 * Jasmine
 ******************************************************************************/

Jasmine.Env = function() {
  this.currentSpec = null;
  this.currentSuite = null;
  this.currentRunner = null;
};

Jasmine.Env.prototype.execute = function() {
  this.currentRunner.execute();
};

Jasmine.currentEnv_ = new Jasmine.Env();

/** @deprecated use Jasmine.getEnv() instead */
var jasmine = Jasmine.currentEnv_;

Jasmine.getEnv = function() {
  return Jasmine.currentEnv_;
};

Jasmine.isArray_ = function(value) {
  return value &&
         typeof value === 'object' &&
         typeof value.length === 'number' &&
         typeof value.splice === 'function' &&
         !(value.propertyIsEnumerable('length'));
};

Jasmine.arrayToString_ = function(array) {
  var formatted_value = '';
  for (var i = 0; i < array.length; i++) {
    if (i > 0) {
      formatted_value += ', ';
    }
    ;
    formatted_value += Jasmine.pp(array[i]);
  }
  return '[ ' + formatted_value + ' ]';
};

Jasmine.objectToString_ = function(obj) {
  var formatted_value = '';
  var first = true;
  for (var property in obj) {
    if (property == '__Jasmine_pp_has_traversed__') continue;

    if (first) {
      first = false;
    } else {
      formatted_value += ', ';
    }
    formatted_value += property;
    formatted_value += ' : ';
    formatted_value += Jasmine.pp(obj[property]);
  }

  return '{ ' + formatted_value + ' }';
};

Jasmine.ppNestLevel_ = 0;

Jasmine.pp = function(value) {
  if (Jasmine.ppNestLevel_ > 40) {
//    return '(Jasmine.pp nested too deeply!)';
    throw new Error('Jasmine.pp nested too deeply!');
  }

  Jasmine.ppNestLevel_++;
  try {
    return Jasmine.pp_(value);
  } finally {
    Jasmine.ppNestLevel_--;
  }
};

Jasmine.pp_ = function(value) {
  if (value === undefined) {
    return 'undefined';
  }
  if (value === null) {
    return 'null';
  }

  if (value.navigator && value.frames && value.setTimeout) {
    return '<window>';
  }

  if (value instanceof Jasmine.Any) return value.toString();

  if (typeof value === 'string') {
    return "'" + Jasmine.util.htmlEscape(value) + "'";
  }
  if (typeof value === 'function') {
    return 'Function';
  }
  if (typeof value.nodeType === 'number') {
    return 'HTMLNode';
  }

  if (value.__Jasmine_pp_has_traversed__) {
    return '<circular reference: ' + (Jasmine.isArray_(value) ? 'Array' : 'Object') + '>';
  }

  if (Jasmine.isArray_(value) || typeof value == 'object') {
    value.__Jasmine_pp_has_traversed__ = true;
    var stringified = Jasmine.isArray_(value) ? Jasmine.arrayToString_(value) : Jasmine.objectToString_(value);
    delete value.__Jasmine_pp_has_traversed__;
    return stringified;
  }

  return Jasmine.util.htmlEscape(value.toString());
};

/*
 * Jasmine.Matchers methods; add your own by extending Jasmine.Matchers.prototype - don't forget to write a test
 *
 */

Jasmine.Matchers = function(actual, results) {
  this.actual = actual;
  this.passing_message = 'Passed.';
  this.results = results || new Jasmine.NestedResults();
};

Jasmine.Matchers.prototype.report = function(result, failing_message) {

  this.results.push({
    passed: result,
    message: result ? this.passing_message : failing_message
  });

  return result;
};

Jasmine.isDomNode = function(obj) {
  return obj['nodeType'] > 0;
};

Jasmine.Any = function(expectedClass) {
  this.expectedClass = expectedClass;
};

Jasmine.Any.prototype.matches = function(other) {
  if (this.expectedClass == String) {
    return typeof other == 'string' || other instanceof String;
  }

  if (this.expectedClass == Number) {
    return typeof other == 'number' || other instanceof Number;
  }

  return other instanceof this.expectedClass;
};

Jasmine.Any.prototype.toString = function() {
  return '<Jasmine.any(' + this.expectedClass + ')>';
};

Jasmine.any = function(clazz) {
  return new Jasmine.Any(clazz);
};

Jasmine.Matchers.prototype.toEqual = function(expected) {
  var mismatchKeys = [];
  var mismatchValues = [];

  var hasKey = function(obj, keyName) {
    return obj!=null && obj[keyName] !== undefined;
  };

  var equal = function(a, b) {
    if (a == undefined || a == null) {
      return (a == undefined && b == undefined);
    }

    if (Jasmine.isDomNode(a) && Jasmine.isDomNode(b)) {
      return a === b;
    }

    if (typeof a === "object" && typeof b === "object") {
      for (var property in b) {
        if (!hasKey(a, property) && hasKey(b, property)) {
          mismatchKeys.push("expected has key '" + property + "', but missing from <b>actual</b>.");
        }
      }
      for (property in a) {
        if (!hasKey(b, property) && hasKey(a, property)) {
          mismatchKeys.push("<b>expected</b> missing key '" + property + "', but present in actual.");
        }
      }
      for (property in b) {
        if (!equal(a[property], b[property])) {
          mismatchValues.push("'" + property + "' was<br /><br />'" + (b[property] ? Jasmine.util.htmlEscape(b[property].toString()) : b[property]) + "'<br /><br />in expected, but was<br /><br />'" + (a[property] ? Jasmine.util.htmlEscape(a[property].toString()) : a[property]) + "'<br /><br />in actual.<br />");
        }
      }


      return (mismatchKeys.length == 0 && mismatchValues.length == 0);
    }

    if (b instanceof Jasmine.Any) {
      return b.matches(a);
    }

    // functions are considered equivalent if their bodies are equal // todo: remove this
    if (typeof a === "function" && typeof b === "function") {
      return a.toString() == b.toString();
    }

    //Straight check
    return (a === b);
  };

  var formatMismatches = function(name, array) {
    if (array.length == 0) return '';
    var errorOutput = '<br /><br />Different ' + name + ':<br />';
    for (var i = 0; i < array.length; i++) {
      errorOutput += array[i] + '<br />';
    }
    return errorOutput;

  };

  return this.report(equal(this.actual, expected),
      'Expected<br /><br />' + Jasmine.pp(expected)
          + '<br /><br />but got<br /><br />' + Jasmine.pp(this.actual)
          + '<br />'
          + formatMismatches('Keys', mismatchKeys)
          + formatMismatches('Values', mismatchValues));
};
/** @deprecated */
Jasmine.Matchers.prototype.should_equal = Jasmine.Matchers.prototype.toEqual;

Jasmine.Matchers.prototype.toNotEqual = function(expected) {
  return this.report((this.actual !== expected),
      'Expected ' + Jasmine.pp(expected) + ' to not equal ' + Jasmine.pp(this.actual) + ', but it does.');
};
/** @deprecated */
Jasmine.Matchers.prototype.should_not_equal = Jasmine.Matchers.prototype.toNotEqual;

Jasmine.Matchers.prototype.toMatch = function(reg_exp) {
  return this.report((new RegExp(reg_exp).test(this.actual)),
      'Expected ' + this.actual + ' to match ' + reg_exp + '.');
};
/** @deprecated */
Jasmine.Matchers.prototype.should_match = Jasmine.Matchers.prototype.toMatch;

Jasmine.Matchers.prototype.toNotMatch = function(reg_exp) {
  return this.report((!new RegExp(reg_exp).test(this.actual)),
      'Expected ' + this.actual + ' to not match ' + reg_exp + '.');
};
/** @deprecated */
Jasmine.Matchers.prototype.should_not_match = Jasmine.Matchers.prototype.toNotMatch;

Jasmine.Matchers.prototype.toBeDefined = function() {
  return this.report((this.actual !== undefined),
      'Expected a value to be defined but it was undefined.');
};
/** @deprecated */
Jasmine.Matchers.prototype.should_be_defined = Jasmine.Matchers.prototype.toBeDefined;

Jasmine.Matchers.prototype.toBeNull = function() {
  return this.report((this.actual === null),
      'Expected a value to be null but it was not.');
};
/** @deprecated */
Jasmine.Matchers.prototype.should_be_null = Jasmine.Matchers.prototype.toBeNull;

Jasmine.Matchers.prototype.toBeTruthy = function() {
  return this.report((this.actual),
      'Expected a value to be truthy but it was not.');
};
/** @deprecated */
Jasmine.Matchers.prototype.should_be_truthy = Jasmine.Matchers.prototype.toBeTruthy;

Jasmine.Matchers.prototype.toBeFalsy = function() {
  return this.report((!this.actual),
      'Expected a value to be falsy but it was not.');
};
/** @deprecated */
Jasmine.Matchers.prototype.should_be_falsy = Jasmine.Matchers.prototype.toBeFalsy;

Jasmine.Matchers.prototype.wasCalled = function() {
  if (!this.actual.isSpy) {
    return this.report(false, 'Expected value to be a spy, but it was not.');
  }
  return this.report((this.actual.wasCalled),
      'Expected spy to have been called, but it was not.');
};
/** @deprecated */
Jasmine.Matchers.prototype.was_called = Jasmine.Matchers.prototype.wasCalled;

Jasmine.Matchers.prototype.wasNotCalled = function() {
  if (!this.actual.isSpy) {
    return this.report(false, 'Expected value to be a spy, but it was not.');
  }
  return this.report((!this.actual.wasCalled),
      'Expected spy to not have been called, but it was.');
};
/** @deprecated */
Jasmine.Matchers.prototype.was_not_called = Jasmine.Matchers.prototype.wasNotCalled;

Jasmine.Matchers.prototype.wasCalledWith = function() {
  if (!this.wasCalled()) return false;
  var argMatcher = new Jasmine.Matchers(this.actual.mostRecentCall.args, this.results);
  return argMatcher.toEqual(Jasmine.util.argsToArray(arguments));
};
/** @deprecated */
Jasmine.Matchers.prototype.was_called = Jasmine.Matchers.prototype.wasCalled;

Jasmine.Matchers.prototype.toContain = function(item) {
  return this.report((this.actual.indexOf(item) >= 0),
      'Expected ' + Jasmine.pp(this.actual) + ' to contain ' + Jasmine.pp(item) + ', but it does not.');
};

Jasmine.Matchers.prototype.toNotContain = function(item) {
  return this.report((this.actual.indexOf(item) < 0),
      'Expected ' + Jasmine.pp(this.actual) + ' not to contain ' + Jasmine.pp(item) + ', but it does.');
};

Jasmine.createSpy = function() {
  var spyObj = function() {
    spyObj.wasCalled = true;
    spyObj.callCount++;
    var args = Jasmine.util.argsToArray(arguments);
    spyObj.mostRecentCall = {
      object: this,
      args: args
    };
    spyObj.argsForCall.push(args);
    return spyObj.plan.apply(this, arguments);
  };

  spyObj.isSpy = true;

  spyObj.plan = function() {
  };

  spyObj.andCallThrough = function() {
    spyObj.plan = spyObj.originalValue;
    return spyObj;
  };
  spyObj.andReturn = function(value) {
    spyObj.plan = function() {
      return value;
    };
    return spyObj;
  };
  spyObj.andThrow = function(exceptionMsg) {
    spyObj.plan = function() {
      throw exceptionMsg;
    };
    return spyObj;
  };
  spyObj.andCallFake = function(fakeFunc) {
    spyObj.plan = fakeFunc;
    return spyObj;
  };
  spyObj.reset = function() {
    spyObj.wasCalled = false;
    spyObj.callCount = 0;
    spyObj.argsForCall = [];
    spyObj.mostRecentCall = {};
  };
  spyObj.reset();

  return spyObj;
};

Jasmine.spyOn = function(obj, methodName) {
  var spec = Jasmine.getEnv().currentSpec;
  spec.after(function() {
    spec.removeAllSpies();
  });

  if (obj == undefined) {
    throw "spyOn could not find an object to spy upon";
  }

  if (obj[methodName] === undefined) {
    throw methodName + '() method does not exist';
  }

  if (obj[methodName].isSpy) {
    throw new Error(methodName + ' has already been spied upon');
  }

  var spyObj = Jasmine.createSpy();

  spec.spies_.push(spyObj);
  spyObj.baseObj = obj;
  spyObj.methodName = methodName;
  spyObj.originalValue = obj[methodName];

  obj[methodName] = spyObj;

  return spyObj;
};

var spyOn = Jasmine.spyOn;

/*
 * Jasmine spec constructor
 */

Jasmine.Spec = function(description) {
  this.suite = null;
  this.description = description;
  this.queue = [];
  this.currentTimeout = 0;
  this.currentLatchFunction = undefined;
  this.finished = false;
  this.afterCallbacks = [];
  this.spies_ = [];

  this.results = new Jasmine.NestedResults();
};

Jasmine.Spec.prototype.freezeSuite = function(suite) {
  this.suite = suite;
};

/** @deprecated */
Jasmine.Spec.prototype.expects_that = function(actual) {
  return new Jasmine.Matchers(actual, this.results);
};

Jasmine.Spec.prototype.waits = function(timeout) {
  this.currentTimeout = timeout;
  this.currentLatchFunction = undefined;
  return this;
};

Jasmine.Spec.prototype.waitsFor = function(timeout, latchFunction, message) {
  this.currentTimeout = timeout;
  this.currentLatchFunction = latchFunction;
  this.currentLatchFunction.description = message;
  return this;
};

Jasmine.Spec.prototype.resetTimeout = function() {
  this.currentTimeout = 0;
  this.currentLatchFunction = undefined;
};

Jasmine.Spec.prototype.finishCallback = function() {
  if (Jasmine.getEnv().reporter) {
    Jasmine.getEnv().reporter.reportSpecResults(this.results);
  }
};

Jasmine.Spec.prototype.finish = function() {
  if (this.suite.afterEach) {
    Jasmine.safeExecuteBeforeOrAfter(this, this.suite.afterEach);
  }
  this.finishCallback();
  this.finished = true;
};

Jasmine.Spec.prototype.after = function(doAfter) {
  this.afterCallbacks.push(doAfter);
};

Jasmine.Spec.prototype.execute = function() {
  Jasmine.getEnv().currentSpec = this;
  if (this.suite.beforeEach) {
    Jasmine.safeExecuteBeforeOrAfter(this, this.suite.beforeEach);
  }
  if (this.queue[0]) {
    this.queue[0].execute();
  } else {
    this.finish();
  }
};

Jasmine.Spec.prototype.explodes = function() {
  throw 'explodes function should not have been called';
};

Jasmine.Spec.prototype.spyOn = Jasmine.spyOn;

Jasmine.Spec.prototype.removeAllSpies = function() {
  for (var i = 0; i < this.spies_.length; i++) {
    var spy = this.spies_[i];
    spy.baseObj[spy.methodName] = spy.originalValue;
  }
  this.spies_ = [];
};

var it = function(description, func) {
  var that = new Jasmine.Spec(description);

  var addToQueue = function(func) {
    var currentFunction = new Jasmine.QueuedFunction(func, that.currentTimeout, that.currentLatchFunction, that);
    that.queue.push(currentFunction);

    if (that.queue.length > 1) {
      var previousFunction = that.queue[that.queue.length - 2];
      previousFunction.next = function() {
        currentFunction.execute();
      };
    }

    that.resetTimeout();
    return that;
  };

  that.expectationResults = that.results.results;
  that.runs = addToQueue;
  that.freezeSuite(Jasmine.getEnv().currentSuite);

  Jasmine.getEnv().currentSuite.specs.push(that);

  Jasmine.getEnv().currentSpec = that;

  if (func) {
    addToQueue(func);
  }

  that.results.description = description;
  return that;
};

//this mirrors the spec syntax so you can define a spec description that will not run. 
var xit = function() {
  return {runs: function() {
  } };
};

var expect = function() {
  return Jasmine.getEnv().currentSpec.expects_that.apply(Jasmine.getEnv().currentSpec, arguments);
};

var runs = function(func) {
  Jasmine.getEnv().currentSpec.runs(func);
};

var waits = function(timeout) {
  Jasmine.getEnv().currentSpec.waits(timeout);
};

var waitsFor = function(timeout, latchFunction, message) {
  Jasmine.getEnv().currentSpec.waitsFor(timeout, latchFunction, message);
};

var beforeEach = function(beforeEach) {
  beforeEach.typeName = 'beforeEach';
  Jasmine.getEnv().currentSuite.beforeEach = beforeEach;
};

var afterEach = function(afterEach) {
  afterEach.typeName = 'afterEach';
  Jasmine.getEnv().currentSuite.afterEach = afterEach;
};

Jasmine.Description = function(description, specDefinitions) {
  Jasmine.ActionCollection.call(this);

  this.description = description;
  this.specs = this.actions;
};
Jasmine.util.inherit(Jasmine.Description, Jasmine.ActionCollection);

var describe = function(description, spec_definitions) {
  var that = new Jasmine.Description(description, spec_definitions);

  Jasmine.getEnv().currentSuite = that;
  Jasmine.getEnv().currentRunner.suites.push(that);

  spec_definitions();

  that.results.description = description;
  that.specResults = that.results.results;

  that.finishCallback = function() {
    if (Jasmine.getEnv().reporter) {
      Jasmine.getEnv().reporter.reportSuiteResults(that.results);
    }
  };

  return that;
};

var xdescribe = function() {
  return {execute: function() {
  }};
};

Jasmine.Runner = function() {
  Jasmine.ActionCollection.call(this);

  this.suites = this.actions;
  this.results.description = 'All Jasmine Suites';
};
Jasmine.util.inherit(Jasmine.Runner, Jasmine.ActionCollection);

var Runner = function() {
  var that = new Jasmine.Runner();

  that.finishCallback = function() {
    if (Jasmine.getEnv().reporter) {
      Jasmine.getEnv().reporter.reportRunnerResults(that.results);
    }
  };

  that.suiteResults = that.results.results;

  Jasmine.getEnv().currentRunner = that;
  return that;
};

Jasmine.getEnv().currentRunner = Runner();

/* JasmineReporters.reporter
 *    Base object that will get called whenever a Spec, Suite, or Runner is done.  It is up to
 *    descendants of this object to do something with the results (see json_reporter.js)
 */
Jasmine.Reporters = {};

Jasmine.Reporters.reporter = function(callbacks) {
  var that = {
    callbacks: callbacks || {},

    doCallback: function(callback, results) {
      if (callback) {
        callback(results);
      }
    },

    reportRunnerResults: function(results) {
      that.doCallback(that.callbacks.runnerCallback, results);
    },
    reportSuiteResults:  function(results) {
      that.doCallback(that.callbacks.suiteCallback, results);
    },
    reportSpecResults:   function(results) {
      that.doCallback(that.callbacks.specCallback, results);
    }
  };

  return that;
};

Jasmine.util.formatException = function(e) {
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

Jasmine.util.htmlEscape = function(str) {
  if (!str) return str;
  return str.replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
};

Jasmine.util.argsToArray = function(args) {
  var arrayOfArgs = [];
  for (var i = 0; i < args.length; i++) arrayOfArgs.push(args[i]);
  return arrayOfArgs;
};
