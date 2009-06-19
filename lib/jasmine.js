/*
 * Jasmine internal classes & objects
 */

/** @namespace */
var jasmine = {};

jasmine.unimplementedMethod_ = function() {
  throw new Error("unimplemented method");
};

jasmine.bindOriginal_ = function(base, name) {
  var original = base[name];
  return function() {
    return original.apply(base, arguments);
  };
};

jasmine.setTimeout = jasmine.bindOriginal_(window, 'setTimeout');
jasmine.clearTimeout = jasmine.bindOriginal_(window, 'clearTimeout');
jasmine.setInterval = jasmine.bindOriginal_(window, 'setInterval');
jasmine.clearInterval = jasmine.bindOriginal_(window, 'clearInterval');

jasmine.MessageResult = function(text) {
  this.type = 'MessageResult';
  this.text = text;
  this.trace = new Error(); // todo: test better
};

jasmine.ExpectationResult = function(passed, message, details) {
  this.type = 'ExpectationResult';
  this.passed = passed;
  this.message = message;
  this.details = details;
  this.trace = new Error(message); // todo: test better
};

jasmine.getEnv = function() {
  return jasmine.currentEnv_ = jasmine.currentEnv_ || new jasmine.Env();
};

jasmine.isArray_ = function(value) {
  return value &&
         typeof value === 'object' &&
         typeof value.length === 'number' &&
         typeof value.splice === 'function' &&
         !(value.propertyIsEnumerable('length'));
};

jasmine.pp = function(value) {
  var stringPrettyPrinter = new jasmine.StringPrettyPrinter();
  stringPrettyPrinter.format(value);
  return stringPrettyPrinter.string;
};

jasmine.isDomNode = function(obj) {
  return obj['nodeType'] > 0;
};

jasmine.any = function(clazz) {
  return new jasmine.Matchers.Any(clazz);
};

