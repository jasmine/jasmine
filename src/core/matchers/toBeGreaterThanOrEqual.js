getJasmineRequireObj().toBeGreaterThanOrEqual = function() {
  /**
   * {@link expect} the actual value to be greater than or equal to the expected value.
   * @function
   * @name matchers#toBeGreaterThanOrEqual
   * @param {Number} expected - The expected value to compare against.
   * @example
   * expect(result).toBeGreaterThanOrEqual(25);
   */
  function toBeGreaterThanOrEqual() {
    return {
      compare: function(actual, expected) {
        return {
          pass: actual >= expected
        };
      }
    };
  }

  return toBeGreaterThanOrEqual;
};
