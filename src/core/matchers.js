getJasmineRequireObj().matchers = function() {
  matchers = {};

  matchers.toBe = function() {
    return {
      compare: function(actual, expected) {
        return {
          pass: actual === expected
        };
      }
    };
  };

  matchers.toBeCloseTo = function() {
    return {
      compare: function(actual, expected, precision) {
        if (precision !== 0) {
          precision = precision || 2;
        }

        return {
          pass: Math.abs(expected - actual) < (Math.pow(10, -precision) / 2)
        };
      }
    };
  };

  matchers.toBeDefined = function() {
    return {
      compare: function(actual) {
        return {
          pass: (void 0 !== actual)
        };
      }
    };
  };

  matchers.toBeFalsy = function() {
    return {
      compare: function(actual) {
        return {
          pass: !!!actual
        };
      }
    };
  };

  matchers.toBeGreaterThan = function() {
    return {
      compare: function(actual, expected) {
        return {
          pass: actual > expected
        };
      }
    };
  };

  matchers.toBeLessThan = function() {
    return {

      compare: function(actual, expected) {
        return {
          pass: actual < expected
        };
      }
    };
  };

  matchers.toBeNaN = function() {
    return {
      compare: function(actual) {
        var result = {
          pass: (actual !== actual)
        };

        if (result.pass) {
          result.message = "Expected actual not to be NaN.";
        } else {
          result.message = "Expected " + j$.pp(actual) + " to be NaN.";
        }

        return result;
      }
    };
  };

  matchers.toBeNull = function() {
    return {
      compare: function(actual) {
        return {
          pass: actual === null
        };
      }
    };
  };

  matchers.toBeTruthy = function() {
    return {
      compare: function(actual) {
        return {
          pass: !!actual
        };
      }
    };
  };

  matchers.toBeUndefined = function() {
    return {
      compare: function(actual) {
        return {
          pass: void 0 === actual
        };
      }
    };
  };

  matchers.toEqual = function(util, customEqualityTesters) {
    customEqualityTesters = customEqualityTesters || [];

    return {
      compare: function(actual, expected) {
        var result = {
          pass: false
        };

        result.pass = util.equals(actual, expected, customEqualityTesters);

        return result;
      }
    };
  };

  matchers.toHaveBeenCalled = function() {
    return {
      compare: function(actual) {
        var result = {};

        if (!j$.isSpy(actual)) {
          throw new Error('Expected a spy, but got ' + j$.pp(actual) + '.');
        }

        if (arguments.length > 1) {
          throw new Error('toHaveBeenCalled does not take arguments, use toHaveBeenCalledWith');
        }

        result.pass = actual.wasCalled;

        result.message = result.pass ?
          "Expected spy " + actual.identity + " not to have been called." :
          "Expected spy " + actual.identity + " to have been called.";

        return result;
      }
    };
  };

  matchers.toHaveBeenCalledWith = function(util) {
    return {
      compare: function() {
        var args = Array.prototype.slice.call(arguments, 0),
          actual = args[0],
          expectedArgs = args.slice(1);

        if (!j$.isSpy(actual)) {
          throw new Error('Expected a spy, but got ' + j$.pp(actual) + '.');
        }

        return {
          pass: util.contains(actual.argsForCall, expectedArgs)
        };
      },
      message: function(actual) {
        return {
          affirmative: "Expected spy " + actual.identity + " to have been called.",
          negative: "Expected spy " + actual.identity + " not to have been called."
        };
      }
    };
  };

  matchers.toMatch = function() {
    return {
      compare: function(actual, expected) {
        var regexp = new RegExp(expected);

        return {
          pass: regexp.test(actual)
        };
      }
    };
  };

  matchers.toThrow = function() {
    return {
      compare: function(actual, expected) {
        var result = { pass: false },
          exception;

        if (typeof actual != "function") {
          throw new Error("Actual is not a Function");
        }

        if (expectedCannotBeTreatedAsException()) {
          throw new Error("Expected cannot be treated as an exception.");
        }

        try {
          actual();
        } catch (e) {
          exception = new Error(e);
        }

        if (!exception) {
          result.message = "Expected function to throw an exception.";
          return result;
        }

        if (void 0 == expected) {
          result.pass = true;
          result.message = "Expected function not to throw an exception.";
        } else if (exception.message == expected) {
          result.pass = true;
          result.message = "Expected function not to throw an exception \"" + expected + "\".";
        } else if (exception.message == expected.message) {
          result.pass = true;
          result.message = "Expected function not to throw an exception \"" + expected.message + "\".";
        } else if (expected instanceof RegExp) {
          if (expected.test(exception.message)) {
            result.pass = true;
            result.message = "Expected function not to throw an exception matching " + expected + ".";
          } else {
            result.pass = false;
            result.message = "Expected function to throw an exception matching " + expected + ".";
          }
        } else {
          result.pass = false;
          result.message = "Expected function to throw an exception \"" + (expected.message || expected) + "\".";
        }

        return result;

        function expectedCannotBeTreatedAsException() {
          return !(
            (void 0 == expected) ||
              (expected instanceof Error) ||
              (typeof expected == "string") ||
              (expected instanceof RegExp)
            );
        }
      }
    };
  };

  matchers.toContain = function(util, customEqualityTesters) {
    customEqualityTesters = customEqualityTesters || [];

    return {
      compare: function(actual, expected) {

        return {
          pass: util.contains(actual, expected, customEqualityTesters)
        };
      }
    };
  };

  return matchers;
};
