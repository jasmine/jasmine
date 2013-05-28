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
