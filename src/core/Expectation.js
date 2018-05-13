getJasmineRequireObj().Expectation = function() {

  /**
   * Matchers that come with Jasmine out of the box.
   * @namespace matchers
   */
  function Expectation(options) {
    this.util = options.util || { buildFailureMessage: function() {} };
    this.customEqualityTesters = options.customEqualityTesters || [];
    this.actual = options.actual;
    this.addExpectationResult = options.addExpectationResult || function(){};
    this.isNot = options.isNot;

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

    function defaultNegativeCompare() {
      var result = matcher.compare.apply(null, arguments);
      result.pass = !result.pass;
      return result;
    }

    if (this.isNot) {
      return matcher.negativeCompare || defaultNegativeCompare;
    } else {
      return matcher.compare;
    }
  };

  Expectation.prototype.processResult = function(result, name, expected, args) {
    var message = this.buildMessage(result, name, args);

    if (expected.length == 1) {
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
    if (result.pass) {
      return '';
    } else if (!result.message) {
      args = args.slice();
      args.unshift(this.isNot);
      args.unshift(name);
      return this.util.buildFailureMessage.apply(null, args);
    } else if (Object.prototype.toString.apply(result.message) === '[object Function]') {
      return result.message();
    } else {
      return result.message;
    }
  };

  Expectation.addCoreMatchers = function(matchers) {
    var prototype = Expectation.prototype;
    for (var matcherName in matchers) {
      var matcher = matchers[matcherName];
      prototype[matcherName] = wrapCompare(matcherName, matcher);
    }
  };

  Expectation.Factory = function(options) {
    options = options || {};

    var expect = new Expectation(options);

    // TODO: this would be nice as its own Object - NegativeExpectation
    // TODO: copy instead of mutate options
    options.isNot = true;
    expect.not = new Expectation(options);

    return expect;
  };

  return Expectation;
};
