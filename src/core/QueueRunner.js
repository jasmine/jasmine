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
    this.globalErrors = attrs.globalErrors || { pushListener: function() {}, popListener: function() {} };
  }

  QueueRunner.prototype.execute = function() {
    var self = this;
    this.handleFinalError = function(error) {
      self.onException(error);
    };
    this.globalErrors.pushListener(this.handleFinalError);
    this.run(this.queueableFns, 0);
  };

  QueueRunner.prototype.run = function(queueableFns, recursiveIndex) {
    var length = queueableFns.length,
      self = this,
      iterativeIndex;


    for(iterativeIndex = recursiveIndex; iterativeIndex < length; iterativeIndex++) {
      var queueableFn = queueableFns[iterativeIndex];
      var completedSynchronously = attempt(queueableFn);

      if (!completedSynchronously) {
        return;
      }
    }

    this.clearStack(function() {
      self.globalErrors.popListener(self.handleFinalError);
      self.onComplete();
    });

    function attempt(queueableFn) {
      var clearTimeout = function () {
          Function.prototype.apply.apply(self.timeout.clearTimeout, [j$.getGlobal(), [timeoutId]]);
        },
        setTimeout = function(delayedFn, delay) {
          return Function.prototype.apply.apply(self.timeout.setTimeout, [j$.getGlobal(), [delayedFn, delay]]);
        },
        completedSynchronously = true,
        handleError = function(error) {
          onException(error);
          next();
        },
        cleanup = once(function() {
          clearTimeout(timeoutId);
          self.globalErrors.popListener(handleError);
        }),
        next = once(function () {
          cleanup();
          if (completedSynchronously) {
            setTimeout(function() {
              self.run(queueableFns, iterativeIndex + 1);
            });
          } else {
            self.run(queueableFns, iterativeIndex + 1);
          }
        }),
        timeoutId;

      next.fail = function() {
        try {
          self.fail.apply(null, arguments);
        } catch (e) {
          // this was either a j$.errors.ExpectationFailed or a fatal error adding a failed expectation
          // in either case we skip all subsequent queued functions
          iterativeIndex = length;
        }
        next();
      };

      self.globalErrors.pushListener(handleError);

      if (queueableFn.timeout) {
        timeoutId = setTimeout(function() {
          var error = new Error('Timeout - Async callback was not invoked within timeout specified by jasmine.DEFAULT_TIMEOUT_INTERVAL.');
          onException(error);
          next();
        }, queueableFn.timeout());
      }

      try {
        if (queueableFn.fn.length === 0) {
          var maybeThenable = queueableFn.fn.call(self.userContext);

          if (maybeThenable && j$.isFunction_(maybeThenable.then)) {
            maybeThenable.then(next, next.fail);
            completedSynchronously = false;
            return false;
          }
        } else {
          queueableFn.fn.call(self.userContext, next);
          completedSynchronously = false;
          return false;
        }
      } catch (e) {
        handleException(e, queueableFn);
      }

      cleanup();
      return true;
    }

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
