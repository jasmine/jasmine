getJasmineRequireObj().toHaveBeenCalledTimes = function(j$) {

  function toHaveBeenCalledTimes() {
    return {
      compare: function(actual, expected) {
        if (!j$.isSpy(actual)) {
          throw new Error('Expected a spy, but got ' + j$.pp(actual) + '.');
        }

        var args = Array.prototype.slice.call(arguments, 0),
          result = { pass: false };

        if(!expected){
          throw new Error('Expected times failed is required as an argument.');
        }

        actual = args[0];
        var calls = actual.calls.count();
        var timesMessage = expected === 1 ? 'once' : expected + ' times';
        result.pass = calls === expected;
        result.message = result.pass ?
          'Expected spy ' + actual.and.identity() + ' not to have been called ' + timesMessage + '. It was called ' +  calls + ' times.' :
          'Expected spy ' + actual.and.identity() + ' to have been called ' + timesMessage + '. It was called ' +  calls + ' times.';
        return result;
      }
    };
  }

  return toHaveBeenCalledTimes;
};
