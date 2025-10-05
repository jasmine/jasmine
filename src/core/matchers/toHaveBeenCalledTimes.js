getJasmineRequireObj().toHaveBeenCalledTimes = function(j$) {
  'use strict';

  const getErrorMsg = j$.private.formatErrorMsg(
    '<toHaveBeenCalledTimes>',
    'expect(<spyObj>).toHaveBeenCalledTimes(<Number>)'
  );

  /**
   * {@link expect} the actual (a {@link Spy}) to have been called the specified number of times.
   * @function
   * @name matchers#toHaveBeenCalledTimes
   * @since 2.4.0
   * @param {Number} expected - The number of invocations to look for.
   * @example
   * expect(mySpy).toHaveBeenCalledTimes(3);
   */
  function toHaveBeenCalledTimes(matchersUtil) {
    return {
      compare: function(actual, expected) {
        if (!j$.isSpy(actual)) {
          throw new Error(
            getErrorMsg(
              'Expected a spy, but got ' + matchersUtil.pp(actual) + '.'
            )
          );
        }

        const args = Array.prototype.slice.call(arguments, 0),
          result = { pass: false };

        if (!j$.private.isNumber(expected)) {
          throw new Error(
            getErrorMsg(
              'The expected times failed is a required argument and must be a number.'
            )
          );
        }

        actual = args[0];

        const callsCount = actual.calls.count();
        const timesMessage = expected === 1 ? 'once' : expected + ' times';

        result.pass = callsCount === expected;

        if (result.pass) {
          const allCalls = actual.calls.all();
          const max = Math.min(expected, callsCount);

          for (let i = 0; i < max; i++) {
            allCalls[i].verified = true;
          }
        }

        result.message = result.pass
          ? 'Expected spy ' +
            actual.and.identity +
            ' not to have been called ' +
            timesMessage +
            '. It was called ' +
            callsCount +
            ' times.'
          : 'Expected spy ' +
            actual.and.identity +
            ' to have been called ' +
            timesMessage +
            '. It was called ' +
            callsCount +
            ' times.';
        return result;
      }
    };
  }

  return toHaveBeenCalledTimes;
};
