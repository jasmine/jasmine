jasmine.Spec = function(attrs) {
  this.failedExpectations = [];
  this.encounteredExpectations = false;
  this.expectationFactory = attrs.expectationFactory;
  this.resultCallback = attrs.resultCallback  || function() {};
  this.id = attrs.id;
  this.description = attrs.description;
  this.fn = attrs.fn;
  this.beforeFns = attrs.beforeFns || function() {};
  this.afterFns = attrs.afterFns || function() {};
  this.catchingExceptions = attrs.catchingExceptions;
  this.startCallback = attrs.startCallback || function() {};
  this.exceptionFormatter = attrs.exceptionFormatter || function() {};
  this.getSpecName = attrs.getSpecName;
  this.expectationResultFactory = attrs.expectationResultFactory || function() {};
};

jasmine.Spec.prototype.addExpectationResult = function(passed, data) {
  this.encounteredExpectations = true;
  if (!passed) {
    this.failedExpectations.push(data);
  }
};

jasmine.Spec.prototype.expect = function(actual) {
  return this.expectationFactory(actual, this);
};

jasmine.Spec.prototype.execute = function() {
  var self = this;
  if (this.disabled) {
    resultCallback();
    return;
  }

  var befores = this.beforeFns() || [],
  afters = this.afterFns() || [];
  this.startCallback(this);
  var allFns = befores.concat(this.fn).concat(afters);

  queueRunner(allFns, 0);

  function attempt(fn) {
    try {
      fn();
    } catch (e) {
      //TODO: weird. buildExpectationResult is really a presenter for expectations
      //so this should take an expectation object.
      self.addExpectationResult(false, self.expectationResultFactory({
        matcherName: "",
        passed: false,
        expected: "",
        actual: "",
        message: self.exceptionFormatter(e),
        trace: e
      }));
      if (!self.catchingExceptions()) {
        //TODO: set a var when we catch an exception and
        //use a finally block to close the loop in a nice way..
        throw e;
      }
    }
  }

  function queueRunner(allFns, index) {
    if (index >= allFns.length) {
      resultCallback();
      return;
    }
    var fn = allFns[index];
    if (fn.length > 0) {
      attempt(function() { fn.call(self, function() {  queueRunner(allFns, index + 1) }) });
    } else {
      attempt(function() { fn.call(self); });
      queueRunner(allFns, index + 1);
    }
  }

  function resultCallback() {
    self.resultCallback({
      id: self.id,
      status: self.status(),
      description: self.description,
      failedExpectations: self.failedExpectations
    });
  }
};

jasmine.Spec.prototype.disable = function() {
  this.disabled = true;
};

jasmine.Spec.prototype.status = function() {
  if (this.disabled) {
    return 'disabled';
  }

  if (!this.encounteredExpectations) {
    return null;
  }
  if (this.failedExpectations.length > 0) {
    return 'failed';
  } else {
    return 'passed';
  }
};

jasmine.Spec.prototype.getFullName = function() {
  return this.getSpecName(this);
}
