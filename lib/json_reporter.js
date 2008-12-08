/*
 * JasmineReporters.JSON --
 *    Basic reporter that keeps a JSON string of the most recent Spec, Suite or Runner
 *    result.  Calling application can then do whatever it wants/needs with the string;
 */
JasmineReporters.JSON = function () {
  var that = JasmineReporters.reporter();
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

var domWriter = function (elementId) {
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

JasmineReporters.JSONtoDOM = function (elementId) {
  var that = JasmineReporters.JSON();

  that.domWriter = domWriter(elementId);

  var writeRunnerResults = function (results) {
    that.domWriter.write(Object.toJSON(results));
  };

  that.reportRunnerResults = writeRunnerResults;

  return that;
}


//JasmineReporters.IncrementalJSON = function (elementId) {
//  var that = JasmineReporters.reporter(elementId);
//
//  that.reportSpecResults = function (results) {
//    that.output = Object.toJSON(results);
//    if (that.element) {
//      that.element.innerHTML += that.output;
//    }
//  }
//
//  return that;
//}

