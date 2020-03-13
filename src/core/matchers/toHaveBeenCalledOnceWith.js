getJasmineRequireObj().toHaveBeenCalledOnceWith = function (j$) {

  var getErrorMsg = j$.formatErrorMsg('<toHaveBeenCalledOnceWith>', 'expect(<spyObj>).toHaveBeenCalledOnceWith(...arguments)');

  /**
   * {@link expect} the actual (a {@link Spy}) to have been called exactly once, and exactly with the particular arguments.
   * @function
   * @name matchers#toHaveBeenCalledOnceWith
   * @since 3.6.0
   * @param {...Object} - The arguments to look for
   * @example
   * expect(mySpy).toHaveBeenCalledOnceWith('foo', 'bar', 2);
   */
  function toHaveBeenCalledOnceWith(util, customEqualityTesters) {
    return {
      compare: function () {
        var args = Array.prototype.slice.call(arguments, 0),
          actual = args[0],
          expectedArgs = args.slice(1);

        if (!j$.isSpy(actual)) {
          throw new Error(getErrorMsg('Expected a spy, but got ' + j$.pp(actual) + '.'));
        }

        var prettyPrintedCalls = actual.calls.allArgs().map(function (argsForCall) {
          return '  ' + j$.pp(argsForCall);
        });

        if (actual.calls.count() === 1 && util.contains(actual.calls.allArgs(), expectedArgs, customEqualityTesters)) {
          return {
            pass: true,
            message: 'Expected spy ' + actual.and.identity + ' to have been called 0 times, multiple times, or once, but with arguments different from:\n'
              + '  ' + j$.pp(expectedArgs) + '\n'
              + 'But the actual call was:\n'
              + prettyPrintedCalls.join(',\n') + '.\n\n'
          };
        }

        function butString() {
          return actual.calls.count() !== 0
            ? 'But the actual calls were:\n' + prettyPrintedCalls.join(',\n') + '.\n\n'
            : 'But it was never called.\n\n';
        }

        return {
          pass: false,
          message: 'Expected spy ' + actual.and.identity + ' to have been called only once, and with given args:\n'
            + '  ' + j$.pp(expectedArgs) + '\n'
            + butString()
        };
      }
    };
  }

  return toHaveBeenCalledOnceWith;
};
