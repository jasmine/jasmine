getJasmineRequireObj().toMatch = function(j$) {

  var getErrorMsg = j$.formatErrorMsg('<toMatch>', 'expect(<expectation>).toMatch(<string> || <regexp>)');

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
