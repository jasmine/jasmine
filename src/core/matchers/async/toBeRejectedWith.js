getJasmineRequireObj().toBeRejectedWith = function(j$) {
  'use strict';

  /**
   * Expect a promise to be rejected with a value equal to the expected, using deep equality comparison.
   * @function
   * @async
   * @name async-matchers#toBeRejectedWith
   * @since 3.3.0
   * @param {Object} expected - Value that the promise is expected to be rejected with
   * @example
   * await expectAsync(aPromise).toBeRejectedWith({prop: 'value'});
   * @example
   * return expectAsync(aPromise).toBeRejectedWith({prop: 'value'});
   */
  return function toBeRejectedWith(matchersUtil) {
    return {
      compare: function(actualPromise, expectedValue) {
        if (!j$.private.isPromiseLike(actualPromise)) {
          throw new Error(
            `Expected toBeRejectedWith to be called on a promise but was on a ${typeof actualPromise}.`
          );
        }

        function prefix(passed) {
          return (
            'Expected a promise ' +
            (passed ? 'not ' : '') +
            'to be rejected with ' +
            matchersUtil.pp(expectedValue)
          );
        }

        return actualPromise.then(
          function() {
            return {
              pass: false,
              message: prefix(false) + ' but it was resolved.'
            };
          },
          function(actualValue) {
            if (matchersUtil.equals(actualValue, expectedValue)) {
              return {
                pass: true,
                message: prefix(true) + '.'
              };
            } else {
              return {
                pass: false,
                message:
                  prefix(false) +
                  ' but it was rejected with ' +
                  matchersUtil.pp(actualValue) +
                  '.'
              };
            }
          }
        );
      }
    };
  };
};
