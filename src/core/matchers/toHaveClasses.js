getJasmineRequireObj().toHaveClasses = function(j$) {
  /**
   * {@link expect} the actual value to be a DOM element that has the expected classes
   * @function
   * @name matchers#toHaveClasses
   * @since 5.6.0
   * @param {Object} expected - The class names to test for
   * @example
   * const el = document.createElement('div');
   * el.className = 'foo bar baz';
   * expect(el).toHaveClasses(['bar', 'baz']);
   */
  function toHaveClasses(matchersUtil) {
    return {
      compare: function(actual, expected) {
        if (!isElement(actual)) {
          throw new Error(matchersUtil.pp(actual) + ' is not a DOM element');
        }

        return {
          pass: expected.every(e => actual.classList.contains(e))
        };
      }
    };
  }

  function isElement(maybeEl) {
    return (
      maybeEl && maybeEl.classList && j$.isFunction_(maybeEl.classList.contains)
    );
  }

  return toHaveClasses;
};
