getJasmineRequireObj().toHaveClass = function(j$) {
  'use strict';

  /**
   * {@link expect} the actual value to be a DOM element that has the expected class
   * @function
   * @name matchers#toHaveClass
   * @since 3.0.0
   * @param {Object} expected - The class name to test for
   * @example
   * const el = document.createElement('div');
   * el.className = 'foo bar baz';
   * expect(el).toHaveClass('bar');
   */
  function toHaveClass(matchersUtil) {
    return {
      compare: function(actual, expected) {
        if (!isElement(actual)) {
          throw new Error(matchersUtil.pp(actual) + ' is not a DOM element');
        }

        return {
          pass: actual.classList.contains(expected)
        };
      }
    };
  }

  function isElement(maybeEl) {
    return (
      maybeEl &&
      maybeEl.classList &&
      j$.private.isFunction(maybeEl.classList.contains)
    );
  }

  return toHaveClass;
};
