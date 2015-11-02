getJasmineRequireObj().toHaveBeenResolved = function (j$) {

    function toHaveBeenResolved() {
      return {
        compare: function (actual) {
          if (typeof actual.isResolved === 'undefined' || typeof actual.isRejected === 'undefined') {
            throw new Error('Expected a promise spy, but got ' + j$.pp(actual) + '.');
          }

          var result = {};

          result.pass = actual.isResolved();

          if (!result.pass && actual.isRejected()) {
            result.message = 'Expected ' + actual.baseMethod + ' to have been resolved, but it got rejected instead.';
          }

          return result;
        }
      };
    }

    return toHaveBeenResolved;
};