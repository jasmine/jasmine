jasmine.WaitsBlock = function(env, timeout, spec) {
  this.timeout = timeout;
  jasmine.Block.call(this, env, null, spec);
};

jasmine.util.inherit(jasmine.WaitsBlock, jasmine.Block);

jasmine.WaitsBlock.prototype.execute = function (onComplete) {
  if (jasmine.VERBOSE) {
    this.env.reporter.log('>> Jasmine waiting for ' + this.timeout + ' ms...');
  }
  this.env.setTimeout(function () {
    onComplete();
  }, this.timeout);
};
