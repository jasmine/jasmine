getJasmineRequireObj().toBePositiveInfinity = function(j$) {
  /**
   * {@link expect} the actual value to be `Infinity` (infinity).
   * @function
   * @name matchers#toBePositiveInfinity
   * @example
   * expect(thing).toBePositiveInfinity();
   */
  function toBePositiveInfinity() {
    return {
      compare: function(actual) {
        var result = {
          pass: (actual === Number.POSITIVE_INFINITY)
        };

        result.message = function() {return 'Expected ' + j$.pp(actual) + ' to be Infinity.';};
        return result;
      }
    };
  }

  return toBePositiveInfinity;
};
