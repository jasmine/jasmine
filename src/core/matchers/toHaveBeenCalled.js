getJasmineRequireObj().toHaveBeenCalled = function(j$) {
  'use strict';

  const getErrorMsg = j$.formatErrorMsg(
    '<toHaveBeenCalled>',
    'expect(<spyObj>).toHaveBeenCalled()'
  );

  /**
   * {@link expect} the actual (a {@link Spy}) to have been called.
   * @function
   * @name matchers#toHaveBeenCalled
   * @since 1.3.0
   * @example
   * expect(mySpy).toHaveBeenCalled();
   * expect(mySpy).not.toHaveBeenCalled();
   */
  function toHaveBeenCalled(matchersUtil) {
    return {
      compare: function(actual) {
        const result = {};

        if (!j$.isSpy(actual)) {
          throw new Error(
            getErrorMsg(
              'Expected a spy, but got ' + matchersUtil.pp(actual) + '.'
            )
          );
        }

        if (arguments.length > 1) {
          throw new Error(
            getErrorMsg('Does not take arguments, use toHaveBeenCalledWith')
          );
        }

        result.pass = actual.calls.any();

        result.message = result.pass
          ? 'Expected spy ' + actual.and.identity + ' not to have been called.'
          : 'Expected spy ' + actual.and.identity + ' to have been called.';

        return result;
      }
    };
  }

  return toHaveBeenCalled;
};
