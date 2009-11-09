/**
 * @constructor
 * @param {jasmine.Env} env
 * @param actual
 * @param {jasmine.NestedResults} results
 */
jasmine.Matchers = function(env, actual, spec) {
  this.env = env;
  this.actual = actual;
  this.spec = spec;
};

jasmine.Matchers.pp = function(str) {
  return jasmine.util.htmlEscape(jasmine.pp(str));
};

jasmine.Matchers.prototype.report = function(result, failing_message, details) {
  var expectationResult = new jasmine.ExpectationResult({
    passed: result,
    message: failing_message,
    details: details
  });
  this.spec.addMatcherResult(expectationResult);
  return result;
};

jasmine.Matchers.matcherFn_ = function(matcherName, options) {
  return function () {
    jasmine.util.extend(this, options);
    var matcherArgs = jasmine.util.argsToArray(arguments);
    var args = [this.actual].concat(matcherArgs);
    var result = options.test.apply(this, args);
    var message;
    if (!result) {
      message = options.message.apply(this, args);
    }
    var expectationResult = new jasmine.ExpectationResult({
      matcherName: matcherName,
      passed: result,
      expected: matcherArgs.length > 1 ? matcherArgs : matcherArgs[0],
      actual: this.actual,
      message: message
    });
    this.spec.addMatcherResult(expectationResult);
    return result;
  };
};




/**
 * toBe: compares the actual to the expected using ===
 * @param expected
 */

jasmine.Matchers.prototype.toBe = jasmine.Matchers.matcherFn_('toBe', {
  test: function (actual, expected) {
    return actual === expected;
  },
  message: function(actual, expected) {
    return "Expected " + jasmine.pp(actual) + " to be " + jasmine.pp(expected);
  }
});

/**
 * toNotBe: compares the actual to the expected using !==
 * @param expected
 */
jasmine.Matchers.prototype.toNotBe = jasmine.Matchers.matcherFn_('toNotBe', {
  test: function (actual, expected) {
    return actual !== expected;
  },
  message: function(actual, expected) {
    return "Expected " + jasmine.pp(actual) + " to not be " + jasmine.pp(expected);
  }
});

/**
 * toEqual: compares the actual to the expected using common sense equality. Handles Objects, Arrays, etc.
 *
 * @param expected
 */

jasmine.Matchers.prototype.toEqual = jasmine.Matchers.matcherFn_('toEqual', {
  test: function (actual, expected) {
    return this.env.equals_(actual, expected);
  },
  message: function(actual, expected) {
    return "Expected " + jasmine.pp(actual) + " to equal " + jasmine.pp(expected);
  }
});

/**
 * toNotEqual: compares the actual to the expected using the ! of jasmine.Matchers.toEqual
 * @param expected
 */
jasmine.Matchers.prototype.toNotEqual = jasmine.Matchers.matcherFn_('toNotEqual', {
  test: function (actual, expected) {
    return !this.env.equals_(actual, expected);
  },
  message: function(actual, expected) {
    return "Expected " + jasmine.pp(actual) + " to not equal " + jasmine.pp(expected);
  }
});

/**
 * Matcher that compares the actual to the expected using a regular expression.  Constructs a RegExp, so takes
 * a pattern or a String.
 *
 * @param reg_exp
 */
jasmine.Matchers.prototype.toMatch = jasmine.Matchers.matcherFn_('toMatch', {
  test: function(actual, expected) {
    return new RegExp(expected).test(actual);
  },
  message: function(actual, expected) {
    return jasmine.pp(actual) + " does not match the regular expression " + new RegExp(expected).toString();
  }
});

/**
 * Matcher that compares the actual to the expected using the boolean inverse of jasmine.Matchers.toMatch
 * @param reg_exp
 */

jasmine.Matchers.prototype.toNotMatch = jasmine.Matchers.matcherFn_('toNotMatch', {
  test: function(actual, expected) {
    return !(new RegExp(expected).test(actual));
  },
  message: function(actual, expected) {
    return jasmine.pp(actual) + " should not match " + new RegExp(expected).toString();
  }
});

/**
 * Matcher that compares the acutal to undefined.
 */

jasmine.Matchers.prototype.toBeDefined = jasmine.Matchers.matcherFn_('toBeDefined', {
  test: function(actual) {
    return (actual !== undefined);
  },
  message: function() {
    return 'Expected actual to not be undefined.';
  }
});

/**
 * Matcher that compares the acutal to undefined.
 */

jasmine.Matchers.prototype.toBeUndefined = jasmine.Matchers.matcherFn_('toBeUndefined', {
  test: function(actual) {
    return (actual === undefined);
  },
  message: function(actual) {
    return 'Expected ' + jasmine.pp(actual) + ' to be undefined.';
  }
});

/**
 * Matcher that compares the actual to null.
 *
 */
jasmine.Matchers.prototype.toBeNull = jasmine.Matchers.matcherFn_('toBeNull', {
  test: function(actual) {
    return (actual === null);
  },
  message: function(actual) {
    return 'Expected ' + jasmine.pp(actual) + ' to be null.';
  }
});

/**
 * Matcher that boolean not-nots the actual.
 */
jasmine.Matchers.prototype.toBeTruthy = jasmine.Matchers.matcherFn_('toBeTruthy', {
  test: function(actual) {
    return !!actual;
  },
  message: function() {
    return 'Expected actual to be truthy';
  }
});


/**
 * Matcher that boolean nots the actual.
 */
