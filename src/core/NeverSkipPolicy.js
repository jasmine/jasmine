getJasmineRequireObj().NeverSkipPolicy = function(j$) {
  function NeverSkipPolicy(queueableFns, firstCleanupIx) {}

  NeverSkipPolicy.prototype.skipTo = function(lastRanFnIx, errored) {
    return lastRanFnIx + 1;
  };

  return NeverSkipPolicy;
};
