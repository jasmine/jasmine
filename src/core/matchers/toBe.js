getJasmineRequireObj().toBe = function($j) {
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
        var customMessage = 'Expected ' + $j.pp(expected) + ' to be ' + $j.pp(actual) + '. Tip: To check for deep equality, use .toEqual() instead of .toBe().';
        
        return {
          pass: actual === expected,
          message: typeof expected === 'object' ? customMessage : undefined,
        };
      }
    };
  }

  return toBe;
};
