/**
 * Blocks are functions with executable code that make up a spec.
 *
 * @constructor
 * @param {jasmine.Env} env
 * @param {Function} func
 * @param {jasmine.Spec} spec
 */
jasmine.Block = function(env, func, spec) {
  this.env = env;
  this.func = func;
  this.spec = spec;
};

jasmine.Block.prototype.execute = function(onComplete) {
  this.env.reporter.log('>> Jasmine Running ' + this.spec.suite.description + ' ' + this.spec.description + '...');
  try {
    this.func.apply(this.spec);
  } catch (e) {
    this.fail(e);
  }
  onComplete();
};

jasmine.Block.prototype.fail = function(e) {
  this.spec.results.addResult(new jasmine.ExpectationResult(false, jasmine.util.formatException(e), null));
};