getJasmineRequireObj().toBeLessThanOrEqual = function() {
  'use strict';

  /**
   * {@link expect} the actual value to be less than or equal to the expected value.
   * @function
   * @name matchers#toBeLessThanOrEqual
   * @since 2.0.0
   * @param {Number} expected - The expected value to compare against.
   * @example
   * expect(result).toBeLessThanOrEqual(123);
   */
  function toBeLessThanOrEqual() {
    return {
      compare: function(actual, expected) {
        return {
          pass: actual <= expected
        };
      }
    };
  }

  return toBeLessThanOrEqual;
};