jasmine.createSpy = function(name) {
  var spyObj = function() {
    spyObj.wasCalled = true;
    spyObj.callCount++;
    var args = jasmine.util.argsToArray(arguments);
    spyObj.mostRecentCall = {
      object: this,
      args: args
    };
    spyObj.argsForCall.push(args);
    return spyObj.plan.apply(this, arguments);
  };

  spyObj.identity = name || 'unknown';
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

jasmine.createSpyObj = function(baseName, methodNames) {
  var obj = {};
  for (var i = 0; i < methodNames.length; i++) {
    obj[methodNames[i]] = jasmine.createSpy(baseName + '.' + methodNames[i]);
  }
  return obj;
};

jasmine.log = function(message) {
  jasmine.getEnv().currentSpec.getResults().log(message);
};

var spyOn = function(obj, methodName) {
  return jasmine.getEnv().currentSpec.spyOn(obj, methodName);
};

var it = function(desc, func) {
  return jasmine.getEnv().it(desc, func);
};

var xit = function(desc, func) {
  return jasmine.getEnv().xit(desc, func);
};

var expect = function(actual) {
  return jasmine.getEnv().currentSpec.expect(actual);
};

var runs = function(func) {
  jasmine.getEnv().currentSpec.runs(func);
};

var waits = function(timeout) {
  jasmine.getEnv().currentSpec.waits(timeout);
};

var waitsFor = function(timeout, latchFunction, message) {
  jasmine.getEnv().currentSpec.waitsFor(timeout, latchFunction, message);
};

var beforeEach = function(beforeEachFunction) {
  jasmine.getEnv().beforeEach(beforeEachFunction);
};

var afterEach = function(afterEachFunction) {
  jasmine.getEnv().afterEach(afterEachFunction);
};

var describe = function(description, specDefinitions) {
  return jasmine.getEnv().describe(description, specDefinitions);
};

var xdescribe = function(description, specDefinitions) {
  return jasmine.getEnv().xdescribe(description, specDefinitions);
};

jasmine.XmlHttpRequest = XMLHttpRequest;

// Provide the XMLHttpRequest class for IE 5.x-6.x:
if (typeof XMLHttpRequest == "undefined") jasmine.XmlHttpRequest = function() {
  try {
    return new ActiveXObject("Msxml2.XMLHTTP.6.0");
  } catch(e) {
  }
  try {
    return new ActiveXObject("Msxml2.XMLHTTP.3.0");
  } catch(e) {
  }
  try {
    return new ActiveXObject("Msxml2.XMLHTTP");
  } catch(e) {
  }
  try {
    return new ActiveXObject("Microsoft.XMLHTTP");
  } catch(e) {
  }
  throw new Error("This browser does not support XMLHttpRequest.");
};

jasmine.include = function(url, opt_global) {
  if (opt_global) {
    document.write('<script type="text/javascript" src="' + url + '"></' + 'script>');
  } else {
    var xhr;
    try {
      xhr = new jasmine.XmlHttpRequest();
      xhr.open("GET", url, false);
      xhr.send(null);
    } catch(e) {
      throw new Error("couldn't fetch " + url + ": " + e);
    }

    return eval(xhr.responseText);
  }
};
/** @namespace */
jasmine.util = {};

jasmine.util.inherit = function(childClass, parentClass) {
  var subclass = function() {
  };
  subclass.prototype = parentClass.prototype;
  childClass.prototype = new subclass;
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

/**
 * Env
 *
 * @constructor
 */
jasmine.Env = function() {
  this.currentSpec = null;
  this.currentSuite = null;
  this.currentRunner = new jasmine.Runner(this);
  this.currentlyRunningTests = false;

  this.updateInterval = 0;
  this.lastUpdate = 0;
  this.specFilter = function() {
    return true;
  };

  this.nextSpecId_ = 0;
  this.equalityTesters_ = [];
};


jasmine.Env.prototype.setTimeout = jasmine.setTimeout;
jasmine.Env.prototype.clearTimeout = jasmine.clearTimeout;
jasmine.Env.prototype.setInterval = jasmine.setInterval;
jasmine.Env.prototype.clearInterval = jasmine.clearInterval;

jasmine.Env.prototype.execute = function() {
  this.currentRunner.execute();
};

jasmine.Env.prototype.describe = function(description, specDefinitions) {
  var suite = new jasmine.Suite(this, description, specDefinitions, this.currentSuite);

  var parentSuite = this.currentSuite;
  if (parentSuite) {
    parentSuite.specs.push(suite);
  } else {
    this.currentRunner.suites.push(suite);
  }

  this.currentSuite = suite;

  specDefinitions.call(suite);

  this.currentSuite = parentSuite;

  return suite;
};

jasmine.Env.prototype.beforeEach = function(beforeEachFunction) {
  this.currentSuite.beforeEach(beforeEachFunction);
};

jasmine.Env.prototype.afterEach = function(afterEachFunction) {
  this.currentSuite.afterEach(afterEachFunction);
};

jasmine.Env.prototype.xdescribe = function(desc, specDefinitions) {
  return {
    execute: function() {
    }
  };
};

jasmine.Env.prototype.it = function(description, func) {
  var spec = new jasmine.Spec(this, this.currentSuite, description);
  this.currentSuite.specs.push(spec);
  this.currentSpec = spec;

  if (func) {
    spec.addToQueue(func);
  }

  return spec;
};

jasmine.Env.prototype.xit = function(desc, func) {
  return {
    id: this.nextSpecId_++,
    runs: function() {
    }
  };
};

jasmine.Env.prototype.compareObjects_ = function(a, b, mismatchKeys, mismatchValues) {
  if (a.__Jasmine_been_here_before__ === b && b.__Jasmine_been_here_before__ === a) {
    return true;
  }

  a.__Jasmine_been_here_before__ = b;
  b.__Jasmine_been_here_before__ = a;

  var hasKey = function(obj, keyName) {
    return obj != null && obj[keyName] !== undefined;
  };

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
    if (property == '__Jasmine_been_here_before__') continue;
    if (!this.equals_(a[property], b[property], mismatchKeys, mismatchValues)) {
      mismatchValues.push("'" + property + "' was<br /><br />'" + (b[property] ? jasmine.util.htmlEscape(b[property].toString()) : b[property]) + "'<br /><br />in expected, but was<br /><br />'" + (a[property] ? jasmine.util.htmlEscape(a[property].toString()) : a[property]) + "'<br /><br />in actual.<br />");
    }
  }

  if (jasmine.isArray_(a) && jasmine.isArray_(b) && a.length != b.length) {
    mismatchValues.push("arrays were not the same length");
  }

  delete a.__Jasmine_been_here_before__;
  delete b.__Jasmine_been_here_before__;
  return (mismatchKeys.length == 0 && mismatchValues.length == 0);
};

jasmine.Env.prototype.equals_ = function(a, b, mismatchKeys, mismatchValues) {
  mismatchKeys = mismatchKeys || [];
  mismatchValues = mismatchValues || [];

  if (a === b) return true;

  if (a === undefined || a === null || b === undefined || b === null) {
    return (a == undefined && b == undefined);
  }

  if (jasmine.isDomNode(a) && jasmine.isDomNode(b)) {
    return a === b;
  }

  if (a instanceof Date && b instanceof Date) {
    return a.getTime() == b.getTime();
  }

  if (a instanceof jasmine.Matchers.Any) {
    return a.matches(b);
  }

  if (b instanceof jasmine.Matchers.Any) {
    return b.matches(a);
  }

  if (typeof a === "object" && typeof b === "object") {
    return this.compareObjects_(a, b, mismatchKeys, mismatchValues);
  }

  for (var i = 0; i < this.equalityTesters_.length; i++) {
    var equalityTester = this.equalityTesters_[i];
    var result = equalityTester(a, b, this, mismatchKeys, mismatchValues);
    if (result !== undefined) return result;
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
/**
 * base for Runner & Suite: allows for a queue of functions to get executed, allowing for
 *   any one action to complete, including asynchronous calls, before going to the next
 *   action.
 *
 * @constructor
 * @param {jasmine.Env} env
 */
jasmine.ActionCollection = function(env) {
  this.env = env;
  this.actions = [];
  this.index = 0;
  this.finished = false;
};

jasmine.ActionCollection.prototype.finish = function() {
  if (this.finishCallback) {
    this.finishCallback();
  }
  this.finished = true;
};

jasmine.ActionCollection.prototype.execute = function() {
  if (this.actions.length > 0) {
    this.next();
  }
};

jasmine.ActionCollection.prototype.getCurrentAction = function() {
  return this.actions[this.index];
};

jasmine.ActionCollection.prototype.next = function() {
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

jasmine.ActionCollection.prototype.waitForDone = function(action) {
  var self = this;
  var afterExecute = function afterExecute() {
    self.index++;
    self.next();
  };

  if (action.finished) {
    var now = new Date().getTime();
    if (this.env.updateInterval && now - this.env.lastUpdate > this.env.updateInterval) {
      this.env.lastUpdate = now;
      this.env.setTimeout(afterExecute, 0);
    } else {
      afterExecute();
    }
    return;
  }

  var id = this.env.setInterval(function() {
    if (action.finished) {
      self.env.clearInterval(id);
      afterExecute();
    }
  }, 150);
};
/*
 * jasmine.Matchers methods; add your own by extending jasmine.Matchers.prototype - don't forget to write a test
 *
 */

jasmine.Matchers = function(env, actual, results) {
  this.env = env;
  this.actual = actual;
  this.passing_message = 'Passed.';
  this.results = results || new jasmine.NestedResults();
};

jasmine.Matchers.pp = function(str) {
  return jasmine.util.htmlEscape(jasmine.pp(str));
};

jasmine.Matchers.prototype.getResults = function() {
  return this.results;
};

jasmine.Matchers.prototype.report = function(result, failing_message, details) {
  this.results.addResult(new jasmine.ExpectationResult(result, result ? this.passing_message : failing_message, details));
  return result;
};

jasmine.Matchers.prototype.toBe = function(expected) {
  return this.report(this.actual === expected, 'Expected<br /><br />' + jasmine.Matchers.pp(expected)
    + '<br /><br />to be the same object as<br /><br />' + jasmine.Matchers.pp(this.actual)
    + '<br />');
};

jasmine.Matchers.prototype.toNotBe = function(expected) {
  return this.report(this.actual !== expected, 'Expected<br /><br />' + jasmine.Matchers.pp(expected)
    + '<br /><br />to be a different object from actual, but they were the same.');
};

jasmine.Matchers.prototype.toEqual = function(expected) {
  var mismatchKeys = [];
  var mismatchValues = [];

  var formatMismatches = function(name, array) {
    if (array.length == 0) return '';
    var errorOutput = '<br /><br />Different ' + name + ':<br />';
    for (var i = 0; i < array.length; i++) {
      errorOutput += array[i] + '<br />';
    }
    return errorOutput;
  };

  return this.report(this.env.equals_(this.actual, expected, mismatchKeys, mismatchValues),
    'Expected<br /><br />' + jasmine.Matchers.pp(expected)
      + '<br /><br />but got<br /><br />' + jasmine.Matchers.pp(this.actual)
      + '<br />'
      + formatMismatches('Keys', mismatchKeys)
      + formatMismatches('Values', mismatchValues), {
    matcherName: 'toEqual', expected: expected, actual: this.actual
  });
};
/** @deprecated */
jasmine.Matchers.prototype.should_equal = jasmine.Matchers.prototype.toEqual;

jasmine.Matchers.prototype.toNotEqual = function(expected) {
  return this.report(!this.env.equals_(this.actual, expected),
    'Expected ' + jasmine.Matchers.pp(expected) + ' to not equal ' + jasmine.Matchers.pp(this.actual) + ', but it does.');
};
/** @deprecated */
jasmine.Matchers.prototype.should_not_equal = jasmine.Matchers.prototype.toNotEqual;

jasmine.Matchers.prototype.toMatch = function(reg_exp) {
  return this.report((new RegExp(reg_exp).test(this.actual)),
    'Expected ' + jasmine.Matchers.pp(this.actual) + ' to match ' + reg_exp + '.');
};
/** @deprecated */
jasmine.Matchers.prototype.should_match = jasmine.Matchers.prototype.toMatch;

jasmine.Matchers.prototype.toNotMatch = function(reg_exp) {
  return this.report((!new RegExp(reg_exp).test(this.actual)),
    'Expected ' + jasmine.Matchers.pp(this.actual) + ' to not match ' + reg_exp + '.');
};
/** @deprecated */
jasmine.Matchers.prototype.should_not_match = jasmine.Matchers.prototype.toNotMatch;

jasmine.Matchers.prototype.toBeDefined = function() {
  return this.report((this.actual !== undefined),
    'Expected a value to be defined but it was undefined.');
};
/** @deprecated */
jasmine.Matchers.prototype.should_be_defined = jasmine.Matchers.prototype.toBeDefined;

jasmine.Matchers.prototype.toBeNull = function() {
  return this.report((this.actual === null),
    'Expected a value to be null but it was ' + jasmine.Matchers.pp(this.actual) + '.');
};
/** @deprecated */
jasmine.Matchers.prototype.should_be_null = jasmine.Matchers.prototype.toBeNull;

jasmine.Matchers.prototype.toBeTruthy = function() {
  return this.report(!!this.actual,
    'Expected a value to be truthy but it was ' + jasmine.Matchers.pp(this.actual) + '.');
};
/** @deprecated */
jasmine.Matchers.prototype.should_be_truthy = jasmine.Matchers.prototype.toBeTruthy;

jasmine.Matchers.prototype.toBeFalsy = function() {
  return this.report(!this.actual,
    'Expected a value to be falsy but it was ' + jasmine.Matchers.pp(this.actual) + '.');
};
/** @deprecated */
jasmine.Matchers.prototype.should_be_falsy = jasmine.Matchers.prototype.toBeFalsy;

jasmine.Matchers.prototype.wasCalled = function() {
  if (!this.actual || !this.actual.isSpy) {
    return this.report(false, 'Expected a spy, but got ' + jasmine.Matchers.pp(this.actual) + '.');
  }
  if (arguments.length > 0) {
    return this.report(false, 'wasCalled matcher does not take arguments');
  }
  return this.report((this.actual.wasCalled),
    'Expected spy "' + this.actual.identity + '" to have been called, but it was not.');
};
/** @deprecated */
jasmine.Matchers.prototype.was_called = jasmine.Matchers.prototype.wasCalled;

jasmine.Matchers.prototype.wasNotCalled = function() {
  if (!this.actual || !this.actual.isSpy) {
    return this.report(false, 'Expected a spy, but got ' + jasmine.Matchers.pp(this.actual) + '.');
  }
  return this.report((!this.actual.wasCalled),
    'Expected spy "' + this.actual.identity + '" to not have been called, but it was.');
};
/** @deprecated */
jasmine.Matchers.prototype.was_not_called = jasmine.Matchers.prototype.wasNotCalled;

jasmine.Matchers.prototype.wasCalledWith = function() {
  if (!this.actual || !this.actual.isSpy) {
    return this.report(false, 'Expected a spy, but got ' + jasmine.Matchers.pp(this.actual) + '.', {
      matcherName: 'wasCalledWith'
    });
  }

  var args = jasmine.util.argsToArray(arguments);

  return this.report(this.env.contains_(this.actual.argsForCall, args),
    'Expected ' + jasmine.Matchers.pp(this.actual.argsForCall) + ' to contain ' + jasmine.Matchers.pp(args) + ', but it does not.', {
    matcherName: 'wasCalledWith', expected: args, actual: this.actual.argsForCall
  });
};

jasmine.Matchers.prototype.toContain = function(expected) {
  return this.report(this.env.contains_(this.actual, expected),
    'Expected ' + jasmine.Matchers.pp(this.actual) + ' to contain ' + jasmine.Matchers.pp(expected) + ', but it does not.', {
    matcherName: 'toContain', expected: expected, actual: this.actual
  });
};

jasmine.Matchers.prototype.toNotContain = function(item) {
  return this.report(!this.env.contains_(this.actual, item),
    'Expected ' + jasmine.Matchers.pp(this.actual) + ' not to contain ' + jasmine.Matchers.pp(item) + ', but it does.');
};

jasmine.Matchers.prototype.toThrow = function(expectedException) {
  var exception = null;
  try {
    this.actual();
  } catch (e) {
    exception = e;
  }
  if (expectedException !== undefined) {
    if (exception == null) {
      return this.report(false, "Expected function to throw " + jasmine.Matchers.pp(expectedException) + ", but it did not.");
    }
    return this.report(
      this.env.equals_(
        exception.message || exception,
        expectedException.message || expectedException),
      "Expected function to throw " + jasmine.Matchers.pp(expectedException) + ", but it threw " + jasmine.Matchers.pp(exception) + ".");
  } else {
    return this.report(exception != null, "Expected function to throw an exception, but it did not.");
  }
};

jasmine.Matchers.Any = function(expectedClass) {
  this.expectedClass = expectedClass;
};

jasmine.Matchers.Any.prototype.matches = function(other) {
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

jasmine.Matchers.Any.prototype.toString = function() {
  return '<jasmine.any(' + this.expectedClass + ')>';
};

// Mock setTimeout, clearTimeout
// Contributed by Pivotal Computer Systems, www.pivotalsf.com

jasmine.FakeTimer = function() {
  this.reset();

  var self = this;
  self.setTimeout = function(funcToCall, millis) {
    self.timeoutsMade++;
    self.scheduleFunction(self.timeoutsMade, funcToCall, millis, false);
    return self.timeoutsMade;
  };

  self.setInterval = function(funcToCall, millis) {
    self.timeoutsMade++;
    self.scheduleFunction(self.timeoutsMade, funcToCall, millis, true);
    return self.timeoutsMade;
  };

  self.clearTimeout = function(timeoutKey) {
    self.scheduledFunctions[timeoutKey] = undefined;
  };

  self.clearInterval = function(timeoutKey) {
    self.scheduledFunctions[timeoutKey] = undefined;
  };

};

jasmine.FakeTimer.prototype.reset = function() {
  this.timeoutsMade = 0;
  this.scheduledFunctions = {};
  this.nowMillis = 0;
};

jasmine.FakeTimer.prototype.tick = function(millis) {
  var oldMillis = this.nowMillis;
  var newMillis = oldMillis + millis;
  this.runFunctionsWithinRange(oldMillis, newMillis);
  this.nowMillis = newMillis;
};

jasmine.FakeTimer.prototype.runFunctionsWithinRange = function(oldMillis, nowMillis) {
  var scheduledFunc;
  var funcsToRun = [];
  for (var timeoutKey in this.scheduledFunctions) {
    scheduledFunc = this.scheduledFunctions[timeoutKey];
    if (scheduledFunc != undefined &&
        scheduledFunc.runAtMillis >= oldMillis &&
        scheduledFunc.runAtMillis <= nowMillis) {
      funcsToRun.push(scheduledFunc);
      this.scheduledFunctions[timeoutKey] = undefined;
    }
  }

  if (funcsToRun.length > 0) {
    funcsToRun.sort(function(a, b) {
      return a.runAtMillis - b.runAtMillis;
    });
    for (var i = 0; i < funcsToRun.length; ++i) {
      try {
        var funcToRun = funcsToRun[i];
        this.nowMillis = funcToRun.runAtMillis;
        funcToRun.funcToCall();
        if (funcToRun.recurring) {
          this.scheduleFunction(funcToRun.timeoutKey,
            funcToRun.funcToCall,
            funcToRun.millis,
            true);
        }
      } catch(e) {
      }
    }
    this.runFunctionsWithinRange(oldMillis, nowMillis);
  }
};

jasmine.FakeTimer.prototype.scheduleFunction = function(timeoutKey, funcToCall, millis, recurring) {
  this.scheduledFunctions[timeoutKey] = {
    runAtMillis: this.nowMillis + millis,
    funcToCall: funcToCall,
    recurring: recurring,
    timeoutKey: timeoutKey,
    millis: millis
  };
};


jasmine.Clock = {
  defaultFakeTimer: new jasmine.FakeTimer(),

  reset: function() {
    jasmine.Clock.assertInstalled();
    jasmine.Clock.defaultFakeTimer.reset();
  },

  tick: function(millis) {
    jasmine.Clock.assertInstalled();
    jasmine.Clock.defaultFakeTimer.tick(millis);
  },

  runFunctionsWithinRange: function(oldMillis, nowMillis) {
    jasmine.Clock.defaultFakeTimer.runFunctionsWithinRange(oldMillis, nowMillis);
  },

  scheduleFunction: function(timeoutKey, funcToCall, millis, recurring) {
    jasmine.Clock.defaultFakeTimer.scheduleFunction(timeoutKey, funcToCall, millis, recurring);
  },

  useMock: function() {
    var spec = jasmine.getEnv().currentSpec;
    spec.after(jasmine.Clock.uninstallMock);

    jasmine.Clock.installMock();
  },

  installMock: function() {
    jasmine.Clock.installed = jasmine.Clock.defaultFakeTimer;
  },

  uninstallMock: function() {
    jasmine.Clock.assertInstalled();
    jasmine.Clock.installed = jasmine.Clock.real;
  },

  real: {
    setTimeout: window.setTimeout,
    clearTimeout: window.clearTimeout,
    setInterval: window.setInterval,
    clearInterval: window.clearInterval
  },

  assertInstalled: function() {
    if (jasmine.Clock.installed != jasmine.Clock.defaultFakeTimer) {
      throw new Error("Mock clock is not installed, use jasmine.Clock.useMock()");
    }
  },  

  installed: null
};
jasmine.Clock.installed = jasmine.Clock.real;

window.setTimeout = function(funcToCall, millis) {
  return jasmine.Clock.installed.setTimeout.apply(this, arguments);
};

window.setInterval = function(funcToCall, millis) {
  return jasmine.Clock.installed.setInterval.apply(this, arguments);
};

window.clearTimeout = function(timeoutKey) {
  return jasmine.Clock.installed.clearTimeout.apply(this, arguments);
};

window.clearInterval = function(timeoutKey) {
  return jasmine.Clock.installed.clearInterval.apply(this, arguments);
};

/**
 * Holds results; allows for the results array to hold another jasmine.NestedResults
 *
 * @constructor
 */
jasmine.NestedResults = function() {
  this.totalCount = 0;
  this.passedCount = 0;
  this.failedCount = 0;
  this.skipped = false;
  this.items_ = [];
};

jasmine.NestedResults.prototype.rollupCounts = function(result) {
  this.totalCount += result.totalCount;
  this.passedCount += result.passedCount;
  this.failedCount += result.failedCount;
};

jasmine.NestedResults.prototype.log = function(message) {
  this.items_.push(new jasmine.MessageResult(message));
};

jasmine.NestedResults.prototype.getItems = function() {
  return this.items_;
};

/**
 * @param {jasmine.ExpectationResult|jasmine.NestedResults} result
 */
jasmine.NestedResults.prototype.addResult = function(result) {
  if (result.type != 'MessageResult') {
    if (result.items_) {
      this.rollupCounts(result);
    } else {
      this.totalCount++;
      if (result.passed) {
        this.passedCount++;
      } else {
        this.failedCount++;
      }
    }
  }
  this.items_.push(result);
};

jasmine.NestedResults.prototype.passed = function() {
  return this.passedCount === this.totalCount;
};
jasmine.PrettyPrinter = function() {
  this.ppNestLevel_ = 0;
};

jasmine.PrettyPrinter.prototype.format = function(value) {
  if (this.ppNestLevel_ > 40) {
    //    return '(jasmine.pp nested too deeply!)';
    throw new Error('jasmine.PrettyPrinter: format() nested too deeply!');
  }

  this.ppNestLevel_++;
  try {
    if (value === undefined) {
      this.emitScalar('undefined');
    } else if (value === null) {
      this.emitScalar('null');
    } else if (value.navigator && value.frames && value.setTimeout) {
      this.emitScalar('<window>');
    } else if (value instanceof jasmine.Matchers.Any) {
      this.emitScalar(value.toString());
    } else if (typeof value === 'string') {
      this.emitScalar("'" + value + "'");
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
    if (property == '__Jasmine_been_here_before__') continue;
    fn(property, obj.__lookupGetter__(property) != null);
  }
};

jasmine.PrettyPrinter.prototype.emitArray = jasmine.unimplementedMethod_;
jasmine.PrettyPrinter.prototype.emitObject = jasmine.unimplementedMethod_;
jasmine.PrettyPrinter.prototype.emitScalar = jasmine.unimplementedMethod_;

jasmine.StringPrettyPrinter = function() {
  jasmine.PrettyPrinter.call(this);

  this.string = '';
};
jasmine.util.inherit(jasmine.StringPrettyPrinter, jasmine.PrettyPrinter);

jasmine.StringPrettyPrinter.prototype.emitScalar = function(value) {
  this.append(value);
};

jasmine.StringPrettyPrinter.prototype.emitArray = function(array) {
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
/**
 * QueuedFunction is how ActionCollections' actions are implemented
 *
 * @constructor
 * @param {jasmine.Env} env
 * @param {Function} func
 * @param {Number} timeout
 * @param {Function} latchFunction
 * @param {jasmine.Spec} spec
 */
jasmine.QueuedFunction = function(env, func, timeout, latchFunction, spec) {
  this.env = env;
  this.func = func;
  this.timeout = timeout;
  this.latchFunction = latchFunction;
  this.spec = spec;

  this.totalTimeSpentWaitingForLatch = 0;
  this.latchTimeoutIncrement = 100;
};

jasmine.QueuedFunction.prototype.next = function() {
  this.spec.finish(); // default value is to be done after one function
};

jasmine.QueuedFunction.prototype.safeExecute = function() {
  if (this.env.reporter) {
    this.env.reporter.log('>> Jasmine Running ' + this.spec.suite.description + ' ' + this.spec.description + '...');
  }

  try {
    this.func.apply(this.spec);
  } catch (e) {
    this.fail(e);
  }
};

jasmine.QueuedFunction.prototype.execute = function() {
  var self = this;
  var executeNow = function() {
    self.safeExecute();
    self.next();
  };

  var executeLater = function() {
    self.env.setTimeout(executeNow, self.timeout);
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
      self.fail({
        name: 'timeout',
        message: message
      });
      self.next();
    } else {
      self.totalTimeSpentWaitingForLatch += self.latchTimeoutIncrement;
      self.env.setTimeout(executeNowOrLater, self.latchTimeoutIncrement);
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

jasmine.QueuedFunction.prototype.fail = function(e) {
  this.spec.results.addResult(new jasmine.ExpectationResult(false, jasmine.util.formatException(e), null));
};
/* JasmineReporters.reporter
 *    Base object that will get called whenever a Spec, Suite, or Runner is done.  It is up to
 *    descendants of this object to do something with the results (see json_reporter.js)
 */
jasmine.Reporters = {};

jasmine.Reporters.reporter = function(callbacks) {
  var that = {
    callbacks: callbacks || {},

    doCallback: function(callback, results) {
      if (callback) {
        callback(results);
      }
    },

    reportRunnerResults: function(runner) {
      that.doCallback(that.callbacks.runnerCallback, runner);
    },
    reportSuiteResults:  function(suite) {
      that.doCallback(that.callbacks.suiteCallback, suite);
    },
    reportSpecResults:   function(spec) {
      that.doCallback(that.callbacks.specCallback, spec);
    },
    log: function (str) {
      if (console && console.log) console.log(str);
    }
  };

  return that;
};

/**
 * Runner
 *
 * @constructor
 * @param {jasmine.Env} env
 */
jasmine.Runner = function(env) {
  jasmine.ActionCollection.call(this, env);

  this.suites = this.actions;
};
jasmine.util.inherit(jasmine.Runner, jasmine.ActionCollection);

jasmine.Runner.prototype.finishCallback = function() {
  if (this.env.reporter) {
    this.env.reporter.reportRunnerResults(this);
  }
};

jasmine.Runner.prototype.getResults = function() {
  var results = new jasmine.NestedResults();
  for (var i = 0; i < this.suites.length; i++) {
    results.rollupCounts(this.suites[i].getResults());
  }
  return results;
};
/**
 * Spec
 *
 * @constructor
 * @param {jasmine.Env} env
 * @param {String} description
 */
jasmine.Spec = function(env, suite, description) {
  this.id = env.nextSpecId_++;
  this.env = env;
  this.suite = suite;
  this.description = description;
  this.queue = [];
  this.currentTimeout = 0;
  this.currentLatchFunction = undefined;
  this.finished = false;
  this.afterCallbacks = [];
  this.spies_ = [];

  this.results = new jasmine.NestedResults();
  this.results.description = description;
  this.runs = this.addToQueue;
};

jasmine.Spec.prototype.getFullName = function() {
  return this.suite.getFullName() + ' ' + this.description + '.';
};

jasmine.Spec.prototype.getResults = function() {
  return this.results;
};

jasmine.Spec.prototype.addToQueue = function(func) {
  var queuedFunction = new jasmine.QueuedFunction(this.env, func, this.currentTimeout, this.currentLatchFunction, this);
  this.queue.push(queuedFunction);

  if (this.queue.length > 1) {
    var previousQueuedFunction = this.queue[this.queue.length - 2];
    previousQueuedFunction.next = function() {
      queuedFunction.execute();
    };
  }

  this.resetTimeout();
  return this;
};

/** @deprecated */
jasmine.Spec.prototype.expects_that = function(actual) {
  return this.expect(actual);
};

jasmine.Spec.prototype.expect = function(actual) {
  return new jasmine.Matchers(this.env, actual, this.results);
};

jasmine.Spec.prototype.waits = function(timeout) {
  this.currentTimeout = timeout;
  this.currentLatchFunction = undefined;
  return this;
};

jasmine.Spec.prototype.waitsFor = function(timeout, latchFunction, message) {
  this.currentTimeout = timeout;
  this.currentLatchFunction = latchFunction;
  this.currentLatchFunction.description = message;
  return this;
};

jasmine.Spec.prototype.resetTimeout = function() {
  this.currentTimeout = 0;
  this.currentLatchFunction = undefined;
};

jasmine.Spec.prototype.finishCallback = function() {
  if (this.env.reporter) {
    this.env.reporter.reportSpecResults(this);
  }
};

jasmine.Spec.prototype.finish = function() {
  this.safeExecuteAfters();

  this.removeAllSpies();
  this.finishCallback();
  this.finished = true;
};

jasmine.Spec.prototype.after = function(doAfter) {
  this.afterCallbacks.unshift(doAfter);
};

jasmine.Spec.prototype.execute = function() {
  if (!this.env.specFilter(this)) {
    this.results.skipped = true;
    this.finishCallback();
    this.finished = true;
    return;
  }

  this.env.currentSpec = this;
  this.env.currentlyRunningTests = true;

  this.safeExecuteBefores();

  if (this.queue[0]) {
    this.queue[0].execute();
  } else {
    this.finish();
  }
  this.env.currentlyRunningTests = false;
};

jasmine.Spec.prototype.safeExecuteBefores = function() {
  var befores = [];
  for (var suite = this.suite; suite; suite = suite.parentSuite) {
    if (suite.beforeEachFunction) befores.push(suite.beforeEachFunction);
  }

  while (befores.length) {
    this.safeExecuteBeforeOrAfter(befores.pop());
  }
};

jasmine.Spec.prototype.safeExecuteAfters = function() {
  for (var suite = this.suite; suite; suite = suite.parentSuite) {
    if (suite.afterEachFunction) this.safeExecuteBeforeOrAfter(suite.afterEachFunction);
  }
};

jasmine.Spec.prototype.safeExecuteBeforeOrAfter = function(func) {
  try {
    func.apply(this);
  } catch (e) {
    this.results.addResult(new jasmine.ExpectationResult(false, func.typeName + '() fail: ' + jasmine.util.formatException(e), null));
  }
};

jasmine.Spec.prototype.explodes = function() {
  throw 'explodes function should not have been called';
};

jasmine.Spec.prototype.spyOn = function(obj, methodName, ignoreMethodDoesntExist) {
  if (obj == undefined) {
    throw "spyOn could not find an object to spy upon for " + methodName + "()";
  }

  if (!ignoreMethodDoesntExist && obj[methodName] === undefined) {
    throw methodName + '() method does not exist';
  }

  if (!ignoreMethodDoesntExist && obj[methodName] && obj[methodName].isSpy) {
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

jasmine.Spec.prototype.removeAllSpies = function() {
  for (var i = 0; i < this.spies_.length; i++) {
    var spy = this.spies_[i];
    spy.baseObj[spy.methodName] = spy.originalValue;
  }
  this.spies_ = [];
};

/**
 * Description
 *
 * @constructor
 * @param {jasmine.Env} env
 * @param {String} description
 * @param {Function} specDefinitions
 * @param {jasmine.Suite} parentSuite
 */
jasmine.Suite = function(env, description, specDefinitions, parentSuite) {
  jasmine.ActionCollection.call(this, env);

  this.description = description;
  this.specs = this.actions;
  this.parentSuite = parentSuite;

  this.beforeEachFunction = null;
  this.afterEachFunction = null;
};
jasmine.util.inherit(jasmine.Suite, jasmine.ActionCollection);

jasmine.Suite.prototype.getFullName = function() {
  var fullName = this.description;
  for (var parentSuite = this.parentSuite; parentSuite; parentSuite = parentSuite.parentSuite) {
    fullName = parentSuite.description + ' ' + fullName;
  }
  return fullName;
};

jasmine.Suite.prototype.finishCallback = function() {
  if (this.env.reporter) {
    this.env.reporter.reportSuiteResults(this);
  }
};

jasmine.Suite.prototype.beforeEach = function(beforeEachFunction) {
  beforeEachFunction.typeName = 'beforeEach';
  this.beforeEachFunction = beforeEachFunction;
};

jasmine.Suite.prototype.afterEach = function(afterEachFunction) {
  afterEachFunction.typeName = 'afterEach';
  this.afterEachFunction = afterEachFunction;
};

jasmine.Suite.prototype.getResults = function() {
  var results = new jasmine.NestedResults();
  for (var i = 0; i < this.specs.length; i++) {
    results.rollupCounts(this.specs[i].getResults());
  }
  return results;
};

