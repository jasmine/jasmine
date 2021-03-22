getJasmineRequireObj().toBeRejected = function(j$) {
  /**
   * Expect a promise to be rejected.
   * @function
   * @async
   * @name async-matchers#toBeRejected
   * @since 3.1.0
   * @example
   * await expectAsync(aPromise).toBeRejected();
   * @example
   * return expectAsync(aPromise).toBeRejected();
   */
  return function toBeRejected() {
    return {
      compare: function(actual) {
        if (!j$.isPromiseLike(actual)) {
          throw new Error('Expected toBeRejected to be called on a promise.');
        }
        return actual.then(
          function() {
            return { pass: false };
          },
          function() {
            return { pass: true };
          }
        );
      }
    };
  };
};
