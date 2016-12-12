getJasmineRequireObj().toHaveBeenCalledBefore = function(j$) {

  var getErrorMsg = j$.formatErrorMsg('<toHaveBeenCalledBefore>', 'expect(<spyObj>).toHaveBeenCalledBefore(<spyObj>)');

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

        result.pass = firstSpy.calls.mostRecent().invocationOrder < latterSpy.calls.mostRecent().invocationOrder;

        if (result.pass) {
          result.message = 'Expected ' + firstSpy.and.identity() + ' to not have been called before ' + latterSpy.and.identity() + ', but it was';
        } else {
          result.message = 'Expected ' + firstSpy.and.identity() + ' to have been called before ' + latterSpy.and.identity();
        }

        return result;
      }
    };
  }

  return toHaveBeenCalledBefore;
};
