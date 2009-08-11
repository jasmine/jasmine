/**
 * Runner
 *
 * @constructor
 * @param {jasmine.Env} env
 */
jasmine.Runner = function(env) {
  jasmine.ActionCollection.call(this, env);

  this.suites = this.actions;
};
jasmine.util.inherit(jasmine.Runner, jasmine.ActionCollection);

jasmine.Runner.prototype.execute = function() {
  if (this.env.reporter.reportRunnerStarting) {
    this.env.reporter.reportRunnerStarting(this);
  }
  jasmine.ActionCollection.prototype.execute.call(this);
};

jasmine.Runner.prototype.finishCallback = function() {
  this.env.reporter.reportRunnerResults(this);
};

jasmine.Runner.prototype.getAllSuites = function() {
  var suitesToReturn = [];

  function addSuite(suite) {
    suitesToReturn.push(suite);

    for (var j = 0; j < suite.specs.length; j++) {
      var spec = suite.specs[j];
      if (spec instanceof jasmine.Suite) {
        addSuite(spec);
      }
    }
  }

  for (var i = 0; i < this.suites.length; i++) {
    var suite = this.suites[i];
    addSuite(suite);
  }

  return suitesToReturn;
};

jasmine.Runner.prototype.getResults = function() {
  var results = new jasmine.NestedResults();
  for (var i = 0; i < this.suites.length; i++) {
    results.rollupCounts(this.suites[i].getResults());
  }
  return results;
};
