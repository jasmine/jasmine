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
        const unexpectedCallsIn = [];

        for (const spy of Object.values(actual)) {
          if (!j$.isSpy(spy)) {
            continue;
          }

          hasSpy = true;

          if (!spy.calls.all().every(call => call.verified)) {
            unexpectedCallsIn.push([
              spy.and.identity,
              spy.calls.unverifiedCount()
            ]);

            result.pass = false;
          }
        }

        if (!hasSpy) {
          throw new Error(
            getErrorMsg(
              'Expected an object with spies, but object has no spies.'
            )
          );
        }

        result.message = result.pass
          ? "Spies' calls are all verified."
          : "Unverified spies' calls have been found in: " +
            unexpectedCallsIn
              .map(
                ([spyName, unverifiedCount]) =>
                  `${spyName} (${unverifiedCount} unverified call(s))`
              )
              .join(', ');

        return result;
      }
    };
  }

  return toHaveNoOtherSpyInteractions;
};
