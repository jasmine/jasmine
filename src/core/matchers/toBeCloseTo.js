getJasmineRequireObj().toBeCloseTo = function() {
  /**
   * {@link expect} the actual value to be within a specified precision of the expected value.
   * @function
   * @name matchers#toBeCloseTo
   * @since 1.3.0
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
          throw new Error(
            'Cannot use toBeCloseTo with null. Arguments evaluated to: ' +
              'expect(' +
              actual +
              ').toBeCloseTo(' +
              expected +
              ').'
          );
        }

        // Infinity is close to Infinity and -Infinity is close to -Infinity,
        // regardless of the precision.
        if (expected === Infinity || expected === -Infinity) {
          return {
            pass: actual === expected
          };
        }

        var pow = Math.pow(10, precision + 1);
        var delta = Math.abs(expected - actual);
        var maxDelta = Math.pow(10, -precision) / 2;

        return {
          pass: Math.round(delta * pow) <= maxDelta * pow
        };
      }
    };
  }

  return toBeCloseTo;
};
