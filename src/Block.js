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

jasmine.Block.prototype._next = function() {
  this.spec.finish(); // default value is to be done after one function
};

jasmine.Block.prototype.execute = function() {
  this.env.reporter.log('>> Jasmine Running ' + this.spec.suite.description + ' ' + this.spec.description + '...');
  try {
    this.func.apply(this.spec);
  } catch (e) {
    this.fail(e);
  }
  this._next();
};

jasmine.Block.prototype.fail = function(e) {
  this.spec.results.addResult(new jasmine.ExpectationResult(false, jasmine.util.formatException(e), null));
};