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
  self.id = env.nextSuiteId ? env.nextSuiteId() : null;
  self.description = description;
  self.queue = new jasmine.Queue(env);
  self.parentSuite = parentSuite;
  self.env = env;
  self.beforeAll_ = [];
  self.afterAll_ = [];
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

jasmine.Suite.prototype.beforeAll = function(beforeAllFunction) {
  beforeAllFunction.typeName = 'beforeAll';
  this.beforeAll_.push(beforeAllFunction);
};

jasmine.Suite.prototype.afterAll = function(afterAllFunction) {
  afterAllFunction.typeName = 'afterAll';
  this.afterAll_.push(afterAllFunction);
};

jasmine.Suite.prototype.beforeEach = function(beforeEachFunction) {
  beforeEachFunction.typeName = 'beforeEach';
  this.before_.unshift(beforeEachFunction);
};

jasmine.Suite.prototype.afterEach = function(afterEachFunction) {
  afterEachFunction.typeName = 'afterEach';
  this.after_.unshift(afterEachFunction);
};

jasmine.Suite.prototype.results = function() {
  return this.queue.results();
};

jasmine.Suite.prototype.add = function(suiteOrSpec) {
  this.children_.push(suiteOrSpec);
  if (suiteOrSpec instanceof jasmine.Suite) {
    this.suites_.push(suiteOrSpec);
    this.env.currentRunner().addSuite(suiteOrSpec);
  } else {
    this.specs_.push(suiteOrSpec);
  }
  this.queue.add(suiteOrSpec);
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
  this.queue.start(function() {
    self.finish(onComplete);
  });
};
