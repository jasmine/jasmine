getJasmineRequireObj().toEqual = function() {

  function toEqual(util, customEqualityTesters) {
    customEqualityTesters = customEqualityTesters || [];

    return function(actual, expected) {
      return {
        pass: util.equals(actual, expected, customEqualityTesters)
      };
    };
  }

  return toEqual;
};
