JasmineReporters.JSON = function (elementId) {
  var that = JasmineReporters.reporter(elementId);

  that.reportRunnerResults = function (results) {
    that.output = Object.toJSON(results);
    
    if (that.element) {
        that.element.innerHTML += that.output;
      }
   }

  return that;
}

JasmineReporters.IncrementalJSON = function (elementId) {
  var that = JasmineReporters.reporter(elementId);

  that.reportSpecResults = function (results) {
    that.output = Object.toJSON(results);
    if (that.element) {
        that.element.innerHTML += that.output;
      }
  }

  return that;
}

