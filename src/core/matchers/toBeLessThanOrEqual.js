getJasmineRequireObj().toBeLessThanOrEqual = function() {
  function toBeLessThanOrEqual() {
    return {

      compare: function(actual, expected) {
        return {
          pass: actual <= expected
        };
      }
    };
  }

  return toBeLessThanOrEqual;
};
