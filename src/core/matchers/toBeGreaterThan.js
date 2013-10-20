getJasmineRequireObj().toBeGreaterThan = function() {

  function toBeGreaterThan() {
    return function(actual, expected) {
      return {
        pass: actual > expected
      };
    };
  }

  return toBeGreaterThan;
};

