getJasmineRequireObj().toEndWith = function() {

  function toEndWith() {
    return {
      compare: function(actual, expected) {
        return {
          pass: util.endsWith(actual, expected)
        };
      }
    };
  }

  return toEndWith;
};
