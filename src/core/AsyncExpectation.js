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

    ['toBeResolved', 'toBeRejected', 'toBeResolvedTo', 'toBeRejectedWith'].forEach(wrapCompare.bind(this));
  }

  function wrapCompare(name) {
    var matcher = this[name];
    this[name] = function() {
      var self = this;
      var args = Array.prototype.slice.call(arguments);
      args.unshift(this.actual);

      // Capture the call stack here, before we go async, so that it will
      // contain frames that are relevant to the user instead of just parts
      // of Jasmine.
      var errorForStack = j$.util.errorWithStack();

      var matcherCompare = this.instantiateMatcher(matcher);

      return matcherCompare.apply(self, args).then(function(result) {
        var message;

        args[0] = promiseForMessage;
        message = j$.Expectation.prototype.buildMessage.call(self, result, name, args);

        self.addExpectationResult(result.pass, {
          matcherName: name,
          passed: result.pass,
          message: message,
          error: undefined,
          errorForStack: errorForStack,
          actual: self.actual
        });
      });
    };
  }

  AsyncExpectation.prototype.instantiateMatcher = function(matcher) {
    var comparisonFunc = this.filters.selectComparisonFunc(matcher);
    return comparisonFunc || matcher;
  };

  /**
   * Expect a promise to be resolved.
   * @function
   * @async
   * @name async-matchers#toBeResolved
   * @example
   * await expectAsync(aPromise).toBeResolved();
   * @example
   * return expectAsync(aPromise).toBeResolved();
   */
  AsyncExpectation.prototype.toBeResolved = function(actual) {
    return actual.then(
      function() { return {pass: true}; },
      function() { return {pass: false}; }
    );
  };

  /**
   * Expect a promise to be rejected.
   * @function
   * @async
   * @name async-matchers#toBeRejected
   * @example
   * await expectAsync(aPromise).toBeRejected();
   * @example
   * return expectAsync(aPromise).toBeRejected();
   */
  AsyncExpectation.prototype.toBeRejected = function(actual) {
    return actual.then(
      function() { return {pass: false}; },
      function() { return {pass: true}; }
    );
  };

  /**
   * Expect a promise to be resolved to a value equal to the expected, using deep equality comparison.
   * @function
   * @async
   * @name async-matchers#toBeResolvedTo
   * @param {Object} expected - Value that the promise is expected to resolve to
   * @example
   * await expectAsync(aPromise).toBeResolvedTo({prop: 'value'});
   * @example
   * return expectAsync(aPromise).toBeResolvedTo({prop: 'value'});
   */
  AsyncExpectation.prototype.toBeResolvedTo = function(actualPromise, expectedValue) {
    var self = this;

    function prefix(passed) {
      return 'Expected a promise ' +
        (passed ? 'not ' : '') +
        'to be resolved to ' + j$.pp(expectedValue);
    }

    return actualPromise.then(
      function(actualValue) {
        if (self.util.equals(actualValue, expectedValue, self.customEqualityTesters)) {
          return {
           pass: true,
           message: prefix(true) + '.'
         };
        } else {
          return {
            pass: false,
            message: prefix(false) + ' but it was resolved to ' + j$.pp(actualValue) + '.'
          };
        }
      },
      function() {
        return {
          pass: false,
          message: prefix(false) + ' but it was rejected.'
        };
      }
    );
  };

  /**
   * Expect a promise to be rejected with a value equal to the expected, using deep equality comparison.
   * @function
   * @async
   * @name async-matchers#toBeRejectedWith
   * @param {Object} expected - Value that the promise is expected to reject to
   * @example
   * await expectAsync(aPromise).toBeRejectedWith({prop: 'value'});
   * @example
   * return expectAsync(aPromise).toBeRejectedWith({prop: 'value'});
   */
  AsyncExpectation.prototype.toBeRejectedWith = function(actualPromise, expectedValue) {
    var self = this;

    function prefix(passed) {
      return 'Expected a promise ' +
        (passed ? 'not ' : '') +
        'to be rejected with ' + j$.pp(expectedValue);
    }

    return actualPromise.then(
      function() {
        return {
          pass: false,
          message: prefix(false) + ' but it was resolved.'
        };
      },
      function(actualValue) {
        if (self.util.equals(actualValue, expectedValue, self.customEqualityTesters)) {
          return {
            pass: true,
            message: prefix(true) + '.'
          };
        } else {
          return {
            pass: false,
            message: prefix(false) + ' but it was rejected with ' + j$.pp(actualValue) + '.'
          };
        }
      }
    );
  };

  AsyncExpectation.prototype.addFilter = function(filter) {
    var result = Object.create(this);
    result.filters = this.filters.addFilter(filter);
    return result;
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
        return matcher.apply(this, arguments).then(function(result) {
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
