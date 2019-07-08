getJasmineRequireObj().toBeRejectedWith = function(j$) {
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
  return function toBeRejectedWith(util, customEqualityTesters) {
    return {
      compare: function(actualPromise, expectedValue) {
        if (!j$.isPromiseLike(actualPromise)) {
          throw new Error('Expected toBeRejectedWith to be called on a promise.');
        }

        function prefix(passed) {
          return 'Expected a promise ' +
            (passed ? 'not ' : '') +
            'to be rejected with ' + j$.pp(expectedValue);
        }

        return actualPromise.then(
          function() {
          return {
            pass: false,
            message: prefix(false) + ' but it was resolved.'
          };
        },
        function(actualValue) {
          if (util.equals(actualValue, expectedValue, customEqualityTesters)) {
            return {
              pass: true,
              message: prefix(true) + '.'
            };
          } else {
            return {
              pass: false,
              message: prefix(false) + ' but it was rejected with ' + j$.pp(actualValue) + '.'
            };
          }
        }
        );
      }
    };
  };
};
