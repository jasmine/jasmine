getJasmineRequireObj().toBeNegativeInfinity = function(j$) {
  /**
   * {@link expect} the actual value to be `-Infinity` (-infinity).
   * @function
   * @name matchers#toBeNegativeInfinity
   * @since 2.6.0
   * @example
   * expect(thing).toBeNegativeInfinity();
   */
  function toBeNegativeInfinity(matchersUtil) {
    return {
      compare: function(actual) {
        const result = {
          pass: actual === Number.NEGATIVE_INFINITY
        };

        if (result.pass) {
          result.message = 'Expected actual not to be -Infinity.';
        } else {
          result.message = function() {
            return 'Expected ' + matchersUtil.pp(actual) + ' to be -Infinity.';
          };
        }

        return result;
      }
    };
  }

  return toBeNegativeInfinity;
};
