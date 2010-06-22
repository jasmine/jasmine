/** JasmineReporters.reporter
 *    Base object that will get called whenever a Spec, Suite, or Runner is done.  It is up to
 *    descendants of this object to do something with the results (see json_reporter.js)
 *
 * @deprecated
 */
jasmine.Reporters = {};

/**
 * @deprecated
 * @param callbacks
 */
jasmine.Reporters.reporter = function(callbacks) {
  /**
   * @deprecated
   * @param callbacks
   */
  var that = {
    callbacks: callbacks || {},

    doCallback: function(callback, results) {
      if (callback) {
        callback(results);
      }
    },

    reportRunnerResults: function(runner) {
      that.doCallback(that.callbacks.runnerCallback, runner);
    },
    reportSuiteResults:  function(suite) {
      that.doCallback(that.callbacks.suiteCallback, suite);
    },
    reportSpecResults:   function(spec) {
      that.doCallback(that.callbacks.specCallback, spec);
    },
    log: function (str) {
      var console = jasmine.getGlobal().console;
      if (console && console.log) console.log(str);
    }
  };

  return that;
};

