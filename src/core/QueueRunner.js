getJasmineRequireObj().QueueRunner = function(j$) {
  function StopExecutionError() {}
  StopExecutionError.prototype = new Error();
  j$.StopExecutionError = StopExecutionError;

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
    this.userContext = attrs.userContext || new j$.UserContext();
    this.timeout = attrs.timeout || {setTimeout: setTimeout, clearTimeout: clearTimeout};
    this.fail = attrs.fail || function() {};
    this.globalErrors = attrs.globalErrors || { pushListener: function() {}, popListener: function() {} };
    this.completeOnFirstError = !!attrs.completeOnFirstError;
    this.errored = false;

    if (typeof(this.onComplete) !== 'function') {
      throw new Error('invalid onComplete ' + JSON.stringify(this.onComplete));
    }
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

  QueueRunner.prototype.clearTimeout = function(timeoutId) {
    Function.prototype.apply.apply(this.timeout.clearTimeout, [j$.getGlobal(), [timeoutId]]);
  };

  QueueRunner.prototype.setTimeout = function(fn, timeout) {
    return Function.prototype.apply.apply(this.timeout.setTimeout, [j$.getGlobal(), [fn, timeout]]);
  };

  QueueRunner.prototype.attempt = function attempt(iterativeIndex) {
    var self = this, completedSynchronously = true,
      handleError = function handleError(error) {
        onException(error);
        next(error);
      },
      cleanup = once(function cleanup() {
        self.clearTimeout(timeoutId);
        self.globalErrors.popListener(handleError);
      }),
      next = once(function next(err) {
        cleanup();

        if (j$.isError_(err)) {
          if (!(err instanceof StopExecutionError)) {
            self.fail(err);
          }
          self.errored = errored = true;
        }

        function runNext() {
          if (self.completeOnFirstError && errored) {
            self.skipToCleanup(iterativeIndex);
          } else {
            self.run(iterativeIndex + 1);
          }
        }

        if (completedSynchronously) {
          self.setTimeout(runNext);
        } else {
          runNext();
        }
      }),
      errored = false,
      queueableFn = self.queueableFns[iterativeIndex],
      timeoutId;

    next.fail = function nextFail() {
      self.fail.apply(null, arguments);
      self.errored = errored = true;
      next();
    };

    self.globalErrors.pushListener(handleError);

    if (queueableFn.timeout !== undefined) {
      var timeoutInterval = queueableFn.timeout || j$.DEFAULT_TIMEOUT_INTERVAL;
      timeoutId = self.setTimeout(function() {
        var error = new Error(
          'Timeout - Async callback was not invoked within ' + timeoutInterval + 'ms ' +
          (queueableFn.timeout ? '(custom timeout)' : '(set by jasmine.DEFAULT_TIMEOUT_INTERVAL)')
        );
        onException(error);
        next();
      }, timeoutInterval);
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
      onException(e);
      self.errored = errored = true;
    }

    cleanup();
    return { completedSynchronously: true, errored: errored };

    function onException(e) {
      self.onException(e);
      self.errored = errored = true;
    }

    function onPromiseRejection(e) {
      onException(e);
      next();
    }
  };

  QueueRunner.prototype.run = function(recursiveIndex) {
    var length = this.queueableFns.length,
      self = this,
      iterativeIndex;


    for(iterativeIndex = recursiveIndex; iterativeIndex < length; iterativeIndex++) {
      var result = this.attempt(iterativeIndex);

      if (!result.completedSynchronously) {
        return;
      }

      self.errored = self.errored || result.errored;

      if (this.completeOnFirstError && result.errored) {
        this.skipToCleanup(iterativeIndex);
        return;
      }
    }

    this.clearStack(function() {
      self.globalErrors.popListener(self.handleFinalError);
      self.onComplete(self.errored && new StopExecutionError());
    });

  };

  return QueueRunner;
};
