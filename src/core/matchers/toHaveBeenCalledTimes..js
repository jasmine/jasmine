getJasmineRequireObj().toHaveBeenCalledTimes = function(j$) {

  function toHaveBeenCalledTimes() {
    return {
      compare: function(actual) {
        if (!j$.isSpy(actual)) {
          throw new Error('Expected a spy, but got ' + j$.pp(actual) + '.');
        }
        
        var args = Array.prototype.slice.call(arguments, 0),
          expectedCalls = args.slice(1),
          result = { pass: false };
          
        if(!expectedCalls){
          throw new Error('Expected times failed is required as an argument.');
        }
        
        actual = args[0];
        var calls = actual.calls.count();
        result.pass = calls === expectedCalls;
        result.message = result.pass ?
          'Expected spy ' + actual.and.identity() + ' to have been called ' + expectedCalls + ' times. It was called ' +  calls + ' times.'
          : 'Expected spy ' + actual.and.identity() + ' to have been called  ' + expectedCalls + ' times. It was called ' +  calls + ' times.';
        return result;
      }
    };
  }

  return toHaveBeenCalledTimes;
};
