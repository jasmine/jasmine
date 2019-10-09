getJasmineRequireObj().toThrow = function(j$) {

  var getErrorMsg = j$.formatErrorMsg('<toThrow>', 'expect(function() {<expectation>}).toThrow()');

  /**
   * {@link expect} a function to `throw` something.
   * @function
   * @name matchers#toThrow
   * @since 2.0.0
   * @param {Object} [expected] - Value that should be thrown. If not provided, simply the fact that something was thrown will be checked.
   * @example
   * expect(function() { return 'things'; }).toThrow('foo');
   * expect(function() { return 'stuff'; }).toThrow();
   */
  function toThrow(matchersUtil) {
    return {
      compare: function(actual, expected) {
        var result = { pass: false },
          threw = false,
          thrown;

        if (typeof actual != 'function') {
          throw new Error(getErrorMsg('Actual is not a Function'));
        }

        try {
          actual();
        } catch (e) {
          threw = true;
          thrown = e;
        }

        if (!threw) {
          result.message = 'Expected function to throw an exception.';
          return result;
        }

        if (arguments.length == 1) {
          result.pass = true;
          result.message = function() { return 'Expected function not to throw, but it threw ' + matchersUtil.pp(thrown) + '.'; };

          return result;
        }

        if (matchersUtil.equals(thrown, expected)) {
          result.pass = true;
          result.message = function() { return 'Expected function not to throw ' + matchersUtil.pp(expected) + '.'; };
        } else {
          result.message = function() { return 'Expected function to throw ' + matchersUtil.pp(expected) + ', but it threw ' +  matchersUtil.pp(thrown) + '.'; };
        }

        return result;
      }
    };
  }

  return toThrow;
};
