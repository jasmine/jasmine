getJasmineRequireObj().nothing = function() {
  /**
   * {@link expect} nothing explicitly.
   * @function
   * @name matchers#nothing
   * @example
   * expect().nothing();
   */
  function nothing() {
    return {
      compare: function() {
        return {
          pass: true
        };
      }
    };
  }

  return nothing;
};
