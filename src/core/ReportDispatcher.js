getJasmineRequireObj().ReportDispatcher = function(j$) {
  'use strict';

  function ReportDispatcher(methods, runQueue, onLateError) {
    const dispatchedMethods = methods || [];

    for (const method of dispatchedMethods) {
      this[method] = (function(m) {
        return function(event) {
          return dispatch(m, event);
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

    function dispatch(method, event) {
      if (reporters.length === 0 && fallbackReporter !== null) {
        reporters.push(fallbackReporter);
      }
      const fns = [];
      for (const reporter of reporters) {
        addFn(fns, reporter, method, event);
      }

      return new Promise(function(resolve) {
        runQueue({
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

    function addFn(fns, reporter, method, event) {
      const fn = reporter[method];
      if (!fn) {
        return;
      }

      const thisEvent = j$.util.clone(event);
      if (fn.length <= 1) {
        fns.push({
          fn: function() {
            return fn.call(reporter, thisEvent);
          }
        });
      } else {
        fns.push({
          fn: function(done) {
            return fn.call(reporter, thisEvent, done);
          }
        });
      }
    }
  }

  return ReportDispatcher;
};
