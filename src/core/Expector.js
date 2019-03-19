getJasmineRequireObj().Expector = function(j$) {
  function Expector(options) {
    this.util = options.util || { buildOutputMessage: function() {} };
    this.customEqualityTesters = options.customEqualityTesters || [];
    this.actual = options.actual;
    this.addExpectationResult = options.addExpectationResult || function(){};
    this.filters = new j$.ExpectationFilterChain();
  }

  Expector.prototype.instantiateMatcher = function(matcherName, matcherFactory, args) {
    this.matcherName = matcherName;
    this.args = Array.prototype.slice.call(args, 0);
    this.expected = this.args.slice(0);

    this.args.unshift(this.actual);

    var matcher = matcherFactory(this.util, this.customEqualityTesters);
    var comparisonFunc = this.filters.selectComparisonFunc(matcher);
    return comparisonFunc || matcher.compare;
  };

  Expector.prototype.buildMessage = function(result) {
    var self = this;

    var msg = this.filters.buildOutputMessage(result, this.matcherName, this.args, this.util, defaultMessage);
    return this.filters.modifyOutputMessage(msg || defaultMessage());

    function defaultMessage() {
      if (!result.message) {
        var args = self.args.slice();
        args.unshift(result.messageSuffix);
        args.unshift(result.expectedQualifier);
        args.unshift(result.actualQualifier);
        args.unshift(false);
        args.unshift(self.matcherName);
        return self.util.buildOutputMessage.apply(null, args);
      } else if (j$.isFunction_(result.message)) {
        return result.message();
      } else {
        return result.message;
      }
    }
  };

  Expector.prototype.compare = function(matcherName, matcherFactory, args) {
    var matcherCompare = this.instantiateMatcher(matcherName, matcherFactory, args);
    return matcherCompare.apply(null, this.args);
  };

  Expector.prototype.addFilter = function(filter) {
    var result = Object.create(this);
    result.filters = this.filters.addFilter(filter);
    return result;
  };

  Expector.prototype.processResult = function(result, errorForStack, actualOverride) {
    this.args[0] = actualOverride || this.args[0];
    var message = this.buildMessage(result);

    if (this.expected.length === 1) {
      this.expected = this.expected[0];
    }

    this.addExpectationResult(
      result.pass,
      {
        matcherName: this.matcherName,
        passed: result.pass,
        message: message,
        error: errorForStack ? undefined : result.error,
        errorForStack: errorForStack || undefined,
        actual: this.actual,
        expected: this.expected // TODO: this may need to be arrayified/sliced
      }
    );
  };

  return Expector;
};
