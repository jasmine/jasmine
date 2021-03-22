getJasmineRequireObj().toBeFalsy = function() {
  /**
   * {@link expect} the actual value to be falsy
   * @function
   * @name matchers#toBeFalsy
   * @since 2.0.0
   * @example
   * expect(result).toBeFalsy();
   */
  function toBeFalsy() {
    return {
      compare: function(actual) {
        return {
          pass: !actual
        };
      }
    };
  }

  return toBeFalsy;
};
