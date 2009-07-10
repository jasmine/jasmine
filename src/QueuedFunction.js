/**
 * QueuedFunction is how ActionCollections' actions are implemented
 *
 * @constructor
 * @param {jasmine.Env} env
 * @param {Function} func
 * @param {Number} timeout
 * @param {Function} latchFunction
 * @param {jasmine.Spec} spec
 */
jasmine.QueuedFunction = function(env, func, timeout, latchFunction, spec) {
  this.env = env;
  this.func = func;
  this.timeout = timeout;
  this.latchFunction = latchFunction;
  this.spec = spec;

  this.totalTimeSpentWaitingForLatch = 0;
  this.latchTimeoutIncrement = 100;
};

jasmine.QueuedFunction.prototype.next = function() {
  this.spec.finish(); // default value is to be done after one function
};

jasmine.QueuedFunction.prototype.safeExecute = function() {
  this.env.reporter.log('>> Jasmine Running ' + this.spec.suite.description + ' ' + this.spec.description + '...');

  try {
    this.func.apply(this.spec);
  } catch (e) {
    this.fail(e);
  }
};

jasmine.QueuedFunction.prototype.execute = function() {
  var self = this;
  var executeNow = function() {
    self.safeExecute();
    self.next();
  };

  var executeLater = function() {
    self.env.setTimeout(executeNow, self.timeout);
  };

  var executeNowOrLater = function() {
    var latchFunctionResult;

    try {
      latchFunctionResult = self.latchFunction.apply(self.spec);
    } catch (e) {
      self.fail(e);
      self.next();
      return;
    }

    if (latchFunctionResult) {
      executeNow();
    } else if (self.totalTimeSpentWaitingForLatch >= self.timeout) {
      var message = 'timed out after ' + self.timeout + ' msec waiting for ' + (self.latchFunction.description || 'something to happen');
      self.fail({
        name: 'timeout',
        message: message
      });
      self.next();
    } else {
      self.totalTimeSpentWaitingForLatch += self.latchTimeoutIncrement;
      self.env.setTimeout(executeNowOrLater, self.latchTimeoutIncrement);
    }
  };

  if (this.latchFunction !== undefined) {
    executeNowOrLater();
  } else if (this.timeout > 0) {
    executeLater();
  } else {
    executeNow();
  }
};

jasmine.QueuedFunction.prototype.fail = function(e) {
  this.spec.results.addResult(new jasmine.ExpectationResult(false, jasmine.util.formatException(e), null));
};
