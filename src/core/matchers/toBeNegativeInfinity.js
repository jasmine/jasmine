getJasmineRequireObj().toBeNegativeInfinity = function(j$) {
  /**
   * {@link expect} the actual value to be `-Infinity` (-infinity).
   * @function
   * @name matchers#toBeNegativeInfinity
   * @example
   * expect(thing).toBeNegativeInfinity();
   */
  function toBeNegativeInfinity() {
    return {
      compare: function(actual) {
        var result = {
          pass: (actual === Number.NEGATIVE_INFINITY)
        };

        if (result.pass) {
          result.message = 'Expected actual to be -Infinity.';
        } else {
          result.message = function() { return 'Expected ' + j$.pp(actual) + ' not to be -Infinity.'; };
        }

        return result;
      }
    };
  }

  return toBeNegativeInfinity;
};
