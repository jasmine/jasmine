/**
 * @constructor
 */
jasmine.MultiReporter = function() {
  this.subReporters_ = [];
};

jasmine.MultiReporter.prototype.addReporter = function(reporter) {
  this.subReporters_.push(reporter);
};

(function() {
  var functionNames = ["reportRunnerResults", "reportSuiteResults", "reportSpecResults", "log"];
  for (var i = 0; i < functionNames.length; i++) {
    var functionName = functionNames[i];
    jasmine.MultiReporter.prototype[functionName] = (function(functionName) {
      return function() {
        for (var j = 0; j < this.subReporters_.length; j++) {
          this.subReporters_[j][functionName].apply(this.subReporters_[j], arguments);
        }
      };
    })(functionName);
  }
})();
