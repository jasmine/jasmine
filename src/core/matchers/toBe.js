getJasmineRequireObj().toBe = function() {
  function toBe() {
    return function(actual, expected) {
      return {
        pass: actual === expected
      };
    };
  }

  return toBe;
};
