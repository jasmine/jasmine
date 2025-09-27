getJasmineRequireObj().Expector = function(j$) {
  function Expector(options) {
    this.matchersUtil = options.matchersUtil || {
      buildFailureMessage: function() {}
    };
    this.actual = options.actual;
    this.addExpectationResult = options.addExpectationResult || function() {};
    this.filters = new j$.private.ExpectationFilterChain();
  }

  Expector.prototype.instantiateMatcher = function(
    matcherName,
    matcherFactory,
    args
  ) {
    this.matcherName = matcherName;
    this.args = Array.prototype.slice.call(args, 0);
    this.expected = this.args.slice(0);

    this.args.unshift(this.actual);

    const matcher = matcherFactory(this.matchersUtil);

    const comparisonFunc = this.filters.selectComparisonFunc(matcher);
    return comparisonFunc || matcher.compare;
  };

  Expector.prototype.buildMessage = function(result) {
    if (result.pass) {
      return '';
    }

    const defaultMessage = () => {
      if (!result.message) {
        const args = this.args.slice();
        args.unshift(false);
        args.unshift(this.matcherName);
        return this.matchersUtil.buildFailureMessage.apply(
          this.matchersUtil,
          args
        );
      } else if (j$.private.isFunction(result.message)) {
        return result.message();
      } else {
        return result.message;
      }
    };

    const msg = this.filters.buildFailureMessage(
      result,
      this.matcherName,
      this.args,
      this.matchersUtil,
      defaultMessage
    );
    return this.filters.modifyFailureMessage(msg || defaultMessage());
  };

  Expector.prototype.compare = function(matcherName, matcherFactory, args) {
    const matcherCompare = this.instantiateMatcher(
      matcherName,
      matcherFactory,
      args
    );
    return matcherCompare.apply(null, this.args);
  };

  Expector.prototype.addFilter = function(filter) {
    const result = Object.create(this);
    result.filters = this.filters.addFilter(filter);
    return result;
  };

  Expector.prototype.processResult = function(result, errorForStack) {
    const message = this.buildMessage(result);

    if (this.expected.length === 1) {
      this.expected = this.expected[0];
    }

    this.addExpectationResult(result.pass, {
      matcherName: this.matcherName,
      passed: result.pass,
      message: message,
      error: errorForStack ? undefined : result.error,
      errorForStack: errorForStack || undefined
    });
  };

  return Expector;
};
