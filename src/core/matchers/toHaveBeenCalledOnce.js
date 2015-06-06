getJasmineRequireObj().toHaveBeenCalledOnce = function(j$) {

  function toHaveBeenCalledOnce() {
    return {
      compare: function(actual) {
        var result = {};

        if (!j$.isSpy(actual)) {
          throw new Error('Expected a spy, but got ' + j$.pp(actual) + '.');
        }

        if (arguments.length > 1) {
          throw new Error('toHaveBeenCalledOnce does not take arguments, use toHaveBeenCalledTimes.');
        }
        
        var calls = actual.calls.count();
        result.pass = calls === 1;
        result.message = result.pass ?
          'Expected spy ' + actual.and.identity() + ' to have been called only once. It was called ' +  calls + ' times.'
          : 'Expected spy ' + actual.and.identity() + ' to have been called only once. It was called ' +  calls + ' times.';
        return result;
      }
    };
  }

  return toHaveBeenCalledOnce;
};
