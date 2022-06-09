getJasmineRequireObj().toThrowError = function(j$) {
  const getErrorMsg = j$.formatErrorMsg(
    '<toThrowError>',
    'expect(function() {<expectation>}).toThrowError(<ErrorConstructor>, <message>)'
  );

  /**
   * {@link expect} a function to `throw` an `Error`.
   * @function
   * @name matchers#toThrowError
   * @since 2.0.0
   * @param {Error} [expected] - `Error` constructor the object that was thrown needs to be an instance of. If not provided, `Error` will be used.
   * @param {RegExp|String} [message] - The message that should be set on the thrown `Error`
   * @example
   * expect(function() { return 'things'; }).toThrowError(MyCustomError, 'message');
   * expect(function() { return 'things'; }).toThrowError(MyCustomError, /bar/);
   * expect(function() { return 'stuff'; }).toThrowError(MyCustomError);
   * expect(function() { return 'other'; }).toThrowError(/foo/);
   * expect(function() { return 'other'; }).toThrowError();
   */
  function toThrowError(matchersUtil) {
    return {
      compare: function(actual) {
        const errorMatcher = getMatcher.apply(null, arguments);

        if (typeof actual != 'function') {
          throw new Error(getErrorMsg('Actual is not a Function'));
        }

        let thrown;

        try {
          actual();
          return fail('Expected function to throw an Error.');
        } catch (e) {
          thrown = e;
        }

        if (!j$.isError_(thrown)) {
          return fail(function() {
            return (
              'Expected function to throw an Error, but it threw ' +
              matchersUtil.pp(thrown) +
              '.'
            );
          });
        }

        return errorMatcher.match(thrown);
      }
    };

    function getMatcher() {
      let expected, errorType;

      if (arguments[2]) {
        errorType = arguments[1];
        expected = arguments[2];
        if (!isAnErrorType(errorType)) {
          throw new Error(getErrorMsg('Expected error type is not an Error.'));
        }

        return exactMatcher(expected, errorType);
      } else if (arguments[1]) {
        expected = arguments[1];

        if (isAnErrorType(arguments[1])) {
          return exactMatcher(null, arguments[1]);
        } else {
          return exactMatcher(arguments[1], null);
        }
      } else {
        return anyMatcher();
      }
    }

    function anyMatcher() {
      return {
        match: function(error) {
          return pass(
            'Expected function not to throw an Error, but it threw ' +
              j$.fnNameFor(error) +
              '.'
          );
        }
      };
    }

    function exactMatcher(expected, errorType) {
      if (expected && !isStringOrRegExp(expected)) {
        if (errorType) {
          throw new Error(
            getErrorMsg('Expected error message is not a string or RegExp.')
          );
        } else {
          throw new Error(
            getErrorMsg('Expected is not an Error, string, or RegExp.')
          );
        }
      }

      function messageMatch(message) {
        if (typeof expected == 'string') {
          return expected == message;
        } else {
          return expected.test(message);
        }
      }

      const errorTypeDescription = errorType
        ? j$.fnNameFor(errorType)
        : 'an exception';

      function thrownDescription(thrown) {
        const thrownName = errorType
          ? j$.fnNameFor(thrown.constructor)
          : 'an exception';
        let thrownMessage = '';

        if (expected) {
          thrownMessage = ' with message ' + matchersUtil.pp(thrown.message);
        }

        return thrownName + thrownMessage;
      }

      function messageDescription() {
        if (expected === null) {
          return '';
        } else if (expected instanceof RegExp) {
          return ' with a message matching ' + matchersUtil.pp(expected);
        } else {
          return ' with message ' + matchersUtil.pp(expected);
        }
      }

      function matches(error) {
        return (
          (errorType === null || error instanceof errorType) &&
          (expected === null || messageMatch(error.message))
        );
      }

      return {
        match: function(thrown) {
          if (matches(thrown)) {
            return pass(function() {
              return (
                'Expected function not to throw ' +
                errorTypeDescription +
                messageDescription() +
                '.'
              );
            });
          } else {
            return fail(function() {
              return (
                'Expected function to throw ' +
                errorTypeDescription +
                messageDescription() +
                ', but it threw ' +
                thrownDescription(thrown) +
                '.'
              );
            });
          }
        }
      };
    }

    function isStringOrRegExp(potential) {
      return potential instanceof RegExp || typeof potential == 'string';
    }

    function isAnErrorType(type) {
      if (typeof type !== 'function') {
        return false;
      }

      const Surrogate = function() {};
      Surrogate.prototype = type.prototype;
      return j$.isError_(new Surrogate());
    }
  }

  function pass(message) {
    return {
      pass: true,
      message: message
    };
  }

  function fail(message) {
    return {
      pass: false,
      message: message
    };
  }

  return toThrowError;
};
