getJasmineRequireObj().CompleteOnFirstErrorSkipPolicy = function(j$) {
  function CompleteOnFirstErrorSkipPolicy(queueableFns) {
    this.queueableFns_ = queueableFns;
    this.erroredFnIx_ = null;
  }

  CompleteOnFirstErrorSkipPolicy.prototype.skipTo = function(lastRanFnIx) {
    let i;

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

    const fn = this.queueableFns_[fnIx];
    const candidateSuite = fn.suite;
    const errorSuite = this.queueableFns_[this.erroredFnIx_].suite;
    const wasCleanupFn =
      fn.type === 'afterEach' ||
      fn.type === 'afterAll' ||
      fn.type === 'specCleanup';
    return (
      !wasCleanupFn ||
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
