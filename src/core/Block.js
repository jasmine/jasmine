/**
 * Blocks are functions with executable code that make up a spec.
 *
 * A block function may return a "thenable" promise, in which case the
 * test completes when the promise is resolved and fails if the promise
 * fails or if it succeeds with an unexpected value.
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
  var spec = this.spec;
  var result;
  try {
    result = this.func.apply(spec);
  } catch (error) {
    spec.fail(error);
  }
  if (typeof result === 'undefined') {
    // blocks that do not return promises complete immediately
    onComplete();
  } else if (typeof result !== 'object' || typeof result.then !== 'function') {
    // if a block returns anything, it must return a promise as defined by
    // CommonJS/A
    spec.fail(new Error('`it` block returns non-promise: ' + result));
    onComplete();
  } else {
    // Throwing an error from an attempt to use a returned promise fails
    // the block
    try {
      result.then(function (value) {
        // fulfillment
        spec.resolved = true; // for verification;
        // test block promises must fulfill to undefined.  it is typical
        // to pipe the final promise of a test to make note of an expected
        // value and return no value
        if (value !== undefined) {
          spec.fail(new Error('Promise fulfilled with unexpected value: ' + value));
        }
        onComplete();
      }, function (error) {
        // rejection
        spec.rejected = true; // for verification
        if (!error || !('stack' in error)) {
          spec.fail(new Error(error));
        }
        spec.fail(error);
        onComplete();
      });
    } catch (error) {
      spec.fail(error);
      onComplete();
    }
  }
};

