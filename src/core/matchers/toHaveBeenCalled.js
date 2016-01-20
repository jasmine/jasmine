getJasmineRequireObj().toHaveBeenCalled = function(j$) {

  var getErrorMsg = j$.formatErrorMsg('<toHaveBeenCalled>', 'expect(<spyObj>).toHaveBeenCalled()', 'To test with arguments, you can use <toHaveBeenCalledWith>');

  function toHaveBeenCalled() {
    return {
      compare: function(actual) {
        var result = {};

        if (!j$.isSpy(actual)) {
          throw new Error(getErrorMsg('Expected a spy, but got ' + j$.pp(actual) + '.'));
        }

        if (arguments.length > 1) {
          throw new Error(getErrorMsg('It does not take arguments, use toHaveBeenCalledWith'));
        }

        result.pass = actual.calls.any();

        result.message = result.pass ?
          'Expected spy ' + actual.and.identity() + ' not to have been called.' :
          'Expected spy ' + actual.and.identity() + ' to have been called.';

        return result;
      }
    };
  }

  return toHaveBeenCalled;
};
