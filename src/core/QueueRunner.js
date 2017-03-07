getJasmineRequireObj().QueueRunner = function(j$) {

  function once(fn) {
    var called = false;
    return function() {
      if (!called) {
        called = true;
        fn();
      }
      return null;
    };
  }

  function QueueRunner(attrs) {
    this.queueableFns = attrs.queueableFns || [];
    this.onComplete = attrs.onComplete || function() {};
    this.clearStack = attrs.clearStack || function(fn) {fn();};
    this.onException = attrs.onException || function() {};
    this.catchException = attrs.catchException || function() { return true; };
    this.userContext = attrs.userContext || {};
    this.timeout = attrs.timeout || {setTimeout: setTimeout, clearTimeout: clearTimeout};
    this.fail = attrs.fail || function() {};
  }

  QueueRunner.prototype.execute = function() {
    this.run(this.queueableFns, 0);
  };

  QueueRunner.prototype.run = function(queueableFns, recursiveIndex) {
    var length = queueableFns.length,
      self = this,
      iterativeIndex,
      promise;

    for(iterativeIndex = recursiveIndex; iterativeIndex < length; iterativeIndex++) {
      var queueableFn = queueableFns[iterativeIndex];
      if (queueableFn.fn.length === 0) {
        try {
          // Synchronous tests may return a promise.
          promise = queueableFn.fn.call(self.userContext);
        } catch (e) {
          handleException(e, queueableFn);
        }
        if (promise && typeof promise.then !== 'function') {
          promise = null;
        }
        if (!promise) {
          continue;
        }
      }

      var timeoutId,
        clearTimeout = function() {
          Function.prototype.apply.apply(self.timeout.clearTimeout, [j$.getGlobal(), [timeoutId]]);
        },
        next = once(function() {
          clearTimeout(timeoutId);
          self.run(queueableFns, iterativeIndex + 1);
        });
        next.fail = function() {
          self.fail.apply(null, arguments);
          next();
        };

      if (queueableFn.timeout) {
        timeoutId = Function.prototype.apply.apply(self.timeout.setTimeout, [j$.getGlobal(), [function() {
          var error = new Error('Timeout - Async callback was not invoked within timeout specified by jasmine.DEFAULT_TIMEOUT_INTERVAL.');
          onException(error);
          next();
        }, queueableFn.timeout()]]);
      }

      if (promise) {
        promise.then(next, next.fail);
      } else {
        try {
          queueableFn.fn.call(self.userContext, next);
        } catch (e) {
          handleException(e, queueableFn);
          next();
        }
      }

      // Prevent further iterations until
      // the asynchronous test is finished.
      return;
    }

    this.clearStack(this.onComplete);

    function onException(e) {
      self.onException(e);
    }

    function handleException(e, queueableFn) {
      onException(e);
      if (!self.catchException(e)) {
        //TODO: set a var when we catch an exception and
        //use a finally block to close the loop in a nice way..
        throw e;
      }
    }
  };

  return QueueRunner;
};
