getJasmineRequireObj().toMatch = function(j$) {

  var getErrorMsg = j$.formatErrorMsg('<toMatch>', 'expect(<expectation>).toMatch(<string> || <regexp>)');

  /**
   * {@link expect} the actual value to match a regular expression
   * @function
   * @name matchers#toMatch
   * @param {RegExp|String} expected - Value to look for in the string.
   * @example
   * expect("my string").toMatch(/string$/);
   * expect("other string").toMatch("her");
   */
  function toMatch() {
    return {
      compare: function(actual, expected) {
        if (!j$.isString_(expected) && !j$.isA_('RegExp', expected)) {
          throw new Error(getErrorMsg('Expected is not a String or a RegExp'));
        }

        var regexp = new RegExp(expected);

        return {
          pass: regexp.test(actual)
        };
      }
    };
  }

  return toMatch;
};
