getJasmineRequireObj().toBeUndefined = function() {
  'use strict';

  /**
   * {@link expect} the actual value to be `undefined`.
   * @function
   * @name matchers#toBeUndefined
   * @since 1.3.0
   * @example
   * expect(result).toBeUndefined():
   */
  function toBeUndefined() {
    return {
      compare: function(actual) {
        return {
          pass: void 0 === actual
        };
      }
    };
  }

  return toBeUndefined;
};
