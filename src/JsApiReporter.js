jasmine.JsApiReporter = (function(){ 
	var _this = this /* @private scoped reference to "this".  (Avoids confusion/mistakes when scope of "this" changes due to events, apply, call, etc. */
		, _undefined_  = jasmine.___undefined___ /* @private scoped reference to "undefined" */
	;

	/** JavaScript API reporter.
	 *
	 * @constructor
	 */
	
	function _JsApiReporter() {
	  this.started = false;
	  this.finished = false;
	  this.suites_ = [];
	  this.results_ = {};
	};
	
	_JsApiReporter.prototype.reportRunnerStarting = function(runner) {
	  this.started = true;
	  var suites = runner.topLevelSuites();
	  for (var i = 0; i < suites.length; i++) {
	    var suite = suites[i];
	    this.suites_.push(this.summarize_(suite));
	  }
	};
	
	_JsApiReporter.prototype.suites = function() {
	  return this.suites_;
	};
	
	_JsApiReporter.prototype.summarize_ = function(suiteOrSpec) {
	  var isSuite = suiteOrSpec instanceof jasmine.Suite;
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
	
	_JsApiReporter.prototype.results = function() {
	  return this.results_;
	};
	
	_JsApiReporter.prototype.resultsForSpec = function(specId) {
	  return this.results_[specId];
	};
	
	//noinspection JSUnusedLocalSymbols
	_JsApiReporter.prototype.reportRunnerResults = function(runner) {
	  this.finished = true;
	};
	
	//noinspection JSUnusedLocalSymbols
	_JsApiReporter.prototype.reportSuiteResults = function(suite) {
	};
	
	//noinspection JSUnusedLocalSymbols
	_JsApiReporter.prototype.reportSpecResults = function(spec) {
	  this.results_[spec.id] = {
	    messages: spec.results().getItems(),
	    result: spec.results().failedCount > 0 ? "failed" : "passed"
	  };
	};
	
	//noinspection JSUnusedLocalSymbols
	_JsApiReporter.prototype.log = function(str) {
	};
	
	_JsApiReporter.prototype.resultsForSpecs = function(specIds){
	  var results = {};
	  for (var i = 0; i < specIds.length; i++) {
	    var specId = specIds[i];
	    results[specId] = this.summarizeResult_(this.results_[specId]);
	  }
	  return results;
	};
	
	_JsApiReporter.prototype.summarizeResult_ = function(result){
	  var summaryMessages = [];
	  var messagesLength = result.messages.length;
	  for (var messageIndex = 0; messageIndex < messagesLength; messageIndex++) {
	    var resultMessage = result.messages[messageIndex];
	    summaryMessages.push({
	      text: resultMessage.type == 'log' ? resultMessage.toString() : _undefined_,
	      passed: resultMessage.passed ? resultMessage.passed() : true,
	      type: resultMessage.type,
	      message: resultMessage.message,
	      trace: {
	        stack: resultMessage.passed && !resultMessage.passed() ? resultMessage.trace.stack : _undefined_
	      }
	    });
	  }
	
	  return {
	    result : result.result,
	    messages : summaryMessages
	  };
	};
	
	return _JsApiReporter;

})();

