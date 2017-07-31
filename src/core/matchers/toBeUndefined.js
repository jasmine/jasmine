getJasmineRequireObj().toBeUndefined = function() {
  /**
   * {@link expect} the actual value to be `undefined`.
   * @function
   * @name matchers#toBeUndefined
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
