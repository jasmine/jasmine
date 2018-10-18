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
    this.isNot = options.isNot;

    if (!global.Promise) {
      throw new Error('expectAsync is unavailable because the environment does not support promises.');
    }

    if (!j$.isPromiseLike(this.actual)) {
      throw new Error('Expected expectAsync to be called with a promise.');
    }

    ['toBeResolved', 'toBeRejected', 'toBeResolvedTo'].forEach(wrapCompare.bind(this));
  }

  function wrapCompare(name) {
    var compare = this[name];
    this[name] = function() {
      var self = this;
      var args = Array.prototype.slice.call(arguments);
      args.unshift(this.actual);

      // Capture the call stack here, before we go async, so that it will
      // contain frames that are relevant to the user instead of just parts
      // of Jasmine.
      var errorForStack = j$.util.errorWithStack();

      return compare.apply(self, args).then(function(result) {
        var message;

        if (self.isNot) {
          result.pass = !result.pass;
        }

        args[0] = promiseForMessage;
        message = j$.Expectation.finalizeMessage(self.util, name, self.isNot, args, result);

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


  AsyncExpectation.factory = function(options) {
    var expect = new AsyncExpectation(options);

    options = j$.util.clone(options);
    options.isNot = true;
    expect.not = new AsyncExpectation(options);

    return expect;
  };


  return AsyncExpectation;
};
