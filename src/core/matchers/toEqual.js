getJasmineRequireObj().toEqual = function(j$) {

  function toEqual(util, customEqualityTesters) {
    customEqualityTesters = customEqualityTesters || [];

    return {
      compare: function(actual, expected) {
        var result = {
            pass: false
          },
          diffBuilder = j$.DiffBuilder();

        result.pass = util.equals(actual, expected, customEqualityTesters, diffBuilder);

        // TODO: only set error message if test fails
        result.message = diffBuilder.getMessage();

        return result;
      }
    };
  }

  return toEqual;
};
