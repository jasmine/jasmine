getJasmineRequireObj().toHaveBeenCalledWith = function(j$) {

  var getErrorMsg = j$.formatErrorMsg('<toHaveBeenCalledWith>', 'expect(<spyObj>).toHaveBeenCalledWith(...arguments)');

  /**
   * {@link expect} the actual (a {@link Spy}) to have been called with particular arguments at least once.
   * @function
   * @name matchers#toHaveBeenCalledWith
   * @param {...Object} - The arguments to look for
   * @example
   * expect(mySpy).toHaveBeenCalledWith('foo', 'bar', 2);
   */
  function toHaveBeenCalledWith(util, customEqualityTesters) {
    return {
      compare: function() {
        var args = Array.prototype.slice.call(arguments, 0),
          actual = args[0],
          expectedArgs = args.slice(1),
          result = { pass: false };

        if (!j$.isSpy(actual)) {
          throw new Error(getErrorMsg('Expected a spy, but got ' + j$.pp(actual) + '.'));
        }

        if (!actual.calls.any()) {
          result.message = 'Expected spy ' + actual.and.identity + ' to have been called with ' + j$.pp(expectedArgs) + ' but it was never called.';
          return result;
        }

        if (util.contains(actual.calls.allArgs(), expectedArgs, customEqualityTesters)) {
          result.pass = true;
          result.message = 'Expected spy ' + actual.and.identity + ' to have been called with ' + j$.pp(expectedArgs);
        } else {
          result.message = 'Expected spy ' + actual.and.identity + ' to have been called with ' + j$.pp(expectedArgs) + ' but actual calls were ' + j$.pp(actual.calls.allArgs()).replace(/^\[ | \]$/g, '') + '.';
        }

        return result;
      }
    };
  }

  return toHaveBeenCalledWith;
};
