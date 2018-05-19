getJasmineRequireObj().ExpectationFilterChain = function() {
  function ExpectationFilterChain() {
    this.filters_ = [];
  }

  ExpectationFilterChain.prototype.addFilter = function(filter) {
    this.filters_.push(filter);
  };

  ExpectationFilterChain.prototype.selectComparisonFunc = function(matcher) {
    return this.callFirst_('selectComparisonFunc', arguments);
  };

  ExpectationFilterChain.prototype.buildFailureMessage = function(result, matcherName, args, util) {
    return this.callFirst_('buildFailureMessage', arguments);
  };

  ExpectationFilterChain.prototype.modifyFailureMessage = function(msg) {
    var i;

    for (i = this.filters_.length - 1; i >= 0; i--) {
      if (this.filters_[i].modifyFailureMessage) {
        msg = this.filters_[i].modifyFailureMessage(msg);
      }
    }

    return msg;
  };

  ExpectationFilterChain.prototype.callFirst_ = function(fname, args) {
    var i, filter;

    for (i = 0; i < this.filters_.length; i++) {
      filter = this.filters_[i];

      if (filter[fname]) {
        return filter[fname].apply(filter, args);
      }
    }
  };

  return ExpectationFilterChain;
};
