getJasmineRequireObj().toHaveSize = function(j$) {
  /**
   * {@link expect} the actual size to be equal to the expected, using array-like length or object keys size.
   * @function
   * @name matchers#toHaveSize
   * @since 3.5.1
   * @param {Object} expected - Expected size
   * @example
   * array = [1,2];
   * expect(array).toHaveSize(2);
   */
  function toHaveSize(matchersUtil) {
    return {
      compare: function(actual, expected) {
        var result = {
            pass: false
          },
          simpleEqualityTesters = [function(a, b) {
            return a == b;
          }],
          diffBuilder = j$.DiffBuilder();

        // Avoid misleading collections size matching
        if (actual instanceof WeakSet
          || actual instanceof WeakMap
          || actual instanceof DataView) {
          result.message = 'Cannot get size of ' + actual + '.';
          return result;
        }

        // Ref https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects
        if (Array.isArray(actual) || isArrayLike(actual))
          result.pass = matchersUtil.equals(actual.length, expected, simpleEqualityTesters, diffBuilder);
        else if ( actual instanceof String || typeof actual === 'string')
          result.pass =  matchersUtil.equals(actual.length, expected, simpleEqualityTesters, diffBuilder);
        else if (actual instanceof Set || actual instanceof Map)
          result.pass = matchersUtil.equals(actual.size, expected, simpleEqualityTesters, diffBuilder);
        // instanceof Object
        else
          result.pass = matchersUtil.equals(Object.keys(actual).length, expected, simpleEqualityTesters,  diffBuilder);

        if(!result.pass)
          result.message = diffBuilder.getMessage() ;
        return result;
      }
    };
  }

  /**
   * Checks if `value` is array-like. A value is considered array-like if it's
   * not a function and has a `value.length` that's an integer greater than or
   * equal to `0` and less than or equal to `Number.MAX_SAFE_INTEGER`.
   * From lodash
   * @param {*} value The value to check.
   * @returns {boolean} Returns `true` if `value` is array-like, else `false`.
   * @example
   * _.isArrayLike([1, 2, 3]);
   * // => true
   * _.isArrayLike(document.body.children);
   * // => true
   * _.isArrayLike('abc');
   * // => true
   * _.isArrayLike(_.noop);
   * // => false
   */
  function isArrayLike(value) {
    return value != null && isLength(value.length) && !isFunction(value);
  }
  var MAX_SAFE_INTEGER = 9007199254740991;
  function isLength(value) {
    return (typeof value == 'number') && value > -1 && value % 1 == 0 && value <= MAX_SAFE_INTEGER;
  }
  var functionTags = ['[object Function]','[object GeneratorFunction]','[object AsyncFunction]','[object Proxy]'];
  function isFunction(functionToCheck) {
    return functionToCheck && functionTags.indexOf( Object.prototype.toString.call(functionToCheck) ) != -1;
  }

  return toHaveSize;
};
