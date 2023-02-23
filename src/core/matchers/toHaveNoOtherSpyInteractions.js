getJasmineRequireObj().toHaveNoOtherSpyInteractions = function(j$) {
  const getErrorMsg = j$.formatErrorMsg(
    '<toHaveNoOtherSpyInteractions>',
    'expect(<spyObj>).toHaveNoOtherSpyInteractions()'
  );

  /**
   * {@link expect} the actual (a {@link SpyObj}) spies to have not been called except interactions which was already tracked with `toHaveBeenCalled`.
   * @function
   * @name matchers#toHaveNoOtherSpyInteractions
   * @example
   * expect(mySpyObj).toHaveNoOtherSpyInteractions();
   * expect(mySpyObj).not.toHaveNoOtherSpyInteractions();
   */
  function toHaveNoOtherSpyInteractions(matchersUtil) {
    return {
      compare: function(actual) {
        const result = {};

        if (!j$.isObject_(actual)) {
          throw new Error(
            getErrorMsg('Expected a spy object, but got ' + typeof actual + '.')
          );
        }

        if (arguments.length > 1) {
          throw new Error(getErrorMsg('Does not take arguments'));
        }

        result.pass = true;
        let hasSpy = false;
        const calledSpies = [];
        for (const spy of Object.values(actual)) {
          if (!j$.isSpy(spy)) continue;
          hasSpy = true;

          if (spy.calls.any() && !spy.calls.getInteractionChecked()) {
            result.pass = false;
            calledSpies.push([spy.and.identity, spy.calls.count()]);
          }
        }

        if (!hasSpy) {
          throw new Error(
            getErrorMsg(
              'Expected a spy object with spies, but object has no spies.'
            )
          );
        }

        let resultMessage;
        if (!result.pass) {
          resultMessage =
            'Expected spy object spies to have not been called, ' +
            'but the following spies were called: ';
          resultMessage += calledSpies
            .map(([spyName, spyCount]) => {
              return `${spyName} called ${spyCount} time(s)`;
            })
            .join(', ');
        } else {
          resultMessage =
            'Expected spy object spies to have been called, ' +
            'but no spies were called.';
        }
        result.message = resultMessage;

        return result;
      }
    };
  }

  return toHaveNoOtherSpyInteractions;
};
