getJasmineRequireObj().toBePositiveInfinity = function(j$) {
  /**
   * {@link expect} the actual value to be `Infinity` (infinity).
   * @function
   * @name matchers#toBePositiveInfinity
   * @since 2.6.0
   * @example
   * expect(thing).toBePositiveInfinity();
   */
  function toBePositiveInfinity() {
    return {
      compare: function(actual) {
        var result = {
          pass: (actual === Number.POSITIVE_INFINITY)
        };

        if (result.pass) {
          result.message = 'Expected actual not to be Infinity.';
        } else {
          result.message = function() { return 'Expected ' + j$.pp(actual) + ' to be Infinity.'; };
        }

        return result;
      }
    };
  }

  return toBePositiveInfinity;
};
