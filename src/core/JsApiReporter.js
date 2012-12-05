/** JavaScript API reporter.
 *
 * @constructor
 */
jasmine.JsApiReporter = function(jasmine) {
  this.jasmine = jasmine || {};
  this.started = false;
  this.finished = false;
  this.suites_ = [];
  this.results_ = {};
};

jasmine.JsApiReporter.prototype.reportRunnerStarting = function(runner) {
  this.started = true;
  var suites = runner.topLevelSuites();
  for (var i = 0; i < suites.length; i++) {
    var suite = suites[i];
    this.suites_.push(this.summarize_(suite));
  }
};

jasmine.JsApiReporter.prototype.suites = function() {
  return this.suites_;
};

jasmine.JsApiReporter.prototype.summarize_ = function(suiteOrSpec) {
  var isSuite = suiteOrSpec instanceof this.jasmine.Suite;
  var summary = {
    id: suiteOrSpec.id,
    name: suiteOrSpec.description,
    type: isSuite ? 'suite' : 'spec',
    children: []
  };

  if (isSuite) {
    var children = suiteOrSpec.children();
    for (var i = 0; i < children.length; i++) {
      summary.children.push(this.summarize_(children[i]));
    }
  }
  return summary;
};

jasmine.JsApiReporter.prototype.results = function() {
  return this.results_;
};

//noinspection JSUnusedLocalSymbols
jasmine.JsApiReporter.prototype.reportRunnerResults = function(runner) {
  this.finished = true;
};

//noinspection JSUnusedLocalSymbols
jasmine.JsApiReporter.prototype.reportSuiteResults = function(suite) {
};

//noinspection JSUnusedLocalSymbols
jasmine.JsApiReporter.prototype.reportSpecResults = function(result) {
  this.results_[result.id] = {
    messages: result.failedExpectations,
    //result is status
    result: result.status
  };
};

//noinspection JSUnusedLocalSymbols
jasmine.JsApiReporter.prototype.log = function(str) {
};

//TODO: make work with new presenter.
jasmine.JsApiReporter.prototype.resultsForSpecs = function(specIds){
  var results = {};
  for (var i = 0; i < specIds.length; i++) {
    var specId = specIds[i];
    results[specId] = this.summarizeResult_(this.results_[specId]);
  }
  return results;
};

jasmine.JsApiReporter.prototype.summarizeResult_ = function(result){
  var summaryMessages = [];
  var messagesLength = result.messages.length;
  for (var messageIndex = 0; messageIndex < messagesLength; messageIndex++) {
    var resultMessage = result.messages[messageIndex];
    //TODO: use result presenter here, not a bunch of spec crap
    summaryMessages.push({
      //TODO: remove text.
      text: resultMessage.type == 'log' ? resultMessage.toString() : this.jasmine.undefined,
      //TODO: wat? in theory this is saying non-expect results should always be considered passed, but that's weird.
      passed: resultMessage.passed || true, //status === 'passed'
      type: resultMessage.type,
      message: resultMessage.message,
      trace: {
        stack: !resultMessage.passed ? resultMessage.trace.stack : this.jasmine.undefined
      }
    });
  }

  return {
    result : result.result,
    messages : summaryMessages
  };
};

