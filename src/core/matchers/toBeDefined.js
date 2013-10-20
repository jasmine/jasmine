getJasmineRequireObj().toBeDefined = function() {
  function toBeDefined() {
    return function(actual) {
      return {
        pass: (void 0 !== actual)
      };
    };
  }

  return toBeDefined;
};
