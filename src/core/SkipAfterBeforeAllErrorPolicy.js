getJasmineRequireObj().SkipAfterBeforeAllErrorPolicy = function(j$) {
  function SkipAfterBeforeAllErrorPolicy(queueableFns) {
    this.queueableFns_ = queueableFns;
    this.skipping_ = false;
  }

  SkipAfterBeforeAllErrorPolicy.prototype.skipTo = function(lastRanFnIx) {
    if (this.skipping_) {
      return this.nextAfterAllAfter_(lastRanFnIx);
    } else {
      return lastRanFnIx + 1;
    }
  };

  SkipAfterBeforeAllErrorPolicy.prototype.nextAfterAllAfter_ = function(i) {
    for (
      i++;
      i < this.queueableFns_.length &&
      this.queueableFns_[i].type !== 'afterAll';
      i++
    ) {}
    return i;
  };

  SkipAfterBeforeAllErrorPolicy.prototype.fnErrored = function(fnIx) {
    if (this.queueableFns_[fnIx].type === 'beforeAll') {
      this.skipping_ = true;
    }
  };

  return SkipAfterBeforeAllErrorPolicy;
};
