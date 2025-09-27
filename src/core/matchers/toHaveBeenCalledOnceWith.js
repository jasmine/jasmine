getJasmineRequireObj().toHaveBeenCalledOnceWith = function(j$) {
  const getErrorMsg = j$.private.formatErrorMsg(
    '<toHaveBeenCalledOnceWith>',
    'expect(<spyObj>).toHaveBeenCalledOnceWith(...arguments)'
  );

  /**
   * {@link expect} the actual (a {@link Spy}) to have been called exactly once, and exactly with the particular arguments.
   * @function
   * @name matchers#toHaveBeenCalledOnceWith
   * @since 3.6.0
   * @param {...Object} - The arguments to look for
   * @example
   * expect(mySpy).toHaveBeenCalledOnceWith('foo', 'bar', 2);
   */
  function toHaveBeenCalledOnceWith(matchersUtil) {
    return {
      compare: function() {
        const args = Array.prototype.slice.call(arguments, 0),
          actual = args[0],
          expectedArgs = args.slice(1);

        if (!j$.isSpy(actual)) {
          throw new Error(
            getErrorMsg(
              'Expected a spy, but got ' + matchersUtil.pp(actual) + '.'
            )
          );
        }

        const prettyPrintedCalls = actual.calls
          .allArgs()
          .map(function(argsForCall) {
            return '  ' + matchersUtil.pp(argsForCall);
          });

        if (
          actual.calls.count() === 1 &&
          matchersUtil.contains(actual.calls.allArgs(), expectedArgs)
        ) {
          const firstIndex = actual.calls
            .all()
            .findIndex(call => matchersUtil.equals(call.args, expectedArgs));
          if (firstIndex > -1) {
            actual.calls.all()[firstIndex].verified = true;
          }

          return {
            pass: true,
            message:
              'Expected spy ' +
              actual.and.identity +
              ' to have been called 0 times, multiple times, or once, but with arguments different from:\n' +
              '  ' +
              matchersUtil.pp(expectedArgs) +
              '\n' +
              'But the actual call was:\n' +
              prettyPrintedCalls.join(',\n') +
              '.\n\n'
          };
        }

        function getDiffs() {
          return actual.calls.allArgs().map(function(argsForCall, callIx) {
            const diffBuilder = new j$.private.DiffBuilder();
            matchersUtil.equals(argsForCall, expectedArgs, diffBuilder);
            return diffBuilder.getMessage();
          });
        }

        function butString() {
          switch (actual.calls.count()) {
            case 0:
              return 'But it was never called.\n\n';
            case 1:
              return (
                'But the actual call was:\n' +
                prettyPrintedCalls.join(',\n') +
                '.\n' +
                getDiffs().join('\n') +
                '\n\n'
              );
            default:
              return (
                'But the actual calls were:\n' +
                prettyPrintedCalls.join(',\n') +
                '.\n\n'
              );
          }
        }

        return {
          pass: false,
          message:
            'Expected spy ' +
            actual.and.identity +
            ' to have been called only once, and with given args:\n' +
            '  ' +
            matchersUtil.pp(expectedArgs) +
            '\n' +
            butString()
        };
      }
    };
  }

  return toHaveBeenCalledOnceWith;
};
