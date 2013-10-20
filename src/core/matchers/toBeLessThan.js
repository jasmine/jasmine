getJasmineRequireObj().toBeLessThan = function() {
  function toBeLessThan() {
    return function(actual, expected) {
      return {
        pass: actual < expected
      };
    };
  }

  return toBeLessThan;
};
