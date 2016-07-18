getJasmineRequireObj().NullDiffBuilder = function(j$) {
  return function() {
    return {
      withPath: function(_, block) {
        block();
      },
      record: function() {}
    };
  };
};
