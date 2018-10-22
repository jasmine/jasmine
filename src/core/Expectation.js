getJasmineRequireObj().Expectation = function(j$) {

  /**
   * Matchers that come with Jasmine out of the box.
   * @namespace matchers
   */
  function Expectation(options) {
    this.util = options.util || { buildFailureMessage: function() {} };
    this.customEqualityTesters = options.customEqualityTesters || [];
    this.actual = options.actual;
    this.addExpectationResult = options.addExpectationResult || function(){};
    this.filters = new j$.ExpectationFilterChain();

    var customMatchers = options.customMatchers || {};
    for (var matcherName in customMatchers) {
      this[matcherName] = wrapCompare(matcherName, customMatchers[matcherName]);
    }
  }

  function wrapCompare(name, matcherFactory) {
    return function() {
      var args = Array.prototype.slice.call(arguments, 0),
        expected = args.slice(0);

      args.unshift(this.actual);

      var matcherCompare = this.instantiateMatcher(matcherFactory);
      var result = matcherCompare.apply(null, args);
      this.processResult(result, name, expected, args);
    };
  }

  Expectation.prototype.instantiateMatcher = function(matcherFactory) {
    var matcher = matcherFactory(this.util, this.customEqualityTesters);
    var comparisonFunc = this.filters.selectComparisonFunc(matcher);
    return comparisonFunc || matcher.compare;
  };

  Expectation.prototype.processResult = function(result, name, expected, args) {
    var message = this.buildMessage(result, name, args);

    if (expected.length === 1) {
      expected = expected[0];
    }

    // TODO: how many of these params are needed?
    this.addExpectationResult(
      result.pass,
      {
        matcherName: name,
        passed: result.pass,
        message: message,
        error: result.error,
        actual: this.actual,
        expected: expected // TODO: this may need to be arrayified/sliced
      }
    );
  };

  Expectation.prototype.buildMessage = function(result, name, args) {
    var util = this.util;

    if (result.pass) {
      return '';
    }

    var msg = this.filters.buildFailureMessage(result, name, args, util, defaultMessage);
    return this.filters.modifyFailureMessage(msg || defaultMessage());

    function defaultMessage() {
      if (!result.message) {
        args = args.slice();
        args.unshift(false);
        args.unshift(name);
        return util.buildFailureMessage.apply(null, args);
      } else if (j$.isFunction_(result.message)) {
        return result.message();
      } else {
        return result.message;
      }
    }
  };

  Expectation.prototype.addFilter = function(filter) {
    var result = Object.create(this);
    result.filters = this.filters.addFilter(filter);
    return result;
  };

  Expectation.addCoreMatchers = function(matchers) {
    var prototype = Expectation.prototype;
    for (var matcherName in matchers) {
      var matcher = matchers[matcherName];
      prototype[matcherName] = wrapCompare(matcherName, matcher);
    }
  };

  Expectation.Factory = function(options) {
    var expect = new Expectation(options || {});
    expect.not = expect.addFilter(negatingFilter);

    expect.withContext = function(message) {
      var result = this.addFilter(new ContextAddingFilter(message));
      result.not = result.addFilter(negatingFilter);
      return result;
    };

    return expect;
  };


  var negatingFilter = {
    selectComparisonFunc: function(matcher) {
      function defaultNegativeCompare() {
        var result = matcher.compare.apply(null, arguments);
        result.pass = !result.pass;
        return result;
      }

      return matcher.negativeCompare || defaultNegativeCompare;
    },
    buildFailureMessage: function(result, matcherName, args, util) {
      if (result.message) {
        if (j$.isFunction_(result.message)) {
          return result.message();
        } else {
          return result.message;
        }
      }

      args = args.slice();
      args.unshift(true);
      args.unshift(matcherName);
      return util.buildFailureMessage.apply(null, args);
    }
  };


  function ContextAddingFilter(message) {
    this.message = message;
  }

  ContextAddingFilter.prototype.modifyFailureMessage = function(msg) {
    return this.message + ': ' + msg;
  };

  return Expectation;
};
