getJasmineRequireObj().toContain = function() {
  function toContain(util, customEqualityTesters) {
    customEqualityTesters = customEqualityTesters || [];

    return function(actual, expected) {
      return {
        pass: util.contains(actual, expected, customEqualityTesters)
      };
    };
  }

  return toContain;
};
