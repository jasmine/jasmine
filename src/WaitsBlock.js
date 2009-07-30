jasmine.WaitsBlock = function(env, timeout, spec) {
  this.timeout = timeout;
  jasmine.Block.call(this, env, null, spec);
};

jasmine.util.inherit(jasmine.WaitsBlock, jasmine.Block);

jasmine.WaitsBlock.prototype.execute = function () {
  var self = this;
  self.env.reporter.log('>> Jasmine waiting for ' + this.timeout + ' ms...');
  self.env.setTimeout(function () {
    self.next();
  }, self.timeout);
};
