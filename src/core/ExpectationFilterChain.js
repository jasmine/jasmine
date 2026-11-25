getJasmineRequireObj().ExpectationFilterChain = function() {
  'use strict';

  function ExpectationFilterChain(maybeFilter, prev) {
    this.filter_ = maybeFilter;
    this.prev_ = prev;
  }

  ExpectationFilterChain.prototype.addFilter = function(filter) {
    return new ExpectationFilterChain(filter, this);
  };

  ExpectationFilterChain.prototype.selectComparisonFunc = function(matcher) {
    const selected = this.callFirst_('selectComparisonFunc', arguments).result;
    const wraps = this.collectFns_('wrapComparisonFunc');

    if (wraps.length === 0) {
      return selected;
    }

    let comparison = selected || matcher.compare;

    for (let i = 0; i < wraps.length; i++) {
      comparison = wraps[i](comparison, matcher);
    }

    return comparison;
  };

  // Oldest wrap first, so a later filter is the outer wrapper.
  ExpectationFilterChain.prototype.collectFns_ = function(fname) {
    const fns = this.prev_ ? this.prev_.collectFns_(fname) : [];

    if (this.filter_ && typeof this.filter_[fname] === 'function') {
      fns.push(this.filter_[fname]);
    }

    return fns;
  };

  ExpectationFilterChain.prototype.buildFailureMessage = function(
    result,
    matcherName,
    args,
    matchersUtil
  ) {
    return this.callFirst_('buildFailureMessage', arguments).result;
  };

  ExpectationFilterChain.prototype.modifyFailureMessage = function(msg) {
    const result = this.callFirst_('modifyFailureMessage', arguments).result;
    return result || msg;
  };

  ExpectationFilterChain.prototype.callFirst_ = function(fname, args) {
    if (this.prev_) {
      const prevResult = this.prev_.callFirst_(fname, args);

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

    return { found: false };
  };

  return ExpectationFilterChain;
};
