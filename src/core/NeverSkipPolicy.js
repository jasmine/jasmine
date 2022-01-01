getJasmineRequireObj().NeverSkipPolicy = function(j$) {
  function NeverSkipPolicy(queueableFns) {}

  NeverSkipPolicy.prototype.skipTo = function(lastRanFnIx) {
    return lastRanFnIx + 1;
  };

  NeverSkipPolicy.prototype.fnErrored = function(fnIx) {};

  return NeverSkipPolicy;
};
