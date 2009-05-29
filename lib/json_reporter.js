/*
 * jasmine.Reporters.JSON --
 *    Basic reporter that keeps a JSON string of the most recent Spec, Suite or Runner
 *    result.  Calling application can then do whatever it wants/needs with the string;
 */
jasmine.Reporters.JSON = function () {
  var toJSON = function(object){
    return JSON.stringify(object);
  };
  var that = jasmine.Reporters.reporter();
  that.specJSON   = '';
  that.suiteJSON  = '';
  that.runnerJSON = '';

  var saveSpecResults = function (spec) {
    that.specJSON = toJSON(spec.getResults());
  };
  that.reportSpecResults = saveSpecResults;
    
  var saveSuiteResults = function (suite) {
    that.suiteJSON = toJSON(suite.getResults());
  };
  that.reportSuiteResults = saveSuiteResults;

  var saveRunnerResults = function (runner) {
    that.runnerJSON = toJSON(runner.getResults());
  };
  that.reportRunnerResults = saveRunnerResults;
  this.log = function (str) {
    console.log(str);
  };

  that.toJSON = toJSON;
  return that;
};
