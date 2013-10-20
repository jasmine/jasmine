getJasmineRequireObj().toBeNull = function() {

  function toBeNull() {
    return function(actual) {
      return {
        pass: actual === null
      };
    };
  }

  return toBeNull;
};
