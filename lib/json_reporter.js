JasmineReporters.JSON = function (elementId) {
  var that = {
    elementId: elementId,
    results: {},

    addResults: function (results) {
      that.results = results;
    },

    report: function () {
      var output = Object.toJSON(that.results);

      if (that.elementId) {
        var element = document.getElementById(that.elementId);
        if (element) {
          element.innerHTML = output;
        }
      }
      return output;
    }
  }
  return that;
}

Jasmine.reporter = JasmineReporters.JSON();
   