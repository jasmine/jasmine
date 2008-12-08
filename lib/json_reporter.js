/*
 * JasmineReporters.JSON --
 *    Basic reporter that keeps a JSON string of the most recent Spec, Suite or Runner
 *    result.  Calling application can then do whatever it wants/needs with the string;
 */
Jasmine.Reporters.JSON = function () {
  var that = Jasmine.Reporters.reporter();
  that.specJSON   = '';
  that.suiteJSON  = '';
  that.runnerJSON = '';

  var saveSpecResults = function (results) {
    that.specJSON = Object.toJSON(results);
  }
  that.reportSpecResults = saveSpecResults;
    
  var saveSuiteResults = function (results) {
    that.suiteJSON = Object.toJSON(results);
  }
  that.reportSuiteResults = saveSuiteResults;

  var saveRunnerResults = function (results) {
    that.runnerJSON = Object.toJSON(results);
  }
  that.reportRunnerResults = saveRunnerResults;

  return that;
}

Jasmine.Reporters.domWriter = function (elementId) {
  var that = {
    element: document.getElementById(elementId),

    write: function (text) {
      if (that.element) {
        that.element.innerHTML += text;
      }
    }
  }

  that.element.innerHTML = '';

  return that;
}

Jasmine.Reporters.JSONtoDOM = function (elementId) {
  var that = Jasmine.Reporters.JSON();

  that.domWriter = Jasmine.Reporters.domWriter(elementId);

  var writeRunnerResults = function (results) {
    that.domWriter.write(Object.toJSON(results));
  };

  that.reportRunnerResults = writeRunnerResults;

  return that;
}
