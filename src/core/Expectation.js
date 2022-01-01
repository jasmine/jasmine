getJasmineRequireObj().Expectation = function(j$) {
  /**
   * Matchers that come with Jasmine out of the box.
   * @namespace matchers
   */
  function Expectation(options) {
    this.expector = new j$.Expector(options);

    var customMatchers = options.customMatchers || {};
    for (var matcherName in customMatchers) {
      this[matcherName] = wrapSyncCompare(
        matcherName,
        customMatchers[matcherName]
      );
    }
  }

  /**
   * Add some context for an {@link expect}
   * @function
   * @name matchers#withContext
   * @since 3.3.0
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
   * @since 1.3.0
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
   * Asynchronous matchers that operate on an actual value which is a promise,
   * and return a promise.
   *
   * Most async matchers will wait indefinitely for the promise to be resolved
   * or rejected, resulting in a spec timeout if that never happens. If you
   * expect that the promise will already be resolved or rejected at the time
   * the matcher is called, you can use the {@link async-matchers#already}
   * modifier to get a faster failure with a more helpful message.
   *
   * Note: Specs must await the result of each async matcher, return the
   * promise returned by the matcher, or return a promise that's derived from
   * the one returned by the matcher. Otherwise the matcher will not be
   * evaluated before the spec completes.
   *
   * @example
   * // Good
   * await expectAsync(aPromise).toBeResolved();
   * @example
   * // Good
   * return expectAsync(aPromise).toBeResolved();
   * @example
   * // Good
   * return expectAsync(aPromise).toBeResolved()
   *  .then(function() {
   *    // more spec code
   *  });
   * @example
   * // Bad
   * expectAsync(aPromise).toBeResolved();
   * @namespace async-matchers
   */
  function AsyncExpectation(options) {
    this.expector = new j$.Expector(options);

    var customAsyncMatchers = options.customAsyncMatchers || {};
    for (var matcherName in customAsyncMatchers) {
      this[matcherName] = wrapAsyncCompare(
        matcherName,
        customAsyncMatchers[matcherName]
      );
    }
  }

  /**
   * Add some context for an {@link expectAsync}
   * @function
   * @name async-matchers#withContext
   * @since 3.3.0
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

  /**
   * Fail as soon as possible if the actual is pending.
   * Otherwise evaluate the matcher.
   * @member
   * @name async-matchers#already
   * @since 3.8.0
   * @type {async-matchers}
   * @example
   * await expectAsync(myPromise).already.toBeResolved();
   * @example
   * return expectAsync(myPromise).already.toBeResolved();
   */
  Object.defineProperty(AsyncExpectation.prototype, 'already', {
    get: function() {
      return addFilter(this, expectSettledPromiseFilter);
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

      return this.expector
        .compare(name, matcherFactory, arguments)
        .then(function(result) {
          self.expector.processResult(result, errorForStack);
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

  function negatedFailureMessage(result, matcherName, args, matchersUtil) {
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
    return matchersUtil.buildFailureMessage.apply(matchersUtil, args);
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
    buildFailureMessage: negatedFailureMessage
  };

  var asyncNegatingFilter = {
    selectComparisonFunc: function(matcher) {
      function defaultNegativeCompare() {
        return matcher.compare.apply(this, arguments).then(negate);
      }

      return matcher.negativeCompare || defaultNegativeCompare;
    },
    buildFailureMessage: negatedFailureMessage
  };

  var expectSettledPromiseFilter = {
    selectComparisonFunc: function(matcher) {
      return function(actual) {
        var matcherArgs = arguments;

        return j$.isPending_(actual).then(function(isPending) {
          if (isPending) {
            return {
              pass: false,
              message:
                'Expected a promise to be settled (via ' +
                'expectAsync(...).already) but it was pending.'
            };
          } else {
            return matcher.compare.apply(null, matcherArgs);
          }
        });
      };
    }
  };

  function ContextAddingFilter(message) {
    this.message = message;
  }

  ContextAddingFilter.prototype.modifyFailureMessage = function(msg) {
    var nl = msg.indexOf('\n');

    if (nl === -1) {
      return this.message + ': ' + msg;
    } else {
      return this.message + ':\n' + indent(msg);
    }
  };

  function indent(s) {
    return s.replace(/^/gm, '    ');
  }

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
