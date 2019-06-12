getJasmineRequireObj().toBeNull = function() {
  /**
   * {@link expect} the actual value to be `null`.
   * @function
   * @name matchers#toBeNull
   * @since 1.3.0
   * @example
   * expect(result).toBeNull();
   */
  function toBeNull() {
    return {
      compare: function(actual) {
        return {
          pass: actual === null
        };
      }
    };
  }

  return toBeNull;
};
