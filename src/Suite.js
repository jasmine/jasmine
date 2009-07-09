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
  jasmine.ActionCollection.call(this, env);

  this.description = description;
  this.specs = this.actions;
  this.parentSuite = parentSuite;

  this.beforeEachFunction = null;
  this.afterEachFunction = null;
};
jasmine.util.inherit(jasmine.Suite, jasmine.ActionCollection);

jasmine.Suite.prototype.getFullName = function() {
  var fullName = this.description;
  for (var parentSuite = this.parentSuite; parentSuite; parentSuite = parentSuite.parentSuite) {
    fullName = parentSuite.description + ' ' + fullName;
  }
  return fullName;
};

jasmine.Suite.prototype.finishCallback = function() {
  if (this.env.reporter) {
    this.env.reporter.reportSuiteResults(this);
  }
};

jasmine.Suite.prototype.beforeEach = function(beforeEachFunction) {
  beforeEachFunction.typeName = 'beforeEach';
  this.beforeEachFunction = beforeEachFunction;
};

jasmine.Suite.prototype.afterEach = function(afterEachFunction) {
  afterEachFunction.typeName = 'afterEach';
  this.afterEachFunction = afterEachFunction;
};

jasmine.Suite.prototype.getResults = function() {
  var results = new jasmine.NestedResults();
  for (var i = 0; i < this.specs.length; i++) {
    results.rollupCounts(this.specs[i].getResults());
  }
  return results;
};

