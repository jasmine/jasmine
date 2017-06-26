getJasmineRequireObj().toBeCloseTo = function() {
  /**
   * {@link expect} the actual value to be within a specified precision of the expected value.
   * @function
   * @name matchers#toBeCloseTo
   * @param {Object} expected - The expected value to compare against.
   * @param {Number} [precision=2] - The number of decimal points to check.
   * @example
   * expect(number).toBeCloseTo(42.2, 3);
   */
  function toBeCloseTo() {
    return {
      compare: function(actual, expected, precision) {
        if (precision !== 0) {
          precision = precision || 2;
        }

        if (expected === null || actual === null) {
          throw new Error('Cannot use toBeCloseTo with null. Arguments evaluated to: ' +
            'expect(' + actual + ').toBeCloseTo(' + expected + ').'
          );
        }

        var pow = Math.pow(10, precision + 1);
        return {
          pass: +(Math.round(Math.abs(expected - actual) * pow) / pow).toFixed(precision + 1) <= (Math.pow(10, -precision) / 2)
        };
      }
    };
  }

  return toBeCloseTo;
};
