getJasmineRequireObj().toBeFalse = function() {
  /**
   * {@link expect} the actual value to be `false`.
   * @function
   * @name matchers#toBeFalse
   * @since 3.5.0
   * @example
   * expect(result).toBeFalse();
   */
  function toBeFalse() {
    return {
      compare: function(actual) {
        return {
          pass: actual === false
        };
      }
    };
  }

  return toBeFalse;
};
