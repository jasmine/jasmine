/**
 * Runner
 *
 * @constructor
 * @param {jasmine.Env} env
 */
jasmine.Runner = function(env) {
  var self = this;
  self.env = env;
  self.queue = new jasmine.Queue(env);
};

jasmine.Runner.prototype.execute = function() {
  var self = this;
  if (self.env.reporter.reportRunnerStarting) {
    self.env.reporter.reportRunnerStarting(this);
  }
  self.queue.start(function () { self.finishCallback(); });
};

jasmine.Runner.prototype.finishCallback = function() {
  this.env.reporter.reportRunnerResults(this);
};

jasmine.Runner.prototype.add = function(block) {
  this.queue.add(block);
};

jasmine.Runner.prototype.getResults = function() {
  var results = new jasmine.NestedResults();
  var runnerResults = this.queue.getResults();
  for (var i=0; i < runnerResults.length; i++) {
    var suiteResults = runnerResults[i];
    for (var j=0; j < suiteResults.length; j++) {
      results.rollupCounts(suiteResults[j]);
    }
  }
  return results;
};