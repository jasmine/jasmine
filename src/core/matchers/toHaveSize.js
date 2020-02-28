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
          diffBuilder = j$.DiffBuilder({prettyPrinter: matchersUtil.pp});

        // Avoid misleading collections size matching
        if (actual instanceof WeakSet
          || actual instanceof WeakMap
          || actual instanceof DataView)
          throw new Error('Cannot get size of ' + actual + '.');

        // Ref https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects
        if (Array.isArray(actual))
          result.pass = matchersUtil.equals(actual.length, expected, diffBuilder);
        else if ( actual instanceof String || typeof actual === 'string')
          result.pass =  matchersUtil.equals(actual.length, expected, diffBuilder);
        else if (actual.constructor.name === 'BigInt64Array'
          || actual.constructor.name === 'BigUint64Array'
          || actual.constructor.name === 'Float32Array'
          || actual.constructor.name === 'Float64Array'
          || actual.constructor.name === 'Int8Array'
          || actual.constructor.name === 'Int16Array'
          || actual.constructor.name === 'Int32Array'
          || actual.constructor.name === 'Uint8Array'
          || actual.constructor.name === 'Uint8ClampedArray'
          || actual.constructor.name === 'Uint16Array'
          || actual.constructor.name === 'Uint32Array')
          result.pass =  matchersUtil.equals(actual.length, expected, diffBuilder);
        else if (actual instanceof Set || actual instanceof Map)
          result.pass = matchersUtil.equals(actual.size, expected, diffBuilder);
        // instanceof Object
        else
          result.pass = matchersUtil.equals(Object.keys(actual).length, expected, diffBuilder);

        if(!result.pass)
          result.message = diffBuilder.getMessage() ;
        return result;
      }
    };
  }

  return toHaveSize;
};
