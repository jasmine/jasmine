getJasmineRequireObj().CompleteOnFirstErrorSkipPolicy = function(j$) {
  function CompleteOnFirstErrorSkipPolicy(queueableFns, firstCleanupIx) {
    this.firstCleanupIx_ = firstCleanupIx;
    this.skipping_ = false;
  }

  CompleteOnFirstErrorSkipPolicy.prototype.skipTo = function(lastRanFnIx) {
    if (this.skipping_ && lastRanFnIx < this.firstCleanupIx_) {
      return this.firstCleanupIx_;
    } else {
      return lastRanFnIx + 1;
    }
  };

  CompleteOnFirstErrorSkipPolicy.prototype.fnErrored = function(fnIx) {
    this.skipping_ = true;
  };

  return CompleteOnFirstErrorSkipPolicy;
};
