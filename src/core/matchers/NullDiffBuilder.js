getJasmineRequireObj().NullDiffBuilder = function(j$) {
  return function() {
    return {
      withPath: function(_, block) {
        block();
      },
      setRoots: function() {},
      recordMismatch: function() {}
    };
  };
};
