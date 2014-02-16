getJasmineRequireObj().toThrowError = function(j$) {
  function toThrowError (util) {
    return {
      compare: function(actual) {
        var threw = false,
          pass = {pass: true},
          fail = {pass: false},
          thrown,
          errorType,
          message,
          regexp,
          name,
          constructorName;

        if (typeof actual != 'function') {
          throw new Error('Actual is not a Function');
        }

        extractExpectedParams.apply(null, arguments);

        try {
          actual();
        } catch (e) {
          threw = true;
          thrown = e;
        }

        if (!threw) {
          fail.message = 'Expected function to throw an Error.';
          return fail;
        }

        if (!(thrown instanceof Error)) {
          fail.message = function() { return 'Expected function to throw an Error, but it threw ' + j$.pp(thrown) + '.'; };
          return fail;
        }

        if (arguments.length == 1) {
          pass.message = 'Expected function not to throw an Error, but it threw ' + fnNameFor(thrown) + '.';
          return pass;
        }

        if (errorType) {
          name = fnNameFor(errorType);
          constructorName = fnNameFor(thrown.constructor);
        }

        if (errorType && message) {
          if (thrown.constructor == errorType && util.equals(thrown.message, message)) {
            pass.message = function() { return 'Expected function not to throw ' + name + ' with message ' + j$.pp(message) + '.'; };
            return pass;
          } else {
            fail.message = function() { return 'Expected function to throw ' + name + ' with message ' + j$.pp(message) +
              ', but it threw ' + constructorName + ' with message ' + j$.pp(thrown.message) + '.'; };
            return fail;
          }
        }

        if (errorType && regexp) {
          if (thrown.constructor == errorType && regexp.test(thrown.message)) {
            pass.message = function() { return 'Expected function not to throw ' + name + ' with message matching ' + j$.pp(regexp) + '.'; };
            return pass;
          } else {
            fail.message = function() { return 'Expected function to throw ' + name + ' with message matching ' + j$.pp(regexp) +
              ', but it threw ' + constructorName + ' with message ' + j$.pp(thrown.message) + '.'; };
            return fail;
          }
        }

        if (errorType) {
          if (thrown.constructor == errorType) {
            pass.message = 'Expected function not to throw ' + name + '.';
            return pass;
          } else {
            fail.message = 'Expected function to throw ' + name + ', but it threw ' + constructorName + '.';
            return fail;
          }
        }

        if (message) {
          if (thrown.message == message) {
            pass.message = function() { return 'Expected function not to throw an exception with message ' + j$.pp(message) + '.'; };
            return pass;
          } else {
            fail.message = function() { return 'Expected function to throw an exception with message ' + j$.pp(message) +
              ', but it threw an exception with message ' + j$.pp(thrown.message) + '.'; };
            return fail;
          }
        }

        if (regexp) {
          if (regexp.test(thrown.message)) {
            pass.message = function() { return 'Expected function not to throw an exception with a message matching ' + j$.pp(regexp) + '.'; };
            return pass;
          } else {
            fail.message = function() { return 'Expected function to throw an exception with a message matching ' + j$.pp(regexp) +
              ', but it threw an exception with message ' + j$.pp(thrown.message) + '.'; };
            return fail;
          }
        }

        function fnNameFor(func) {
            return func.name || func.toString().match(/^\s*function\s*(\w*)\s*\(/)[1];
        }

        function extractExpectedParams() {
          if (arguments.length == 1) {
            return;
          }

          if (arguments.length == 2) {
            var expected = arguments[1];

            if (expected instanceof RegExp) {
              regexp = expected;
            } else if (typeof expected == 'string') {
              message = expected;
            } else if (checkForAnErrorType(expected)) {
              errorType = expected;
            }

            if (!(errorType || message || regexp)) {
              throw new Error('Expected is not an Error, string, or RegExp.');
            }
          } else {
            if (checkForAnErrorType(arguments[1])) {
              errorType = arguments[1];
            } else {
              throw new Error('Expected error type is not an Error.');
            }

            if (arguments[2] instanceof RegExp) {
              regexp = arguments[2];
            } else if (typeof arguments[2] == 'string') {
              message = arguments[2];
            } else {
              throw new Error('Expected error message is not a string or RegExp.');
            }
          }
        }

        function checkForAnErrorType(type) {
          if (typeof type !== 'function') {
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
