getJasmineRequireObj().toThrowError = function(j$) {

  var getErrorMsg =  j$.formatErrorMsg('<toThrowError>', 'expect(function() {<expectation>}).toThrowError(<ErrorConstructor>, <message>)');

  /**
   * {@link expect} a function to `throw` an `Error`.
   * @function
   * @name matchers#toThrowError
   * @param {Error} [expected] - `Error` constructor the object that was thrown needs to be an instance of. If not provided, `Error` will be used.
   * @param {RegExp|String} [message] - The message that should be set on the thrown `Error`
   * @example
   * expect(function() { return 'things'; }).toThrowError(MyCustomError, 'message');
   * expect(function() { return 'things'; }).toThrowError(MyCustomError, /bar/);
   * expect(function() { return 'stuff'; }).toThrowError(MyCustomError);
   * expect(function() { return 'other'; }).toThrowError(/foo/);
   * expect(function() { return 'other'; }).toThrowError();
   */
  function toThrowError () {
    return {
      compare: function(actual) {
        var threw = false,
          pass = {pass: true},
          fail = {pass: false},
          thrown;

        if (typeof actual != 'function') {
          throw new Error(getErrorMsg('Actual is not a Function'));
        }

        var errorMatcher = getMatcher.apply(null, arguments);

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

        // Get Error constructor of thrown
        if (!isErrorObject(thrown)) {
          fail.message = function() { return 'Expected function to throw an Error, but it threw ' + j$.pp(thrown) + '.'; };
          return fail;
        }

        if (errorMatcher.hasNoSpecifics()) {
          pass.message = 'Expected function not to throw an Error, but it threw ' + j$.fnNameFor(thrown) + '.';
          return pass;
        }

        if (errorMatcher.matches(thrown)) {
          pass.message = function() {
            return 'Expected function not to throw ' + errorMatcher.errorTypeDescription + errorMatcher.messageDescription() + '.';
          };
          return pass;
        } else {
          fail.message = function() {
            return 'Expected function to throw ' + errorMatcher.errorTypeDescription + errorMatcher.messageDescription() +
              ', but it threw ' + errorMatcher.thrownDescription(thrown) + '.';
          };
          return fail;
        }
      }
    };

    function getMatcher() {
      var expected = null,
          errorType = null;
	    if (arguments.length == 1) {
		    errorType = Error;
	    } else if (arguments.length == 2) {
        expected = arguments[1];
        if (isAnErrorType(expected)) {
          errorType = expected;
          expected = null;
        }
      } else if (arguments.length > 2) {
        errorType = arguments[1];
        expected = arguments[2];
        if (!isAnErrorType(errorType)) {
          throw new Error(getErrorMsg('Expected error type is not an Error.'));
        }
      }

      if (expected && !isStringOrRegExp(expected)) {
        if (errorType) {
          throw new Error(getErrorMsg('Expected error message is not a string or RegExp.'));
        } else {
          throw new Error(getErrorMsg('Expected is not an Error, string, or RegExp.'));
        }
      }

      function messageMatch(message) {
        if (typeof expected == 'string') {
          return expected == message;
        } else {
          return expected.test(message);
        }
      }

      return {
        errorTypeDescription: errorType ? j$.fnNameFor(errorType) : 'an exception',
        thrownDescription: function(thrown) {
          var thrownName = errorType ? j$.fnNameFor(thrown.constructor) : 'an exception',
              thrownMessage = '';

          if (expected) {
            thrownMessage = ' with message ' + j$.pp(thrown.message);
          }

          return thrownName + thrownMessage;
        },
        messageDescription: function() {
          if (expected === null) {
            return '';
          } else if (expected instanceof RegExp) {
            return ' with a message matching ' + j$.pp(expected);
          } else {
            return ' with message ' + j$.pp(expected);
          }
        },
        hasNoSpecifics: function() {
          return expected === null && errorType === null;
        },
        matches: function(error) {
          return (errorType === null || error instanceof errorType) &&
            (expected === null || messageMatch(error.message));
        }
      };
    }

    function isStringOrRegExp(potential) {
      return potential instanceof RegExp || (typeof potential == 'string');
    }

    function isAnErrorType(type) {
      if (typeof type !== 'function') {
        return false;
      }

      var Surrogate = function() {};
      Surrogate.prototype = type.prototype;
      return isErrorObject(new Surrogate());
    }

    function isErrorObject(thrown) {
      if (thrown instanceof Error) {
        return true;
      }
      if (thrown && thrown.constructor && thrown.constructor.constructor &&
          (thrown instanceof (thrown.constructor.constructor('return this')()).Error)) {
        return true;
      }
      return false;
    }
  }

  return toThrowError;
};
