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
            getErrorMsg('Expected an object, but got ' + typeof actual + '.')
          );
        }

        if (arguments.length > 1) {
          throw new Error(getErrorMsg('Does not take arguments'));
        }

        result.pass = true;
        let hasSpy = false;
        const unexpectedCalls = [];

        for (const spy of Object.values(actual)) {
          if (!j$.isSpy(spy)) {
            continue;
          }

          hasSpy = true;

          const unverifiedCalls = spy.calls
            .all()
            .filter(call => !call.verified);

          if (unverifiedCalls.length > 0) {
            result.pass = false;
          }

          unverifiedCalls.forEach(unverifiedCall => {
            unexpectedCalls.push([
              spy.and.identity,
              matchersUtil.pp(unverifiedCall.args)
            ]);
          });
        }

        if (!hasSpy) {
          throw new Error(
            getErrorMsg(
              'Expected an object with spies, but object has no spies.'
            )
          );
        }

        if (result.pass) {
          result.message =
            "Expected a spy object to have other spy interactions but it didn't.";
        } else {
          const ppUnexpectedCalls = unexpectedCalls
            .map(
              ([spyName, arguments]) => `  ${spyName} called with ${arguments}`
            )
            .join(',\n');

          result.message =
            'Expected a spy object to have no other spy interactions, but it had the following calls:\n' +
            ppUnexpectedCalls +
            '.';
        }

        return result;
      }
    };
  }

  return toHaveNoOtherSpyInteractions;
};
