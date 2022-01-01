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
      // Failures need to be reported for each contained spec. But we can't do
      // that from here because reporting is async. This function isn't async
      // (and can't be without greatly complicating QueueRunner). Mark the
      // failure so that the code that reports the suite result (which is
      // already async) can detect the failure and report the specs.
      this.queueableFns_[fnIx].suite.hadBeforeAllFailure = true;
    }
  };

  return SkipAfterBeforeAllErrorPolicy;
};
