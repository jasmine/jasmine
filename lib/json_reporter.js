JasmineReporters.JSON = function () {
  var that = {
    results: {},

    addResults: function (results) {
      that.results = results;
    },

    report: function () {
      return Object.toJSON(that.results);
    }
  }
  return that;
}

Jasmine.reporter = JasmineReporters.JSON();
   