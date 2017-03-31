getJasmineRequireObj().toEqual = function(j$) {
  /**
   * {@link expect} the actual value to be equal to the expected, using deep equality comparison.
   * @function
   * @name matchers#toEqual
   * @param {Object} expected - Expected value
   * @example
   * expect(bigObject).toEqual({"foo": ['bar', 'baz']});
   */
  function toEqual(util, customEqualityTesters) {
    customEqualityTesters = customEqualityTesters || [];

    return {
      compare: function(actual, expected) {
        var diffBuilder = j$.DiffBuilder();

        var result = {
            pass: util.equals(actual, expected, customEqualityTesters, diffBuilder)
        };

        if (!result.pass) {
          result.message = diffBuilder.getMessage();
        }

        return result;
      }
    };
  }

  return toEqual;
};
