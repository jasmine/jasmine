getJasmineRequireObj().toBeGreaterThan = function() {
  /**
   * {@link expect} the actual value to be greater than the expected value.
   * @function
   * @name matchers#toBeGreaterThan
   * @since 2.0.0
   * @param {Number} expected - The value to compare against.
   * @example
   * expect(result).toBeGreaterThan(3);
   */
  function toBeGreaterThan() {
    return {
      compare: function(actual, expected) {
        return {
          pass: actual > expected
        };
      }
    };
  }

  return toBeGreaterThan;
};
