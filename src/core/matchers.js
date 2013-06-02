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

  matchers.toThrow = function(util) {
    return {
      compare: function(actual, expected) {
        var result = { pass: false },
          threw = false,
          thrown;

        if (typeof actual != "function") {
          throw new Error("Actual is not a Function");
        }

        try {
          actual();
        } catch (e) {
          threw = true;
          thrown = e;
        }

        if (!threw) {
          result.message = "Expected function to throw an exception.";
          return result;
        }

        if (expected == void 0) {
          result.pass = true;
          result.message = "Expected function not to throw.";

          return result;
        }

        if (util.equals(thrown, expected)) {
          result.pass = true;
          result.message = "Expected function not to throw " + j$.pp(expected) + ".";
        } else {
          result.message = "Expected function to throw " + j$.pp(expected) + ".";
        }

        return result;
      }
    };
  };

  matchers.toThrowError = function(util) {
    return {
      compare: function(actual, expected) {
        var threw = false,
          thrown,
          errorType,
          message,
          regexp;

        if (typeof actual != "function") {
          throw new Error("Actual is not a Function");
        }

        extractExpectedParams();

        try {
          actual();
        } catch (e) {
          threw = true;
          thrown = e;
        }

        if (!threw) {
          return fail("Expected function to throw an Error.");
        }

        if (!(thrown instanceof Error)) {
          return fail("Expected function to throw an Error, but it threw " + thrown + ".");
        }

        if (expected == void 0) {
          return pass("Expected function not to throw an Error, but it threw " + thrown + ".");
        }

        if (errorType && message) {
          if (util.equals(thrown, new errorType(message))) {
            return pass("Expected function not to throw Error with message \"" + message + "\".");
          } else {
            return fail("Expected function to throw Error with message \"" + message + "\".");
          }
        }

        if (errorType && regexp) {
          if (thrown.constructor == errorType && regexp.test(thrown.message)) {
            return pass("Expected function not to throw Error with message matching " + regexp + ".");
          } else {
            return fail("Expected function to throw Error with message matching " + regexp + ".");
          }
        }

        if (errorType) {
          if (thrown.constructor == errorType) {
            return pass("Expected function not to throw " + errorType.name + ".");
          } else {
            return fail("Expected function to throw " + errorType.name + ".");
          }
        }

        if (message) {
          if (thrown.message == message) {
            return pass("Expected function not to throw an execption with message " + j$.pp(message) + ".");
          } else {
            return fail("Expected function to throw an execption with message " + j$.pp(message) + ".");
          }
        }

        if (regexp) {
          if (regexp.test(thrown.message)) {
            return pass("Expected function not to throw an execption with a message matching " + j$.pp(regexp) + ".");
          } else {
            return fail("Expected function to throw an execption with a message matching " + j$.pp(regexp) + ".");
          }
        }

        function pass(notMessage) {
          return {
            pass: true,
            message: notMessage
          };
        }

        function fail(message) {
          return {
            pass: false,
            message: message
          };
        }

        function extractExpectedParams() {
          if (expected == void 0) {
            return;
          }

          if (expected instanceof RegExp) {
            regexp = expected;
          } else if (typeof expected == "string") {
            message = expected;
          } else if (typeof expected == "function" && new expected() instanceof Error) {
            errorType = expected;
          } else if (expected.length) {
            if (typeof expected[0] == "function" && new expected[0]() instanceof Error) {
              errorType = expected[0];
            }
            if (expected[1] instanceof RegExp) {
              regexp = expected[1];
            } else if (typeof expected[1] == "string") {
              message = expected[1];
            }
          }

          if (!(errorType || message || regexp)) {
            throw new Error("Expected is not an Error, message, or RegExp.");
          }
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
