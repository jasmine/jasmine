/**
 * Internal representation of a Jasmine suite.
 *
 * @constructor
 * @param {jasmine.Env} env
 * @param {String} description
 * @param {Function} specDefinitions
 * @param {jasmine.Suite} parentSuite
 */
jasmine.Suite = function(env, description, specDefinitions, parentSuite, queueFactory, isSuite) {
  var self = this;
  //TODO: remove once we unit test Suite
  var queueFactory = queueFactory || function() {};
  self.id = env.nextSuiteId ? env.nextSuiteId() : null;
  self.description = description;
  self.queue = queueFactory();
  self.parentSuite = parentSuite;
  self.env = env;
  self.isSuite = isSuite || function() {};
  self.before_ = [];
  self.after_ = [];
  self.children_ = [];
  self.suites_ = [];
  self.specs_ = [];
};

jasmine.Suite.prototype.getFullName = function() {
  var fullName = this.description;
  for (var parentSuite = this.parentSuite; parentSuite; parentSuite = parentSuite.parentSuite) {
    fullName = parentSuite.description + ' ' + fullName;
  }
  return fullName;
};

jasmine.Suite.prototype.finish = function(onComplete) {
  this.env.reporter.reportSuiteResults(this);
  this.finished = true;
  if (typeof(onComplete) == 'function') {
    onComplete();
  }
};

jasmine.Suite.prototype.beforeEach = function(beforeEachFunction) {
  beforeEachFunction.typeName = 'beforeEach';
  this.before_.unshift(beforeEachFunction);
};

jasmine.Suite.prototype.afterEach = function(afterEachFunction) {
  afterEachFunction.typeName = 'afterEach';
  this.after_.unshift(afterEachFunction);
};

//TODO: interface should be addSpec or addSuite methods.
jasmine.Suite.prototype.add = function(suiteOrSpec) {
  this.children_.push(suiteOrSpec);
  if (this.isSuite(suiteOrSpec)) {
    this.suites_.push(suiteOrSpec);
    this.env.currentRunner().addSuite(suiteOrSpec);
  } else {
    this.specs_.push(suiteOrSpec);
  }
  this.queue.add(suiteOrSpec);
};

jasmine.Suite.prototype.specComplete = function(specResult) {
  specResult.fullName = this.getFullName() + ' ' + specResult.description + '.';
  specResult.suite = this;
  this.env.removeAllSpies();
  this.env.reporter.reportSpecResults(specResult);
  this.queue.incrementQueue();
};

jasmine.Suite.prototype.specs = function() {
  return this.specs_;
};

jasmine.Suite.prototype.suites = function() {
  return this.suites_;
};

jasmine.Suite.prototype.children = function() {
  return this.children_;
};

jasmine.Suite.prototype.execute = function(onComplete) {
  var self = this;
  this.queue.start(function () {
    self.finish(onComplete);
  });
};
