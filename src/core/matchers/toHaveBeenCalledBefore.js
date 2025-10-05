getJasmineRequireObj().toHaveBeenCalledBefore = function(j$) {
  'use strict';

  const getErrorMsg = j$.private.formatErrorMsg(
    '<toHaveBeenCalledBefore>',
    'expect(<spyObj>).toHaveBeenCalledBefore(<spyObj>)'
  );

  /**
   * {@link expect} the actual value (a {@link Spy}) to have been called before another {@link Spy}.
   * @function
   * @name matchers#toHaveBeenCalledBefore
   * @since 2.6.0
   * @param {Spy} expected - {@link Spy} that should have been called after the `actual` {@link Spy}.
   * @example
   * expect(mySpy).toHaveBeenCalledBefore(otherSpy);
   */
  function toHaveBeenCalledBefore(matchersUtil) {
    return {
      compare: function(firstSpy, latterSpy) {
        if (!j$.isSpy(firstSpy)) {
          throw new Error(
            getErrorMsg(
              'Expected a spy, but got ' + matchersUtil.pp(firstSpy) + '.'
            )
          );
        }
        if (!j$.isSpy(latterSpy)) {
          throw new Error(
            getErrorMsg(
              'Expected a spy, but got ' + matchersUtil.pp(latterSpy) + '.'
            )
          );
        }

        const result = { pass: false };

        if (!firstSpy.calls.count()) {
          result.message =
            'Expected spy ' + firstSpy.and.identity + ' to have been called.';
          return result;
        }
        if (!latterSpy.calls.count()) {
          result.message =
            'Expected spy ' + latterSpy.and.identity + ' to have been called.';
          return result;
        }

        const latest1stSpyCall = firstSpy.calls.mostRecent().invocationOrder;
        const first2ndSpyCall = latterSpy.calls.first().invocationOrder;

        result.pass = latest1stSpyCall < first2ndSpyCall;

        if (result.pass) {
          firstSpy.calls.mostRecent().verified = true;
          latterSpy.calls.first().verified = true;

          result.message =
            'Expected spy ' +
            firstSpy.and.identity +
            ' to not have been called before spy ' +
            latterSpy.and.identity +
            ', but it was';
        } else {
          const first1stSpyCall = firstSpy.calls.first().invocationOrder;
          const latest2ndSpyCall = latterSpy.calls.mostRecent().invocationOrder;

          if (first1stSpyCall < first2ndSpyCall) {
            result.message =
              'Expected latest call to spy ' +
              firstSpy.and.identity +
              ' to have been called before first call to spy ' +
              latterSpy.and.identity +
              ' (no interleaved calls)';
          } else if (latest2ndSpyCall > latest1stSpyCall) {
            result.message =
              'Expected first call to spy ' +
              latterSpy.and.identity +
              ' to have been called after latest call to spy ' +
              firstSpy.and.identity +
              ' (no interleaved calls)';
          } else {
            result.message =
              'Expected spy ' +
              firstSpy.and.identity +
              ' to have been called before spy ' +
              latterSpy.and.identity;
          }
        }

        return result;
      }
    };
  }

  return toHaveBeenCalledBefore;
};
