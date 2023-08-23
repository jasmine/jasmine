getJasmineRequireObj().nothing = function() {
  'use strict';

  /**
   * {@link expect} nothing explicitly.
   * @function
   * @name matchers#nothing
   * @since 2.8.0
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
