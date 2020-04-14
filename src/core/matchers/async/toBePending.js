getJasmineRequireObj().toBePending = function(j$) {
  /**
   * Expect a promise to be pending, ie. the promise is neither resolved nor rejected.
   * @function
   * @async
   * @name async-matchers#toBePending
   * @since 3.5.1 (should this be the next version or the version when it was added?)
   * @example
   * await expectAsync(aPromise).toBePending();
   */
  return function toBePending() {
    return {
      compare: function(actual) {
        if (!j$.isPromiseLike(actual)) {
          throw new Error('Expected toBePending to be called on a promise.');
        }
        var want = {};
        return Promise.race([actual, Promise.resolve(want)]).then(
          function(got) { return {pass: want === got}; },
          function() { return {pass: false}; }
        );
      }
    };
  };
};
