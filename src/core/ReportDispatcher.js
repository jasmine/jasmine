getJasmineRequireObj().ReportDispatcher = function(j$) {
  function ReportDispatcher(methods, queueRunnerFactory, onLateError) {
    var dispatchedMethods = methods || [];

    for (var i = 0; i < dispatchedMethods.length; i++) {
      var method = dispatchedMethods[i];
      this[method] = (function(m) {
        return function() {
          dispatch(m, arguments);
        };
      })(method);
    }

    var reporters = [];
    var fallbackReporter = null;

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
      var onComplete = args[args.length - 1];
      args = j$.util.argsToArray(args).splice(0, args.length - 1);
      var fns = [];
      for (var i = 0; i < reporters.length; i++) {
        var reporter = reporters[i];
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
      var fn = reporter[method];
      if (!fn) {
        return;
      }

      var thisArgs = j$.util.cloneArgs(args);
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
