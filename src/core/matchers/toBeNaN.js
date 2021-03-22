getJasmineRequireObj().toBeNaN = function(j$) {
  /**
   * {@link expect} the actual value to be `NaN` (Not a Number).
   * @function
   * @name matchers#toBeNaN
   * @since 1.3.0
   * @example
   * expect(thing).toBeNaN();
   */
  function toBeNaN(matchersUtil) {
    return {
      compare: function(actual) {
        var result = {
          pass: actual !== actual
        };

        if (result.pass) {
          result.message = 'Expected actual not to be NaN.';
        } else {
          result.message = function() {
            return 'Expected ' + matchersUtil.pp(actual) + ' to be NaN.';
          };
        }

        return result;
      }
    };
  }

  return toBeNaN;
};
