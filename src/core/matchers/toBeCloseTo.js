getJasmineRequireObj().toBeCloseTo = function() {

  function toBeCloseTo() {
    return function(actual, expected, precision) {
      if (precision !== 0) {
        precision = precision || 2;
      }

      return {
        pass: Math.abs(expected - actual) < (Math.pow(10, -precision) / 2)
      };
    };
  }

  return toBeCloseTo;
};
