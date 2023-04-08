getJasmineRequireObj().ParallelReportDispatcher = function(j$) {
  /**
   * @class ParallelReportDispatcher
   * @implements Reporter
   * @classdesc A report dispatcher packaged for convenient use from outside jasmine-core.
   *
   * This is intended to help packages like `jasmine` (the Jasmine runner for
   * Node.js) do their own report dispatching in order to support parallel
   * execution. If you aren't implementing a runner package that supports
   * parallel execution, this class probably isn't what you're looking for.
   *
   * Warning: Do not use ParallelReportDispatcher in the same process that
   * Jasmine specs run in. Doing so will break Jasmine's error handling.
   * @param onError {function} Function called when an unhandled exception, unhandled promise rejection, or explicit reporter failure occurs
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
      /**
       * Adds a reporter to the list of reporters that events will be dispatched to.
       * @function
       * @name ParallelReportDispatcher#addReporter
       * @param {Reporter} reporterToAdd The reporter to be added.
       * @see custom_reporter
       */
      addReporter: dispatcher.addReporter.bind(dispatcher),
      /**
       * Clears all registered reporters.
       * @function
       * @name ParallelReportDispatcher#clearReporters
       */
      clearReporters: dispatcher.clearReporters.bind(dispatcher),
      /**
       * Installs a global error handler. After this method is called, any
       * unhandled exceptions or unhandled promise rejections will be passed to
       * the onError callback that was passed to the constructor.
       * @function
       * @name ParallelReportDispatcher#installGlobalErrors
       */
      installGlobalErrors: globalErrors.install.bind(globalErrors),
      /**
       * Uninstalls the global error handler.
       * @function
       * @name ParallelReportDispatcher#uninstallGlobalErrors
       */
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
