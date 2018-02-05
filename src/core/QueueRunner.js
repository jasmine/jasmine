getJasmineRequireObj().QueueRunner = function(j$) {

  function once(fn) {
    var called = false;
    return function() {
      if (!called) {
        called = true;
        fn.apply(null, arguments);
      }
      return null;
    };
  }

  function QueueRunner(attrs) {
    var queueableFns = attrs.queueableFns || [];
    this.queueableFns = queueableFns.concat(attrs.cleanupFns || []);
    this.firstCleanupIx = queueableFns.length;
    this.onComplete = attrs.onComplete || function() {};
    this.clearStack = attrs.clearStack || function(fn) {fn();};
    this.onException = attrs.onException || function() {};
    this.catchException = attrs.catchException || function() { return true; };
    this.userContext = attrs.userContext || new j$.UserContext();
    this.timeout = attrs.timeout || {setTimeout: setTimeout, clearTimeout: clearTimeout};
    this.fail = attrs.fail || function() {};
    this.globalErrors = attrs.globalErrors || { pushListener: function() {}, popListener: function() {} };
    this.completeOnFirstError = !!attrs.completeOnFirstError;
    this.deprecated = attrs.deprecated;
  }

  QueueRunner.prototype.execute = function() {
    var self = this;
    this.handleFinalError = function(error) {
      self.onException(error);
    };
    this.globalErrors.pushListener(this.handleFinalError);
    this.run(0);
  };

  QueueRunner.prototype.skipToCleanup = function(lastRanIndex) {
    if (lastRanIndex < this.firstCleanupIx) {
      this.run(this.firstCleanupIx);
    } else {
      this.run(lastRanIndex + 1);
    }
  };

  QueueRunner.prototype.run = function(recursiveIndex) {
    var length = this.queueableFns.length,
      self = this,
      iterativeIndex;


    for(iterativeIndex = recursiveIndex; iterativeIndex < length; iterativeIndex++) {
      var result = attempt(iterativeIndex);

      if (!result.completedSynchronously) {
        return;
      }

      if (this.completeOnFirstError && result.errored) {
        this.skipToCleanup(iterativeIndex);
        return;
      }
    }

    this.clearStack(function() {
      self.globalErrors.popListener(self.handleFinalError);
      self.onComplete();
    });

    function attempt() {
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
        next = once(function (err) {
          cleanup();

          if (err instanceof Error) {
            self.deprecated('done callback received an Error object. Jasmine 3.0 will treat this as a failure');
          }

          function runNext() {
            if (self.completeOnFirstError && errored) {
              self.skipToCleanup(iterativeIndex);
            } else {
              self.run(iterativeIndex + 1);
            }
          }

          if (completedSynchronously) {
            setTimeout(runNext);
          } else {
            runNext();
          }
        }),
        errored = false,
        queueableFn = self.queueableFns[iterativeIndex],
        timeoutId;

      next.fail = function() {
        self.fail.apply(null, arguments);
        errored = true;
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
            maybeThenable.then(next, onPromiseRejection);
            completedSynchronously = false;
            return { completedSynchronously: false };
          }
        } else {
          queueableFn.fn.call(self.userContext, next);
          completedSynchronously = false;
          return { completedSynchronously: false };
        }
      } catch (e) {
        handleException(e, queueableFn);
        errored = true;
      }

      cleanup();
      return { completedSynchronously: true, errored: errored };

      function onException(e) {
        self.onException(e);
        errored = true;
      }

      function onPromiseRejection(e) {
        onException(e);
        next();
      }

      function handleException(e, queueableFn) {
        onException(e);
        if (!self.catchException(e)) {
          //TODO: set a var when we catch an exception and
          //use a finally block to close the loop in a nice way..
          throw e;
        }
      }
    }
  };

  return QueueRunner;
};
