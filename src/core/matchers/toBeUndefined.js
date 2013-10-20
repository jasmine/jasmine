getJasmineRequireObj().toBeUndefined = function() {

  function toBeUndefined() {
    return function(actual) {
      return {
        pass: void 0 === actual
      };
    };
  }

  return toBeUndefined;
};
