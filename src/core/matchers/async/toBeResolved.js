getJasmineRequireObj().toBeResolved = function(j$) {
  'use strict';

  /**
   * Expect a promise to be resolved.
   * @function
   * @async
   * @name async-matchers#toBeResolved
   * @since 3.1.0
   * @example
   * await expectAsync(aPromise).toBeResolved();
   * @example
   * return expectAsync(aPromise).toBeResolved();
   */
  return function toBeResolved(matchersUtil) {
    return {
      compare: function(actual) {
        if (!j$.private.isPromiseLike(actual)) {
          throw new Error(
            `Expected toBeResolved to be called on a promise but was on a ${typeof actual}.`
          );
        }

        return actual.then(
          function() {
            return { pass: true };
          },
          function(e) {
            return {
              pass: false,
              message:
                'Expected a promise to be resolved but it was ' +
                'rejected with ' +
                matchersUtil.pp(e) +
                '.'
            };
          }
        );
      }
    };
  };
};
