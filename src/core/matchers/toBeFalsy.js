getJasmineRequireObj().toBeFalsy = function() {
  function toBeFalsy() {
    return function(actual) {
      return {
        pass: !!!actual
      };
    };
  }

  return toBeFalsy;
};
