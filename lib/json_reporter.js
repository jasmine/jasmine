JasmineReporters.reporter = function (elementId) {
  var that = {
    element: document.getElementById(elementId),
    output: '',

    addResults: function (results) { that.output = ''; },

    addSpecResults: function (results) { that.output = ''; },

    report: function () {
      if (that.element) {
        that.element.innerHTML += that.output;
      }
      return that.output;
    }
  }

  // TODO: throw if no element?
  if (that.element) {
    that.element.innerHTML = '';
  }

  return that;
}

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