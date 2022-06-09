getJasmineRequireObj().toBe = function(j$) {
  /**
   * {@link expect} the actual value to be `===` to the expected value.
   * @function
   * @name matchers#toBe
   * @since 1.3.0
   * @param {Object} expected - The expected value to compare against.
   * @example
   * expect(thing).toBe(realThing);
   */
  function toBe(matchersUtil) {
    const tip =
      ' Tip: To check for deep equality, use .toEqual() instead of .toBe().';

    return {
      compare: function(actual, expected) {
        const result = {
          pass: actual === expected
        };

        if (typeof expected === 'object') {
          result.message =
            matchersUtil.buildFailureMessage(
              'toBe',
              result.pass,
              actual,
              expected
            ) + tip;
        }

        return result;
      }
    };
  }

  return toBe;
};
