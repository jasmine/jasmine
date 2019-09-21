getJasmineRequireObj().toHaveClass = function(j$) {
  /**
   * {@link expect} the actual value to be a DOM element that has the expected class
   * @function
   * @name matchers#toHaveClass
   * @since 3.0.0
   * @param {Object} expected - The class name to test for
   * @example
   * var el = document.createElement('div');
   * el.className = 'foo bar baz';
   * expect(el).toHaveClass('bar');
   */
  function toHaveClass() {
    return {
      compare: function(actual, expected) {
        if (!isElement(actual)) {
          throw new Error(j$.pp(actual) + ' is not a DOM element');
        }

        return {
          pass: actual.classList.contains(expected)
        };
      }
    };
  }

  function isElement(maybeEl) {
    return maybeEl &&
      maybeEl.classList &&
      j$.isFunction_(maybeEl.classList.contains);
  }

  return toHaveClass;
};
