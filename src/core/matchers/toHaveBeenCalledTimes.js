getJasmineRequireObj().toHaveBeenCalledTimes = function(j$) {

  var getErrorMsg = j$.formatErrorMsg('<toHaveBeenCalledTimes>', 'expect(<spyObj>).toHaveBeenCalledTimes(<Number>)');

  /**
   * {@link expect} the actual (a {@link Spy}) to have been called the specified number of times.
   * @function
   * @name matchers#toHaveBeenCalledTimes
   * @since 2.4.0
   * @param {Number} expected - The number of invocations to look for.
   * @example
   * expect(mySpy).toHaveBeenCalledTimes(3);
   */
  function toHaveBeenCalledTimes() {
    return {
      compare: function(actual, expected) {
        if (!j$.isSpy(actual)) {
          throw new Error(getErrorMsg('Expected a spy, but got ' + j$.pp(actual) + '.'));
        }

        var args = Array.prototype.slice.call(arguments, 0),
          result = { pass: false };

        if (!j$.isNumber_(expected)) {
          throw new Error(getErrorMsg('The expected times failed is a required argument and must be a number.'));
        }

        actual = args[0];
        var calls = actual.calls.count();
        var timesMessage = expected === 1 ? 'once' : expected + ' times';
        result.pass = calls === expected;
        result.message = result.pass ?
          'Expected spy ' + actual.and.identity + ' not to have been called ' + timesMessage + '. It was called ' +  calls + ' times.' :
          'Expected spy ' + actual.and.identity + ' to have been called ' + timesMessage + '. It was called ' +  calls + ' times.';
        return result;
      }
    };
  }

  return toHaveBeenCalledTimes;
};
