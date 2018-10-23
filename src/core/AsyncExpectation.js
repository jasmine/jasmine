getJasmineRequireObj().AsyncExpectation = function(j$) {
  var promiseForMessage = {
    jasmineToString: function() { return 'a promise'; }
  };

  /**
   * Asynchronous matchers.
   * @namespace async-matchers
   */
  function AsyncExpectation(options) {
    var global = options.global || j$.getGlobal();
    this.util = options.util || { buildFailureMessage: function() {} };
    this.customEqualityTesters = options.customEqualityTesters || [];
    this.addExpectationResult = options.addExpectationResult || function(){};
    this.actual = options.actual;
    this.filters = new j$.ExpectationFilterChain();

    if (!global.Promise) {
      throw new Error('expectAsync is unavailable because the environment does not support promises.');
    }

    if (!j$.isPromiseLike(this.actual)) {
      throw new Error('Expected expectAsync to be called with a promise.');
    }
  }

  function wrapCompare(name, matcherFactory) {
    return function() {
      var self = this;
      var args = Array.prototype.slice.call(arguments),
        expected = args.slice(0);

      args.unshift(this.actual);

      // Capture the call stack here, before we go async, so that it will
      // contain frames that are relevant to the user instead of just parts
      // of Jasmine.
      var errorForStack = j$.util.errorWithStack();

      var matcherCompare = this.instantiateMatcher(matcherFactory);

      return matcherCompare.apply(self, args).then(function(result) {
        args[0] = promiseForMessage;
        self.processResult(result, name, expected, args, errorForStack);
      });
    };
  }

  AsyncExpectation.prototype.processResult = function(result, name, expected, args, errorForStack) {
    var message = this.buildMessage(result, name, args);

    if (expected.length === 1) {
      expected = expected[0];
    }

    this.addExpectationResult(
      result.pass,
      {
        matcherName: name,
        passed: result.pass,
        message: message,
        error: undefined,
        errorForStack: errorForStack,
        actual: this.actual,
        expected: expected // TODO: this may need to be arrayified/sliced
      }
    );
  };

  AsyncExpectation.prototype.buildMessage = j$.Expectation.prototype.buildMessage;

  AsyncExpectation.prototype.instantiateMatcher = j$.Expectation.prototype.instantiateMatcher;

  AsyncExpectation.prototype.addFilter = j$.Expectation.prototype.addFilter;

  AsyncExpectation.addCoreMatchers = function(matchers) {
    var prototype = AsyncExpectation.prototype;
    for (var matcherName in matchers) {
      var matcher = matchers[matcherName];
      prototype[matcherName] = wrapCompare(matcherName, matcher);
    }
  };

  AsyncExpectation.factory = function(options) {
    var expect = new AsyncExpectation(options);
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
        return matcher.compare.apply(this, arguments).then(function(result) {
          result.pass = !result.pass;
          return result;
        });
      }

      return defaultNegativeCompare;
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

  return AsyncExpectation;
};
