getJasmineRequireObj().toMatch = function() {

  function toMatch() {
    return function(actual, expected) {
      var regexp = new RegExp(expected);

      return {
        pass: regexp.test(actual)
      };
    };
  }

  return toMatch;
};
