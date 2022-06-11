getJasmineRequireObj().QueueRunner = function(j$) {
  let nextid = 1;

  function StopExecutionError() {}
  StopExecutionError.prototype = new Error();
  j$.StopExecutionError = StopExecutionError;

  function once(fn, onTwice) {
    let called = false;
    return function(arg) {
      if (called) {
        if (onTwice) {
          onTwice();
        }
      } else {
        called = true;
        // Direct call using single parameter, because cleanup/next does not need more
        fn(arg);
      }
      return null;
    };
  }

  function fallbackOnMultipleDone() {
    console.error(
      new Error(
        "An asynchronous function called its 'done' " +
          'callback more than once, in a QueueRunner without a onMultipleDone ' +
          'handler.'
      )
    );
  }

  function emptyFn() {}

  function QueueRunner(attrs) {
    this.id_ = nextid++;
    this.queueableFns = attrs.queueableFns || [];
    this.onComplete = attrs.onComplete || emptyFn;
    this.clearStack =
      attrs.clearStack ||
      function(fn) {
        fn();
      };
    this.onException = attrs.onException || emptyFn;
    this.onMultipleDone = attrs.onMultipleDone || fallbackOnMultipleDone;
    this.userContext = attrs.userContext || new j$.UserContext();
    this.timeout = attrs.timeout || {
      setTimeout: setTimeout,
      clearTimeout: clearTimeout
    };
    this.fail = attrs.fail || emptyFn;
    this.globalErrors = attrs.globalErrors || {
      pushListener: emptyFn,
      popListener: emptyFn
    };

    const SkipPolicy = attrs.SkipPolicy || j$.NeverSkipPolicy;
    this.skipPolicy_ = new SkipPolicy(this.queueableFns);
    this.errored_ = false;

    if (typeof this.onComplete !== 'function') {
      throw new Error('invalid onComplete ' + JSON.stringify(this.onComplete));
    }
    this.deprecated = attrs.deprecated;
  }

  QueueRunner.prototype.execute = function() {
    this.handleFinalError = (message, source, lineno, colno, error) => {
      // Older browsers would send the error as the first parameter. HTML5
      // specifies the the five parameters above. The error instance should
      // be preffered, otherwise the call stack would get lost.
      this.onException(error || message);
    };
    this.globalErrors.pushListener(this.handleFinalError);
    this.run(0);
  };

  QueueRunner.prototype.clearTimeout = function(timeoutId) {
    Function.prototype.apply.apply(this.timeout.clearTimeout, [
      j$.getGlobal(),
      [timeoutId]
    ]);
  };

  QueueRunner.prototype.setTimeout = function(fn, timeout) {
    return Function.prototype.apply.apply(this.timeout.setTimeout, [
      j$.getGlobal(),
      [fn, timeout]
    ]);
  };

  QueueRunner.prototype.attempt = function attempt(iterativeIndex) {
    let timeoutId;
    let timedOut;
    let completedSynchronously = true;

    const onException = e => {
      this.onException(e);
      this.recordError_(iterativeIndex);
    };

    function handleError(error) {
      // TODO probably shouldn't next() right away here.
      // That makes debugging async failures much more confusing.
      onException(error);
    }
    const cleanup = once(() => {
      if (timeoutId !== void 0) {
        this.clearTimeout(timeoutId);
      }
      this.globalErrors.popListener(handleError);
    });
    const next = once(
      err => {
        cleanup();

        if (typeof err !== 'undefined') {
          if (!(err instanceof StopExecutionError) && !err.jasmineMessage) {
            this.fail(err);
          }
          this.recordError_(iterativeIndex);
        }

        const runNext = () => {
          this.run(this.nextFnIx_(iterativeIndex));
        };

        if (completedSynchronously) {
          this.setTimeout(runNext);
        } else {
          runNext();
        }
      },
      () => {
        try {
          if (!timedOut) {
            this.onMultipleDone();
          }
        } catch (error) {
          // Any error we catch here is probably due to a bug in Jasmine,
          // and it's not likely to end up anywhere useful if we let it
          // propagate. Log it so it can at least show up when debugging.
          console.error(error);
        }
      }
    );
    timedOut = false;
    const queueableFn = this.queueableFns[iterativeIndex];

    next.fail = function nextFail() {
      this.fail.apply(null, arguments);
      this.recordError_(iterativeIndex);
      next();
    }.bind(this);

    this.globalErrors.pushListener(handleError);

    if (queueableFn.timeout !== undefined) {
      const timeoutInterval =
        queueableFn.timeout || j$.DEFAULT_TIMEOUT_INTERVAL;
      timeoutId = this.setTimeout(function() {
        timedOut = true;
        const error = new Error(
          'Timeout - Async function did not complete within ' +
            timeoutInterval +
            'ms ' +
            (queueableFn.timeout
              ? '(custom timeout)'
              : '(set by jasmine.DEFAULT_TIMEOUT_INTERVAL)')
        );
        // TODO Need to decide what to do about a successful completion after a
        //   timeout. That should probably not be a deprecation, and maybe not
        //   an error in 4.0. (But a diagnostic of some sort might be helpful.)
        onException(error);
        next();
      }, timeoutInterval);
    }

    try {
      let maybeThenable;

      if (queueableFn.fn.length === 0) {
        maybeThenable = queueableFn.fn.call(this.userContext);

        if (maybeThenable && j$.isFunction_(maybeThenable.then)) {
          maybeThenable.then(
            wrapInPromiseResolutionHandler(next),
            onPromiseRejection
          );
          completedSynchronously = false;
          return { completedSynchronously: false };
        }
      } else {
        maybeThenable = queueableFn.fn.call(this.userContext, next);
        this.diagnoseConflictingAsync_(queueableFn.fn, maybeThenable);
        completedSynchronously = false;
        return { completedSynchronously: false };
      }
    } catch (e) {
      onException(e);
      this.recordError_(iterativeIndex);
    }

    cleanup();
    return { completedSynchronously: true };

    function onPromiseRejection(e) {
      onException(e);
      next();
    }
  };

  QueueRunner.prototype.run = function(recursiveIndex) {
    const length = this.queueableFns.length;

    for (
      let iterativeIndex = recursiveIndex;
      iterativeIndex < length;
      iterativeIndex = this.nextFnIx_(iterativeIndex)
    ) {
      const result = this.attempt(iterativeIndex);

      if (!result.completedSynchronously) {
        return;
      }
    }

    this.clearStack(() => {
      this.globalErrors.popListener(this.handleFinalError);

      if (this.errored_) {
        this.onComplete(new StopExecutionError());
      } else {
        this.onComplete();
      }
    });
  };

  QueueRunner.prototype.nextFnIx_ = function(currentFnIx) {
    const result = this.skipPolicy_.skipTo(currentFnIx);

    if (result === currentFnIx) {
      throw new Error("Can't skip to the same queueable fn that just finished");
    }

    return result;
  };

  QueueRunner.prototype.recordError_ = function(currentFnIx) {
    this.errored_ = true;
    this.skipPolicy_.fnErrored(currentFnIx);
  };

  QueueRunner.prototype.diagnoseConflictingAsync_ = function(fn, retval) {
    if (retval && j$.isFunction_(retval.then)) {
      // Issue a warning that matches the user's code.
      // Omit the stack trace because there's almost certainly no user code
      // on the stack at this point.
      if (j$.isAsyncFunction_(fn)) {
        this.onException(
          'An asynchronous before/it/after ' +
            'function was defined with the async keyword but also took a ' +
            'done callback. Either remove the done callback (recommended) or ' +
            'remove the async keyword.'
        );
      } else {
        this.onException(
          'An asynchronous before/it/after ' +
            'function took a done callback but also returned a promise. ' +
            'Either remove the done callback (recommended) or change the ' +
            'function to not return a promise.'
        );
      }
    }
  };

  function wrapInPromiseResolutionHandler(fn) {
    return function(maybeArg) {
      if (j$.isError_(maybeArg)) {
        fn(maybeArg);
      } else {
        fn();
      }
    };
  }

  return QueueRunner;
};
