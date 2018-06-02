getJasmineRequireObj().ExpectationFilterChain = function() {
  function ExpectationFilterChain(maybeFilter, prev) {
    this.filter_ = maybeFilter;
    this.prev_ = prev;
  }

  ExpectationFilterChain.prototype.addFilter = function(filter) {
    return new ExpectationFilterChain(filter, this);
  };

  ExpectationFilterChain.prototype.selectComparisonFunc = function(matcher) {
    return this.callFirst_('selectComparisonFunc', arguments).result;
  };

  ExpectationFilterChain.prototype.buildFailureMessage = function(result, matcherName, args, util) {
    return this.callFirst_('buildFailureMessage', arguments).result;
  };

  ExpectationFilterChain.prototype.modifyFailureMessage = function(msg) {
    if (this.prev_) {
      msg = this.prev_.modifyFailureMessage(msg);
    }

    if (this.filter_ && this.filter_.modifyFailureMessage) {
      msg = this.filter_.modifyFailureMessage(msg);
    }

    return msg;
  };

  ExpectationFilterChain.prototype.callFirst_ = function(fname, args) {
    var prevResult;

    if (this.prev_) {
      prevResult = this.prev_.callFirst_(fname, args);

      if (prevResult.found) {
        return prevResult;
      }
    }

    if (this.filter_ && this.filter_[fname]) {
      return {
        found: true,
        result: this.filter_[fname].apply(this.filter_, args)
      };
    }

    return {found: false};
  };

  return ExpectationFilterChain;
};
