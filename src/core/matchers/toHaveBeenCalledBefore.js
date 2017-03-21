getJasmineRequireObj().toHaveBeenCalledBefore = function(j$) {

  var getErrorMsg = j$.formatErrorMsg('<toHaveBeenCalledBefore>', 'expect(<spyObj>).toHaveBeenCalledBefore(<spyObj>)');

  /**
   * {@link expect} the actual value (a {@link Spy}) to have been called before another {@link Spy}.
   * @function
   * @name matchers#toHaveBeenCalledBefore
   * @param {Spy} expected - {@link Spy} that should have been called after the `actual` {@link Spy}.
   * @example
   * expect(mySpy).toHaveBeenCalledBefore(otherSpy);
   */
  function toHaveBeenCalledBefore() {
    return {
      compare: function(firstSpy, latterSpy) {
        if (!j$.isSpy(firstSpy)) {
          throw new Error(getErrorMsg('Expected a spy, but got ' + j$.pp(firstSpy) + '.'));
        }
        if (!j$.isSpy(latterSpy)) {
          throw new Error(getErrorMsg('Expected a spy, but got ' + j$.pp(latterSpy) + '.'));
        }

        var result = { pass: false };

        if (!firstSpy.calls.count()) {
          result.message = 'Expected spy ' +  firstSpy.and.identity() + ' to have been called.';
          return result;
        }
        if (!latterSpy.calls.count()) {
          result.message = 'Expected spy ' +  latterSpy.and.identity() + ' to have been called.';
          return result;
        }

        var latest1stSpyCall = firstSpy.calls.mostRecent().invocationOrder;
        var first2ndSpyCall = latterSpy.calls.first().invocationOrder;

        result.pass = latest1stSpyCall < first2ndSpyCall;

        if (result.pass) {
          result.message = 'Expected spy ' + firstSpy.and.identity() + ' to not have been called before spy ' + latterSpy.and.identity() + ', but it was';
        } else {
          var first1stSpyCall = firstSpy.calls.first().invocationOrder;
          var latest2ndSpyCall = latterSpy.calls.mostRecent().invocationOrder;

          if(first1stSpyCall < first2ndSpyCall) {
            result.message = 'Expected latest call to spy ' + firstSpy.and.identity() + ' to have been called before first call to spy ' + latterSpy.and.identity() + ' (no interleaved calls)';
          } else if (latest2ndSpyCall > latest1stSpyCall) {
            result.message = 'Expected first call to spy ' + latterSpy.and.identity() + ' to have been called after latest call to spy ' + firstSpy.and.identity() + ' (no interleaved calls)';
          } else {
            result.message = 'Expected spy ' + firstSpy.and.identity() + ' to have been called before spy ' + latterSpy.and.identity();
          }
        }

        return result;
      }
    };
  }

  return toHaveBeenCalledBefore;
};
