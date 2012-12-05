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
  this.catchExceptions = attrs.catchExceptions;
  this.startCallback = attrs.startCallback || function() {};
  this.exceptionFormatter = attrs.exceptionFormatter || function() {};
  this.fullNameFactory = attrs.fullNameFactory;
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
  if (this.disabled) {
    resultCallback.call(this);
    return;
  }

  var befores = this.beforeFns() || [],
  afters = this.afterFns() || [];
  this.startCallback(this);
  try {
    for (var i = 0; i < befores.length; i++) {
      befores[i].call(this);
    }
    this.fn.call(this);
    for (i = 0; i < afters.length; i++) {
      afters[i].call(this);
    }
  } catch (e) {
    //TODO: weird. buildExpectationResult is really a presenter for expectations
    //so this should take an expectation object.
    this.addExpectationResult(false, this.expectationResultFactory({
      matcherName: "",
      passed: false,
      expected: "",
      actual: "",
      message: this.exceptionFormatter(e),
      trace: e
    }));
    if (!this.catchExceptions) {
      throw e;
    }
  }
  finally {
    resultCallback.call(this);
  }

  function resultCallback() {
    this.resultCallback({
      id: this.id,
      status: this.status(),
      description: this.description,
      failedExpectations: this.failedExpectations
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

//TODO: remove
jasmine.Spec.prototype.getFullName = function() {
  return this.fullNameFactory(this);
}
