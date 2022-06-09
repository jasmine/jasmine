getJasmineRequireObj().ReportDispatcher = function(j$) {
  function ReportDispatcher(methods, queueRunnerFactory, onLateError) {
    const dispatchedMethods = methods || [];

    for (const method of dispatchedMethods) {
      this[method] = (function(m) {
        return function() {
          dispatch(m, arguments);
        };
      })(method);
    }

    let reporters = [];
    let fallbackReporter = null;

    this.addReporter = function(reporter) {
      reporters.push(reporter);
    };

    this.provideFallbackReporter = function(reporter) {
      fallbackReporter = reporter;
    };

    this.clearReporters = function() {
      reporters = [];
    };

    return this;

    function dispatch(method, args) {
      if (reporters.length === 0 && fallbackReporter !== null) {
        reporters.push(fallbackReporter);
      }
      const onComplete = args[args.length - 1];
      args = j$.util.argsToArray(args).splice(0, args.length - 1);
      const fns = [];
      for (const reporter of reporters) {
        addFn(fns, reporter, method, args);
      }

      queueRunnerFactory({
        queueableFns: fns,
        onComplete: onComplete,
        isReporter: true,
        onMultipleDone: function() {
          onLateError(
            new Error(
              "An asynchronous reporter callback called its 'done' callback " +
                'more than once.'
            )
          );
        }
      });
    }

    function addFn(fns, reporter, method, args) {
      const fn = reporter[method];
      if (!fn) {
        return;
      }

      const thisArgs = j$.util.cloneArgs(args);
      if (fn.length <= 1) {
        fns.push({
          fn: function() {
            return fn.apply(reporter, thisArgs);
          }
        });
      } else {
        fns.push({
          fn: function(done) {
            return fn.apply(reporter, thisArgs.concat([done]));
          }
        });
      }
    }
  }

  return ReportDispatcher;
};
