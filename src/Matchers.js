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
  return this.report((this.actual !== expected),
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

