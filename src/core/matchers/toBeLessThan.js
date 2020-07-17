getJasmineRequireObj().toBeLessThan = function() {
  /**
   * {@link expect} the actual value to be less than the expected value.
   * @function
   * @name matchers#toBeLessThan
   * @since 2.0.0
   * @param {Number} expected - The expected value to compare against.
   * @example
   * expect(result).toBeLessThan(0);
   */
  function toBeLessThan() {
    return {
      compare: function(actual, expected) {
        return {
          pass: actual < expected
        };
      }
    };
  }

  return toBeLessThan;
};
