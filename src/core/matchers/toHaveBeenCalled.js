getJasmineRequireObj().toHaveBeenCalled = function(j$) {

  function toHaveBeenCalled(util) {
    return {
      compare: function(actual) {
        var result = {};

        var spyDelegate = util.spyLookup(actual);
        if (!spyDelegate) {
          throw new Error('Expected a spy, but got ' + j$.pp(actual) + '.');
        }

        if (arguments.length > 1) {
          throw new Error('toHaveBeenCalled does not take arguments, use toHaveBeenCalledWith');
        }

        result.pass = spyDelegate.wasCalled();

        result.message = result.pass ?
          "Expected spy " + spyDelegate.identity() + " not to have been called." :
          "Expected spy " + spyDelegate.identity() + " to have been called.";

        return result;
      }
    };
  }

  return toHaveBeenCalled;
};
