getJasmineRequireObj().CompleteOnFirstErrorSkipPolicy = function(j$) {
  function CompleteOnFirstErrorSkipPolicy(queueableFns, firstCleanupIx) {
    this.queueableFns_ = queueableFns;
    this.firstCleanupIx_ = firstCleanupIx;
    this.erroredFnIx_ = null;
  }

  CompleteOnFirstErrorSkipPolicy.prototype.skipTo = function(lastRanFnIx) {
    for (
      i = lastRanFnIx + 1;
      i < this.queueableFns_.length && this.shouldSkip_(i);
      i++
    ) {}
    return i;
  };

  CompleteOnFirstErrorSkipPolicy.prototype.fnErrored = function(fnIx) {
    this.erroredFnIx_ = fnIx;
  };

  CompleteOnFirstErrorSkipPolicy.prototype.shouldSkip_ = function(fnIx) {
    if (this.erroredFnIx_ === null) {
      return false;
    }

    // firstCleanupIx_ isn't correct for suites with afterAll functions.
    // Rely on the type for those.
    if (this.queueableFns_[fnIx].type === 'afterAll') {
      return false;
    }

    const candidateSuite = this.queueableFns_[fnIx].suite;
    const errorSuite = this.queueableFns_[this.erroredFnIx_].suite;
    return (
      fnIx < this.firstCleanupIx_ ||
      (candidateSuite && isDescendent(candidateSuite, errorSuite))
    );
  };

  function isDescendent(candidate, ancestor) {
    if (!candidate.parentSuite) {
      return false;
    } else if (candidate.parentSuite === ancestor) {
      return true;
    } else {
      return isDescendent(candidate.parentSuite, ancestor);
    }
  }

  return CompleteOnFirstErrorSkipPolicy;
};
