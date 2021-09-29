getJasmineRequireObj().CompleteOnFirstErrorSkipPolicy = function(j$) {
  function CompleteOnFirstErrorSkipPolicy(queueableFns, firstCleanupIx) {
    this.queueableFns_ = queueableFns;
    this.firstCleanupIx_ = firstCleanupIx;
  }

  CompleteOnFirstErrorSkipPolicy.prototype.skipTo = function(
    lastRanFnIx,
    errored
  ) {
    if (errored && lastRanFnIx < this.firstCleanupIx_) {
      return this.firstCleanupIx_;
    } else {
      return lastRanFnIx + 1;
    }
  };

  return CompleteOnFirstErrorSkipPolicy;
};
