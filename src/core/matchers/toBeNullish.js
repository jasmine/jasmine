getJasmineRequireObj().toBeNullish = function() {
  /**
   * {@link expect} the actual value to be `null` or `undefined`.
   * @function
   * @name matchers#toBeNullish
   * @since 5.6.0
   * @example
   * expect(result).toBeNullish():
   */
  function toBeNullish() {
    return {
      compare: function(actual) {
        return {
          pass: null === actual || void 0 === actual
        };
      }
    };
  }

  return toBeNullish;
};
