getJasmineRequireObj().ParallelReportDispatcher = function(j$) {
  /*
    A report dispatcher packaged for convenient use from outside jasmine-core.

    This isn't part of the public interface, but it is used by
    jasmine-npm. -core and -npm version in lockstep at the major and minor
    levels but version independently at the patch level. Any changes that
    would break -npm should be done in a major or minor release, never a
    patch release, and accompanied by a change to -npm that's released in
    the same version.
   */
  function ParallelReportDispatcher(onError, deps = {}) {
    const ReportDispatcher = deps.ReportDispatcher || j$.ReportDispatcher;
    const QueueRunner = deps.QueueRunner || j$.QueueRunner;
    const globalErrors = deps.globalErrors || new j$.GlobalErrors();
    const dispatcher = ReportDispatcher(
      j$.reporterEvents,
      function(queueRunnerOptions) {
        queueRunnerOptions = {
          ...queueRunnerOptions,
          globalErrors,
          timeout: { setTimeout, clearTimeout },
          fail: function(error) {
            // A callback-style async reporter called either done.fail()
            // or done(anError).
            if (!error) {
              error = new Error('A reporter called done.fail()');
            }

            onError(error);
          },
          onException: function(error) {
            // A reporter method threw an exception or returned a rejected
            // promise, or there was an unhandled exception or unhandled promise
            // rejection while an asynchronous reporter method was running.
            onError(error);
          }
        };
        new QueueRunner(queueRunnerOptions).execute();
      },
      function(error) {
        // A reporter called done() more than once.
        onError(error);
      }
    );

    const self = {
      addReporter: dispatcher.addReporter.bind(dispatcher),
      clearReporters: dispatcher.clearReporters.bind(dispatcher),
      installGlobalErrors: globalErrors.install.bind(globalErrors),
      uninstallGlobalErrors: function() {
        // late-bind uninstall because it doesn't exist until install is called
        globalErrors.uninstall(globalErrors);
      }
    };

    for (const eventName of j$.reporterEvents) {
      self[eventName] = dispatcher[eventName].bind(dispatcher);
    }

    return self;
  }

  return ParallelReportDispatcher;
};
