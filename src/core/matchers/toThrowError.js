getJasmineRequireObj().toThrowError = function(j$) {
  function toThrowError (util) {
    return {
      compare: function(actual) {
        var threw = false,
          thrown,
          errorType,
          message,
          regexp;

        if (typeof actual != "function") {
          throw new Error("Actual is not a Function");
        }

        extractExpectedParams.apply(null, arguments);

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

        if (arguments.length == 1) {
          return pass("Expected function not to throw an Error, but it threw " + thrown + ".");
        }

        if (errorType && message) {
          if (thrown.constructor == errorType && util.equals(thrown.message, message)) {
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
          if (arguments.length == 1) {
            return;
          }

          if (arguments.length == 2) {
            var expected = arguments[1];

            if (expected instanceof RegExp) {
              regexp = expected;
            } else if (typeof expected == "string") {
              message = expected;
            } else if (checkForAnErrorType(expected)) {
              errorType = expected;
            }

            if (!(errorType || message || regexp)) {
              throw new Error("Expected is not an Error, string, or RegExp.");
            }
          } else {
            if (checkForAnErrorType(arguments[1])) {
              errorType = arguments[1];
            } else {
              throw new Error("Expected error type is not an Error.");
            }

            if (arguments[2] instanceof RegExp) {
              regexp = arguments[2];
            } else if (typeof arguments[2] == "string") {
              message = arguments[2];
            } else {
              throw new Error("Expected error message is not a string or RegExp.");
            }
          }
        }

        function checkForAnErrorType(type) {
          if (typeof type !== "function") {
            return false;
          }

          var Surrogate = function() {};
          Surrogate.prototype = type.prototype;
          return (new Surrogate()) instanceof Error;
        }
      }
    };
  }

  return toThrowError;
};