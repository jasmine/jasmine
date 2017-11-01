getJasmineRequireObj().toHaveLength = function(j$) {

  var getErrorMsg = j$.formatErrorMsg('<toHaveLength>', 'expect(<string> || <array>).toHaveLength(<number>)');

  /**
   * {@link expect} the length of actual value to be equal to the expected, using strict equality comparison.
   * @function
   * @name matchers#toHaveLength
   * @param {Array|String} expected - Expected length
   * @example
   * expect(['foo', 'bar', 'baz']).toHaveLength(3);
   */
  function toHaveLength(util, customEqualityTesters) {
    return {
      compare: function(actual, expected) {
        if (!j$.isString_(actual) && !j$.isArray_(actual)) {
          throw new Error(getErrorMsg('Expected is not a String or an Array'));
        }
        return {
          pass: actual.length === expected
        };
      }
    };
  }

  return toHaveLength;
};
