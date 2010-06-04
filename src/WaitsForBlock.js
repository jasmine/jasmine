jasmine.WaitsForBlock = function(env, timeout, latchFunction, message, spec) {
  this.timeout = timeout;
  this.latchFunction = latchFunction;
  this.message = message;
  this.totalTimeSpentWaitingForLatch = 0;
  jasmine.Block.call(this, env, null, spec);
};

jasmine.util.inherit(jasmine.WaitsForBlock, jasmine.Block);

jasmine.WaitsForBlock.TIMEOUT_INCREMENT = 100;

jasmine.WaitsForBlock.prototype.execute = function (onComplete) {
  var self = this;
  self.env.reporter.log('>> Jasmine waiting for ' + (self.message || 'something to happen'));
  var latchFunctionResult;
  try {
    latchFunctionResult = self.latchFunction.apply(self.spec);
  } catch (e) {
    self.spec.fail(e);
    onComplete();
    return;
  }

  if (latchFunctionResult) {
    onComplete();
  } else if (self.totalTimeSpentWaitingForLatch >= self.timeout) {
    var message = 'timed out after ' + self.timeout + ' msec waiting for ' + (self.message || 'something to happen');
    self.spec.fail({
      name: 'timeout',
      message: message
    });
  } else {
    self.totalTimeSpentWaitingForLatch += jasmine.WaitsForBlock.TIMEOUT_INCREMENT;
    self.env.setTimeout(function () { self.execute(onComplete); }, jasmine.WaitsForBlock.TIMEOUT_INCREMENT);
  }
};