getJasmineRequireObj().toHaveSize = function(j$) {
  'use strict';

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
  function toHaveSize(matchersUtil) {
    return {
      compare: function(actual, expected) {
        const result = {
          pass: false
        };

        if (
          j$.private.isA('WeakSet', actual) ||
          j$.private.isWeakMap(actual) ||
          j$.private.isDataView(actual)
        ) {
          throw new Error('Cannot get size of ' + actual + '.');
        }

        let actualSize;
        if (j$.private.isSet(actual) || j$.private.isMap(actual)) {
          actualSize = actual.size;
        } else if (isLength(actual.length)) {
          actualSize = actual.length;
        } else {
          actualSize = Object.keys(actual).length;
        }

        result.pass = actualSize === expected;

        if (!result.pass) {
          result.message = function() {
            return (
              'Expected ' +
              matchersUtil.pp(actual) +
              ' with size ' +
              actualSize +
              ' to have size ' +
              expected +
              '.'
            );
          };
        }

        return result;
      }
    };
  }

  const MAX_SAFE_INTEGER = Number.MAX_SAFE_INTEGER || 9007199254740991;
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
