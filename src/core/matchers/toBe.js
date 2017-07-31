getJasmineRequireObj().toBe = function() {
  /**
   * {@link expect} the actual value to be `===` to the expected value.
   * @function
   * @name matchers#toBe
   * @param {Object} expected - The expected value to compare against.
   * @example
   * expect(thing).toBe(realThing);
   */
  function toBe() {
    return {
      compare: function(actual, expected) {
        return {
          pass: actual === expected
        };
      }
    };
  }

  return toBe;
};
