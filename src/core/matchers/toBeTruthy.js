getJasmineRequireObj().toBeTruthy = function() {

  function toBeTruthy() {
    return function(actual) {
      return {
        pass: !!actual
      };
    };
  }

  return toBeTruthy;
};
