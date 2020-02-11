getJasmineRequireObj().toBeResolved = function(j$) {
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
  return function toBeResolved() {
    return {
      compare: function(actual) {
        if (!j$.isPromiseLike(actual)) {
          throw new Error('Expected toBeResolved to be called on a promise.');
        }

        return actual.then(
          function() { return {pass: true}; },
          function() { return {pass: false}; }
        );
      }
    };
  };
};
