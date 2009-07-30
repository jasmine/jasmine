/** JavaScript API reporter.
 *
 * @constructor
 */
jasmine.JsApiReporter = function() {
  this.started = false;
  this.finished = false;
  this.suites = [];
  this.results = {};
};

jasmine.JsApiReporter.prototype.reportRunnerStarting = function(runner) {
  this.started = true;

  for (var i = 0; i < runner.suites.length; i++) {
    var suite = runner.suites[i];
    this.suites.push(this.summarize_(suite));
  }
};

jasmine.JsApiReporter.prototype.summarize_ = function(suiteOrSpec) {
  var summary = {
    id: suiteOrSpec.id,
    name: suiteOrSpec.description,
    type: suiteOrSpec instanceof jasmine.Suite ? 'suite' : 'spec',
    children: []
  };

  if (suiteOrSpec.specs) {
    for (var i = 0; i < suiteOrSpec.specs.length; i++) {
      summary.children.push(this.summarize_(suiteOrSpec.specs[i]));
    }
  }

  return summary;
};

//noinspection JSUnusedLocalSymbols
jasmine.JsApiReporter.prototype.reportRunnerResults = function(runner) {
  this.finished = true;
};

//noinspection JSUnusedLocalSymbols
jasmine.JsApiReporter.prototype.reportSuiteResults = function(suite) {
};

//noinspection JSUnusedLocalSymbols
jasmine.JsApiReporter.prototype.reportSpecResults = function(spec) {
  this.results[spec.id] = {
    messages: spec.results.getItems(),
    result: spec.results.failedCount > 0 ? "failed" : "passed"
  };
};

//noinspection JSUnusedLocalSymbols
jasmine.JsApiReporter.prototype.log = function(str) {
};

