getJasmineRequireObj().toBePositiveInfinity = function(j$) {
  'use strict';

  /**
   * {@link expect} the actual value to be `Infinity` (infinity).
   * @function
   * @name matchers#toBePositiveInfinity
   * @since 2.6.0
   * @example
   * expect(thing).toBePositiveInfinity();
   */
  function toBePositiveInfinity(matchersUtil) {
    return {
      compare: function(actual) {
        const result = {
          pass: actual === Number.POSITIVE_INFINITY
        };

        if (result.pass) {
          result.message = 'Expected actual not to be Infinity.';
        } else {
          result.message = function() {
            return 'Expected ' + matchersUtil.pp(actual) + ' to be Infinity.';
          };
        }

        return result;
      }
    };
  }

  return toBePositiveInfinity;
};
