getJasmineRequireObj().toEqual = function(j$) {
  'use strict';

  /**
   * {@link expect} the actual value to be equal to the expected, using deep equality comparison.
   * @function
   * @name matchers#toEqual
   * @since 1.3.0
   * @param {Object} expected - Expected value
   * @example
   * expect(bigObject).toEqual({"foo": ['bar', 'baz']});
   */
  function toEqual(matchersUtil) {
    return {
      compare: function(actual, expected) {
        const result = {
            pass: false
          },
          diffBuilder = new j$.DiffBuilder({ prettyPrinter: matchersUtil.pp });

        result.pass = matchersUtil.equals(actual, expected, diffBuilder);
        result.message = diffBuilder.getMessage();

        return result;
      }
    };
  }

  return toEqual;
};
