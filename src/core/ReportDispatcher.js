getJasmineRequireObj().ReportDispatcher = function(j$) {
  /*
    ReportDispatcher isn't part of the public interface, but it is used by
    jasmine-npm. -core and -npm version in lockstep at the major and minor
    levels but version independently at the patch level. Any changes that
    would break -npm should be done in a major or minor release, never a
    patch release, and accompanied by a change to -npm that's released in
    the same version.
   */

  function ReportDispatcher(methods, queueRunnerFactory, onLateError) {
    const dispatchedMethods = methods || [];

    for (const method of dispatchedMethods) {
      this[method] = (function(m) {
        return function() {
          return dispatch(m, arguments);
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
      const fns = [];
      for (const reporter of reporters) {
        addFn(fns, reporter, method, args);
      }

      return new Promise(function(resolve) {
        queueRunnerFactory({
          queueableFns: fns,
          onComplete: resolve,
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
