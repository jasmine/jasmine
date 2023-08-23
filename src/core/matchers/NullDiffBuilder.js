getJasmineRequireObj().NullDiffBuilder = function(j$) {
  'use strict';

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
