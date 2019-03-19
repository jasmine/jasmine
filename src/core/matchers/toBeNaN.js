getJasmineRequireObj().toBeNaN = function(j$) {
  /**
   * {@link expect} the actual value to be `NaN` (Not a Number).
   * @function
   * @name matchers#toBeNaN
   * @example
   * expect(thing).toBeNaN();
   */
  function toBeNaN() {
    return {
      compare: function(actual) {
        var result = {
          pass: (actual !== actual)
        };

        result.message = function() {return 'Expected ' + j$.pp(actual) + ' to be NaN.';};
        
        return result;
      }
    };
  }

  return toBeNaN;
};
