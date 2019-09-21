getJasmineRequireObj().toContain = function() {
  /**
   * {@link expect} the actual value to contain a specific value.
   * @function
   * @name matchers#toContain
   * @since 2.0.0
   * @param {Object} expected - The value to look for.
   * @example
   * expect(array).toContain(anElement);
   * expect(string).toContain(substring);
   */
  function toContain(util) {
    return {
      compare: function(actual, expected) {

        return {
          pass: util.contains(actual, expected)
        };
      }
    };
  }

  return toContain;
};
