JasmineReporters.JSON = function (elementId) {
  var that = JasmineReporters.reporter(elementId);

  that.addResults = function (results) {
    that.output = Object.toJSON(results);
  }

  return that;
}

JasmineReporters.IncrementalJSON = function (elementId) {
  var that = JasmineReporters.reporter(elementId);

  that.addSpecResults = function (results) {
    that.output = Object.toJSON(results);
  }

  return that;
}