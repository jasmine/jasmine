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
  return function toBeResolved(util) {
    return {
      compare: function(actual) {
        return actual.then(
          function() { return {pass: false}; },
          function() { return {pass: true}; }
        );
      }
    };
  };
};
