getJasmineRequireObj().toHaveBeenCalledWith = function(j$) {

  function toHaveBeenCalledWith(util) {
    return {
      compare: function() {
        var args = Array.prototype.slice.call(arguments, 0),
          actual = args[0],
          expectedArgs = args.slice(1),
            result = {};

        var spyDelegate = util.spyLookup(actual);
        if (!spyDelegate) {
          throw new Error('Expected a spy, but got ' + j$.pp(actual) + '.');
        }

        result.pass = util.contains(spyDelegate.calls(), expectedArgs);
        result.message = result.pass ?
          "Expected spy " + spyDelegate.identity() +  " not to have been called." :
          "Expected spy " + spyDelegate.identity() +  " to have been called.";

        return result;
      }
    };
  }

  return toHaveBeenCalledWith;
};
