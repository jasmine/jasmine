getJasmineRequireObj().toBeTruthy = function() {
  /**
   * {@link expect} the actual value to be truthy.
   * @function
   * @name matchers#toBeTruthy
   * @since 2.0.0
   * @example
   * expect(thing).toBeTruthy();
   */
  function toBeTruthy() {
    return {
      compare: function(actual) {
        return {
          pass: !!actual
        };
      }
    };
  }

  return toBeTruthy;
};
