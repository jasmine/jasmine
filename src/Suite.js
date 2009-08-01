/**
 * Internal representation of a Jasmine suite.
 *
 * @constructor
 * @param {jasmine.Env} env
 * @param {String} description
 * @param {Function} specDefinitions
 * @param {jasmine.Suite} parentSuite
 */
jasmine.Suite = function(env, description, specDefinitions, parentSuite) {
  var self = this;  
  self.id = env.nextSuiteId_++;
  self.description = description;
  self.queue = new jasmine.Queue(function () { self.finish(); });
  self.parentSuite = parentSuite;
  self.env = env;
  self.beforeQueue = [];
  self.afterQueue = [];
};


jasmine.Suite.prototype.getFullName = function() {
  var fullName = this.description;
  for (var parentSuite = this.parentSuite; parentSuite; parentSuite = parentSuite.parentSuite) {
    fullName = parentSuite.description + ' ' + fullName;
  }
  return fullName;
};

jasmine.Suite.prototype.finish = function() {
  this.env.reporter.reportSuiteResults(this);
  this.finished = true;
  if (this.parentSuite) {
    this.parentSuite.next();
  }
};

jasmine.Suite.prototype.beforeEach = function(beforeEachFunction) {
  beforeEachFunction.typeName = 'beforeEach';
  this.beforeQueue.push(beforeEachFunction);
};

jasmine.Suite.prototype.afterEach = function(afterEachFunction) {
  afterEachFunction.typeName = 'afterEach';
  this.afterQueue.push(afterEachFunction);
};

jasmine.Suite.prototype.getResults = function() {
  return this.queue.getResults();
};

jasmine.Suite.prototype.add = function(block) {
  this.queue.add(block);
};

jasmine.Suite.prototype.execute = function() {
  this.queue.start();
};

jasmine.Suite.prototype._next = function () {
  this.next();
};

jasmine.Suite.prototype.next = function() {
  if (this.queue.isComplete()) {
    this.finish();
  } else {
    this.queue._next();
  }
};
