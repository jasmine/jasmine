jasmine.JsApiReporter = function(jasmine) {
  this.jasmine = jasmine || {};
  this.started = false;
  this.finished = false;
  this.suites_ = [];
  this.results_ = {};

  var status = 'loaded';

  this.jasmineStarted = function() {
    this.started = true;
    status = 'started';
  };

  this.jasmineDone = function() {
    this.finished = true;
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

  var specs = {};

  this.specStarted = function(result) {
    storeSpec(result);
  };

  this.specDone = function(result) {
    storeSpec(result);
  };

  function storeSpec(result) {
    specs[result.id] = result;
  }

  this.specs = function() {
    return specs;
  };

};