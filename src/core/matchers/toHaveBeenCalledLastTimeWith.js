getJasmineRequireObj().toHaveBeenCalledLastTimeWith = function(j$) {

  function toHaveBeenCalledLastTimeWith(util, customEqualityTesters) {
    return {
      compare: function() {
        var args = Array.prototype.slice.call(arguments, 0),
          actual = args[0],
          expectedArgs = args.slice(1),
          result = { pass: false },
          lastCallArgs;

        if (!j$.isSpy(actual)) {
          throw new Error('Expected a spy, but got ' + j$.pp(actual) + '.');
        }

        if (!actual.calls.any()) {
          result.message = function() { return 'Expected spy ' + actual.and.identity() + ' to have been called last time with ' + j$.pp(expectedArgs) + ' but it was never called.'; };
          return result;
        }

        lastCallArgs = actual.calls.argsFor(actual.calls.count() - 1);
        if (util.equals(lastCallArgs, expectedArgs, customEqualityTesters)) {
          result.pass = true;
          result.message = function() { return 'Expected spy ' + actual.and.identity() + ' not to have been called last time with ' + j$.pp(expectedArgs) + ' but it was.'; };
        } else {
          result.message = function() { return 'Expected spy ' + actual.and.identity() + ' to have been called last time with ' + j$.pp(expectedArgs) + ' but actual call was ' + j$.pp(lastCallArgs) + '.'; };
        }

        return result;
      }
    };
  }

  return toHaveBeenCalledLastTimeWith;
};
