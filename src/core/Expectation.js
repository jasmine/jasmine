getJasmineRequireObj().Expectation = function(j$) {
  var promiseForMessage = {
    jasmineToString: function() { return 'a promise'; }
  };

  /**
   * Matchers that come with Jasmine out of the box.
   * @namespace matchers
   */
  function Expectation(options) {
    this.expector = new j$.Expector(options);

    var customMatchers = options.customMatchers || {};
    for (var matcherName in customMatchers) {
      this[matcherName] = wrapSyncCompare(matcherName, customMatchers[matcherName]);
    }
  }

  /**
   * Add some context for an {@link expect}
   * @function
   * @name matchers#withContext
   * @param {String} message - Additional context to show when the matcher fails
   * @return {matchers}
   */
  Expectation.prototype.withContext = function withContext(message) {
    return addFilter(this, new ContextAddingFilter(message));
  };

  /**
   * Invert the matcher following this {@link expect}
   * @member
   * @name matchers#not
   * @type {matchers}
   * @example
   * expect(something).not.toBe(true);
   */
  Object.defineProperty(Expectation.prototype, 'not', {
    get: function() {
      return addFilter(this, syncNegatingFilter);
    }
  });

  /**
   * Asynchronous matchers.
   * @namespace async-matchers
   */
  function AsyncExpectation(options) {
    var global = options.global || j$.getGlobal();
    this.expector = new j$.Expector(options);

    if (!global.Promise) {
      throw new Error('expectAsync is unavailable because the environment does not support promises.');
    }

    if (!j$.isPromiseLike(this.expector.actual)) {
      throw new Error('Expected expectAsync to be called with a promise.');
    }
  }

  /**
   * Add some context for an {@link expectAsync}
   * @function
   * @name async-matchers#withContext
   * @param {String} message - Additional context to show when the async matcher fails
   * @return {async-matchers}
   */
  AsyncExpectation.prototype.withContext = function withContext(message) {
    return addFilter(this, new ContextAddingFilter(message));
  };

  /**
   * Invert the matcher following this {@link expectAsync}
   * @member
   * @name async-matchers#not
   * @type {async-matchers}
   * @example
   * await expectAsync(myPromise).not.toBeResolved();
   * @example
   * return expectAsync(myPromise).not.toBeResolved();
   */
  Object.defineProperty(AsyncExpectation.prototype, 'not', {
    get: function() {
      return addFilter(this, asyncNegatingFilter);
    }
  });

  function wrapSyncCompare(name, matcherFactory) {
    return function() {
      var result = this.expector.compare(name, matcherFactory, arguments);
      this.expector.processResult(result);
    };
  }

  function wrapAsyncCompare(name, matcherFactory) {
    return function() {
      var self = this;

      // Capture the call stack here, before we go async, so that it will contain
      // frames that are relevant to the user instead of just parts of Jasmine.
      var errorForStack = j$.util.errorWithStack();

      return this.expector.compare(name, matcherFactory, arguments).then(function(result) {
        self.expector.processResult(result, errorForStack, promiseForMessage);
      });
    };
  }

  function addCoreMatchers(prototype, matchers, wrapper) {
    for (var matcherName in matchers) {
      var matcher = matchers[matcherName];
      prototype[matcherName] = wrapper(matcherName, matcher);
    }
  }

  function addFilter(source, filter) {
    var result = Object.create(source);
    result.expector = source.expector.addFilter(filter);
    return result;
  }

  function negatedOutputMessage(result, matcherName, args, util) {
    if (result.message) {
      if (j$.isFunction_(result.message)) {
        return result.message();
      }
    }

    args = args.slice();
    args.unshift(result.messageSuffix);
    args.unshift(result.expectedQualifier);
    args.unshift(result.actualQualifier);
    args.unshift(true);
    args.unshift(matcherName);
    return util.buildOutputMessage.apply(null, args);
  }

  function negate(result) {
    result.pass = !result.pass;
    return result;
  }

  var syncNegatingFilter = {
    selectComparisonFunc: function(matcher) {
      function defaultNegativeCompare() {
        return negate(matcher.compare.apply(null, arguments));
      }

      return matcher.negativeCompare || defaultNegativeCompare;
    },
    buildOutputMessage: negatedOutputMessage
  };

  var asyncNegatingFilter = {
    selectComparisonFunc: function(matcher) {
      function defaultNegativeCompare() {
        return matcher.compare.apply(this, arguments).then(negate);
      }

      return defaultNegativeCompare;
    },
    buildOutputMessage: negatedOutputMessage
  };

  function ContextAddingFilter(message) {
    this.message = message;
  }

  ContextAddingFilter.prototype.modifyOutputMessage = function(msg) {
    return this.message + ': ' + msg;
  };

  return {
    factory: function(options) {
      return new Expectation(options || {});
    },
    addCoreMatchers: function(matchers) {
      addCoreMatchers(Expectation.prototype, matchers, wrapSyncCompare);
    },
    asyncFactory: function(options) {
      return new AsyncExpectation(options || {});
    },
    addAsyncCoreMatchers: function(matchers) {
      addCoreMatchers(AsyncExpectation.prototype, matchers, wrapAsyncCompare);
    }
  };
};
