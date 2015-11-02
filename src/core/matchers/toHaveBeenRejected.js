getJasmineRequireObj().toHaveBeenRejected = function (j$) {

    function toHaveBeenRejected() {
      return {
        compare: function (actual) {
          if (typeof actual.isResolved === 'undefined' || typeof actual.isRejected === 'undefined') {
            throw new Error('Expected a promise spy, but got ' + j$.pp(actual) + '.');
          }

          var result = {};

          result.pass = actual.isRejected();

          if (!result.pass && actual.isResolved()) {
            result.message = 'Expected ' + actual.baseMethod + ' to have been rejected, but it got resolved instead.';
          }

          return result;
        }
      };
    }

    return toHaveBeenRejected;
};