jasmine.Matchers.prototype.toBeFalsy = jasmine.Matchers.matcherFn_('toBeFalsy', {
  test: function(actual) {
    return !actual;
  },
  message: function(actual) {
    return 'Expected ' + jasmine.pp(actual) + ' to be falsy';
  }
});

/**
 * Matcher that checks to see if the acutal, a Jasmine spy, was called.
 */

jasmine.Matchers.prototype.wasCalled = jasmine.Matchers.matcherFn_('wasCalled', {
  getActual_: function() {
    var args = jasmine.util.argsToArray(arguments);
    if (args.length > 1) {
      throw(new Error('wasCalled does not take arguments, use wasCalledWith'));
    }
    return args.splice(0, 1)[0];
  },
  test: function() {
    var actual = this.getActual_.apply(this, arguments);
    if (!actual || !actual.isSpy) {
      return false;
    }
    return actual.wasCalled;
  },
  message: function() {
    var actual = this.getActual_.apply(this, arguments);
    if (!actual || !actual.isSpy) {
      return 'Actual is not a spy.';
    }
    return "Expected spy " + actual.identity + " to have been called.";
  }
});

/**
 * Matcher that checks to see if the acutal, a Jasmine spy, was not called.
 */
jasmine.Matchers.prototype.wasNotCalled = jasmine.Matchers.matcherFn_('wasNotCalled', {
  getActual_: function() {
    var args = jasmine.util.argsToArray(arguments);
    return args.splice(0, 1)[0];
  },
  test: function() {
    var actual = this.getActual_.apply(this, arguments);
    if (!actual || !actual.isSpy) {
      return false;
    }
    return !actual.wasCalled;
  },
  message: function() {
    var actual = this.getActual_.apply(this, arguments);
    if (!actual || !actual.isSpy) {
      return 'Actual is not a spy.';
    }
    return "Expected spy " + actual.identity + " to not have been called.";
  }
});

jasmine.Matchers.prototype.wasCalledWith = jasmine.Matchers.matcherFn_('wasCalledWith', {
  test: function() {
    var args = jasmine.util.argsToArray(arguments);
    var actual = args.splice(0, 1)[0];
    if (!actual || !actual.isSpy) {
      return false;
    }
    return this.env.contains_(actual.argsForCall, args);
  },
  message: function() {
    var args = jasmine.util.argsToArray(arguments);
    var actual = args.splice(0, 1)[0];
    var message;
    if (!actual || !actual.isSpy) {
      message = 'Actual is not a spy';
    } else {
      message = "Expected spy to have been called with " + jasmine.pp(args) + " but was called with " + actual.argsForCall;
    }
    return message;
  }
});

/**
 * Matcher that checks to see if the acutal, a Jasmine spy, was called with a set of parameters.
 *
 * @example
 *
 */

/**
 * Matcher that checks that the expected item is an element in the actual Array.
 *
 * @param {Object} item
 */

jasmine.Matchers.prototype.toContain = jasmine.Matchers.matcherFn_('toContain', {
  test: function(actual, expected) {
    return this.env.contains_(actual, expected);
  },
  message: function(actual, expected) {
    return 'Expected ' + jasmine.pp(actual) + ' to contain ' + jasmine.pp(expected);
  }
});

/**
 * Matcher that checks that the expected item is NOT an element in the actual Array.
 *
 * @param {Object} item
 */
jasmine.Matchers.prototype.toNotContain = jasmine.Matchers.matcherFn_('toNotContain', {
  test: function(actual, expected) {
    return !this.env.contains_(actual, expected);
  },
  message: function(actual, expected) {
    return 'Expected ' + jasmine.pp(actual) + ' to not contain ' + jasmine.pp(expected);
  }
});

jasmine.Matchers.prototype.toBeLessThan = jasmine.Matchers.matcherFn_('toBeLessThan', {
  test: function(actual, expected) {
    return actual < expected;
  },
  message: function(actual, expected) {
    return 'Expected ' + jasmine.pp(actual) + ' to be less than ' + jasmine.pp(expected);
  }
});

jasmine.Matchers.prototype.toBeGreaterThan = jasmine.Matchers.matcherFn_('toBeGreaterThan', {
  test: function(actual, expected) {
    return actual > expected;
  },
  message: function(actual, expected) {
    return 'Expected ' + jasmine.pp(actual) + ' to be greater than ' + jasmine.pp(expected);
  }
});

/**
 * Matcher that checks that the expected exception was thrown by the actual.
 *
 * @param {String} expectedException
 */
jasmine.Matchers.prototype.toThrow = jasmine.Matchers.matcherFn_('toThrow', {
  getException_: function(actual, expected) {
    var exception;
    if (typeof actual != 'function') {
      throw new Error('Actual is not a function');
    }
    try {
      actual();
    } catch (e) {
      exception = e;
    }
    return exception;
  },
  test: function(actual, expected) {
    var result = false;
    var exception = this.getException_(actual, expected);
    if (exception) {
      result = (expected === undefined || this.env.equals_(exception.message || exception, expected.message || expected));
    }
    return result;
  },
  message: function(actual, expected) {
    var exception = this.getException_(actual, expected);
    if (exception && (expected === undefined || !this.env.equals_(exception.message || exception, expected.message || expected))) {
      return ["Expected function to throw", expected.message || expected, ", but it threw", exception.message || exception  ].join(' ');
    } else {
      return "Expected function to throw an exception.";
    }
  }
});

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

