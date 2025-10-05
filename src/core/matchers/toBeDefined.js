getJasmineRequireObj().toBeDefined = function() {
  'use strict';

  /**
   * {@link expect} the actual value to be defined. (Not `undefined`)
   * @function
   * @name matchers#toBeDefined
   * @since 1.3.0
   * @example
   * expect(result).toBeDefined();
   */
  function toBeDefined() {
    return {
      compare: function(actual) {
        return {
          pass: void 0 !== actual
        };
      }
    };
  }

  return toBeDefined;
};
