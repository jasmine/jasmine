getJasmineRequireObj().toBeRejectedWithError = function(j$) {
  /**
   * Expect a promise to be rejected with a value matched to the expected
   * @function
   * @async
   * @name async-matchers#toBeRejectedWithError
   * @since 3.5.0
   * @param {Error} [expected] - `Error` constructor the object that was thrown needs to be an instance of. If not provided, `Error` will be used.
   * @param {RegExp|String} [message] - The message that should be set on the thrown `Error`
   * @example
   * await expectAsync(aPromise).toBeRejectedWithError(MyCustomError, 'Error message');
   * await expectAsync(aPromise).toBeRejectedWithError(MyCustomError, /Error message/);
   * await expectAsync(aPromise).toBeRejectedWithError(MyCustomError);
   * await expectAsync(aPromise).toBeRejectedWithError('Error message');
   * return expectAsync(aPromise).toBeRejectedWithError(/Error message/);
   */
  return function toBeRejectedWithError() {
    return {
      compare: function(actualPromise, arg1, arg2) {
        var expected = getExpectedFromArgs(arg1, arg2);

        return actualPromise.then(
          function() {
            return {
              pass: false,
              message: 'Expected a promise to be rejected but it was resolved.'
            };
          },
          function(actualValue) { return matchError(actualValue, expected); }
        );
      }
    };
  };

  function matchError(actual, expected) {
    if (!j$.isError_(actual)) {
      return fail(expected, 'rejected with ' + j$.pp(actual));
    }

    if (!(actual instanceof expected.error)) {
      return fail(expected, 'rejected with type ' + j$.fnNameFor(actual.constructor));
    }

    var actualMessage = actual.message;

    if (actualMessage === expected.message || typeof expected.message === 'undefined') {
      return pass(expected);
    }

    if (expected.message instanceof RegExp && expected.message.test(actualMessage)) {
      return pass(expected);
    }

    return fail(expected, 'rejected with ' + j$.pp(actual));
  }

  function pass(expected) {
    return {
      pass: true,
      message: 'Expected a promise not to be rejected with ' + expected.printValue + ', but it was.'
    };
  }

  function fail(expected, message) {
    return {
      pass: false,
      message: 'Expected a promise to be rejected with ' + expected.printValue + ' but it was ' + message + '.'
    };
  }


  function getExpectedFromArgs(arg1, arg2) {
    var error, message;

    if (typeof arg1 === 'function' && j$.isError_(arg1.prototype)) {
      error = arg1;
      message = arg2;
    } else {
      error = Error;
      message = arg1;
    }

    return {
      error: error,
      message: message,
      printValue: j$.fnNameFor(error) + (typeof message === 'undefined' ? '' : ': ' + j$.pp(message))
    };
  }
};
