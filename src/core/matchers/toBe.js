getJasmineRequireObj().toBe = function(j$) {
  /**
   * {@link expect} the actual value to be `===` to the expected value.
   * @function
   * @name matchers#toBe
   * @param {Object} expected - The expected value to compare against.
   * @example
   * expect(thing).toBe(realThing);
   */
  function toBe(util) {
    var tip = ' Tip: To check for deep equality, use .toEqual() instead of .toBe().';

    return {
      compare: function(actual, expected) {
        var result = {
          pass: actual === expected,
        };

        if (typeof expected === 'object') {
          result.message = util.buildFailureMessage('toBe', result.pass, undefined, undefined, undefined, actual, expected) + tip;
        }

        return result;
      }
    };
  }

  return toBe;
};
