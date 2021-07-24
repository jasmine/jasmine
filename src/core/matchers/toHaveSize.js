getJasmineRequireObj().toHaveSize = function(j$) {
  /**
   * {@link expect} the actual size to be equal to the expected, using array-like length or object keys size.
   * @function
   * @name matchers#toHaveSize
   * @since 3.6.0
   * @param {Object} expected - Expected size
   * @example
   * array = [1,2];
   * expect(array).toHaveSize(2);
   */
  function toHaveSize() {
    return {
      compare: function(actual, expected) {
        var result = {
          pass: false
        };

        if (
          j$.isA_('WeakSet', actual) ||
          j$.isWeakMap(actual) ||
          j$.isDataView(actual)
        ) {
          throw new Error('Cannot get size of ' + actual + '.');
        }

        if (j$.isSet(actual) || j$.isMap(actual)) {
          result.pass = actual.size === expected;
        } else if (isLength(actual.length)) {
          result.pass = actual.length === expected;
        } else {
          result.pass = Object.keys(actual).length === expected;
        }

        return result;
      }
    };
  }

  var MAX_SAFE_INTEGER = Number.MAX_SAFE_INTEGER || 9007199254740991;
  function isLength(value) {
    return (
      typeof value == 'number' &&
      value > -1 &&
      value % 1 === 0 &&
      value <= MAX_SAFE_INTEGER
    );
  }

  return toHaveSize;
};
