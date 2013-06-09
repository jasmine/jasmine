getJasmineRequireObj().JsApiReporter = function() {
  function JsApiReporter(jasmine) {  // TODO: this doesn't appear to be used
    this.jasmine = jasmine || {};
    this.started = false;
    this.finished = false;

    var status = 'loaded';

    this.jasmineStarted = function() {
      this.started = true;
      status = 'started';
    };

    var executionTime;

    this.jasmineDone = function(options) {
      this.finished = true;
      executionTime = options.executionTime;
      status = 'done';
    };

    this.status = function() {
      return status;
    };

    var suites = {};

    this.suiteStarted = function(result) {
      storeSuite(result);
    };

    this.suiteDone = function(result) {
      storeSuite(result);
    };

    function storeSuite(result) {
      suites[result.id] = result;
    }

    this.suites = function() {
      return suites;
    };

    var specs = [];
    this.specStarted = function(result) { };

    this.specDone = function(result) {
      specs.push(result);
    };

    this.specResults = function(index, length) {
      return specs.slice(index, index + length);
    };

    this.specs = function() {
      return specs;
    };

    this.executionTime = function() {
      return executionTime;
    };

  }

  return JsApiReporter;
};
