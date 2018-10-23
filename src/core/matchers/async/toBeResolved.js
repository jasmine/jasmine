getJasmineRequireObj().toBeResolved = function(j$) {
  /**
   * Expect a promise to be resolved.
   * @function
   * @async
   * @name async-matchers#toBeResolved
   * @example
   * await expectAsync(aPromise).toBeResolved();
   * @example
   * return expectAsync(aPromise).toBeResolved();
   */
  return function toBeResolved(util) {
    return {
      compare: function(actual) {
        return actual.then(
          function() { return {pass: true}; },
          function() { return {pass: false}; }
        );
      }
    };
  };
};
