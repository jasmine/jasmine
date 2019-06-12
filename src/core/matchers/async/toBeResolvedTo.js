getJasmineRequireObj().toBeResolvedTo = function(j$) {
  /**
   * Expect a promise to be resolved to a value equal to the expected, using deep equality comparison.
   * @function
   * @async
   * @name async-matchers#toBeResolvedTo
   * @since 3.1.0
   * @param {Object} expected - Value that the promise is expected to resolve to
   * @example
   * await expectAsync(aPromise).toBeResolvedTo({prop: 'value'});
   * @example
   * return expectAsync(aPromise).toBeResolvedTo({prop: 'value'});
   */
  return function toBeResolvedTo(util, customEqualityTesters) {
    return {
      compare: function(actualPromise, expectedValue) {
        function prefix(passed) {
          return 'Expected a promise ' +
            (passed ? 'not ' : '') +
            'to be resolved to ' + j$.pp(expectedValue);
        }

        return actualPromise.then(
          function(actualValue) {
          if (util.equals(actualValue, expectedValue, customEqualityTesters)) {
            return {
              pass: true,
              message: prefix(true) + '.'
            };
          } else {
            return {
              pass: false,
              message: prefix(false) + ' but it was resolved to ' + j$.pp(actualValue) + '.'
            };
          }
        },
        function() {
          return {
            pass: false,
            message: prefix(false) + ' but it was rejected.'
          };
        }
        );
      }
    };
  };
};
