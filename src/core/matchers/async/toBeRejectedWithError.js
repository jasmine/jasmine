getJasmineRequireObj().toBeRejectedWithError = function(j$) {
  'use strict';

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
  return function toBeRejectedWithError(matchersUtil) {
    return {
      compare: function(actualPromise, arg1, arg2) {
        if (!j$.isPromiseLike(actualPromise)) {
          throw new Error(
            'Expected toBeRejectedWithError to be called on a promise.'
          );
        }

        const expected = getExpectedFromArgs(arg1, arg2, matchersUtil);

        return actualPromise.then(
          function() {
            return {
              pass: false,
              message: 'Expected a promise to be rejected but it was resolved.'
            };
          },
          function(actualValue) {
            return matchError(actualValue, expected, matchersUtil);
          }
        );
      }
    };
  };

  function matchError(actual, expected, matchersUtil) {
    if (!j$.isError_(actual)) {
      return fail(expected, 'rejected with ' + matchersUtil.pp(actual));
    }

    if (!(actual instanceof expected.error)) {
      return fail(
        expected,
        'rejected with type ' + j$.fnNameFor(actual.constructor)
      );
    }

    const actualMessage = actual.message;

    if (
      actualMessage === expected.message ||
      typeof expected.message === 'undefined'
    ) {
      return pass(expected);
    }

    if (
      expected.message instanceof RegExp &&
      expected.message.test(actualMessage)
    ) {
      return pass(expected);
    }

    return fail(expected, 'rejected with ' + matchersUtil.pp(actual));
  }

  function pass(expected) {
    return {
      pass: true,
      message:
        'Expected a promise not to be rejected with ' +
        expected.printValue +
        ', but it was.'
    };
  }

  function fail(expected, message) {
    return {
      pass: false,
      message:
        'Expected a promise to be rejected with ' +
        expected.printValue +
        ' but it was ' +
        message +
        '.'
    };
  }

  function getExpectedFromArgs(arg1, arg2, matchersUtil) {
    let error, message;

    if (isErrorConstructor(arg1)) {
      error = arg1;
      message = arg2;
    } else {
      error = Error;
      message = arg1;
    }

    return {
      error: error,
      message: message,
      printValue:
        j$.fnNameFor(error) +
        (typeof message === 'undefined' ? '' : ': ' + matchersUtil.pp(message))
    };
  }

  function isErrorConstructor(value) {
    return (
      typeof value === 'function' &&
      (value === Error || j$.isError_(value.prototype))
    );
  }
};
