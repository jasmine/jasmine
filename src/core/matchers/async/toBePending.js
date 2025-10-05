getJasmineRequireObj().toBePending = function(j$) {
  'use strict';

  /**
   * Expect a promise to be pending, i.e. the promise is neither resolved nor rejected.
   * @function
   * @async
   * @name async-matchers#toBePending
   * @since 3.6
   * @example
   * await expectAsync(aPromise).toBePending();
   */
  return function toBePending() {
    return {
      compare: function(actual) {
        if (!j$.private.isPromiseLike(actual)) {
          throw new Error(
            `Expected toBePending to be called on a promise but was on a ${typeof actual}.`
          );
        }
        const want = {};
        return Promise.race([actual, Promise.resolve(want)]).then(
          function(got) {
            return { pass: want === got };
          },
          function() {
            return { pass: false };
          }
        );
      }
    };
  };
};
