getJasmineRequireObj().toMatch = function(j$) {
  const getErrorMsg = j$.private.formatErrorMsg(
    '<toMatch>',
    'expect(<expectation>).toMatch(<string> || <regexp>)'
  );

  /**
   * {@link expect} the actual value to match a regular expression
   * @function
   * @name matchers#toMatch
   * @since 1.3.0
   * @param {RegExp|String} expected - Value to look for in the string.
   * @example
   * expect("my string").toMatch(/string$/);
   * expect("other string").toMatch("her");
   */
  function toMatch() {
    return {
      compare: function(actual, expected) {
        if (
          !j$.private.isString(expected) &&
          !j$.private.isA('RegExp', expected)
        ) {
          throw new Error(getErrorMsg('Expected is not a String or a RegExp'));
        }

        const regexp = new RegExp(expected);

        return {
          pass: regexp.test(actual)
        };
      }
    };
  }

  return toMatch;
};
