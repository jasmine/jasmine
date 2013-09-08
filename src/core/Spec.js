getJasmineRequireObj().Spec = function() {
  function Spec(attrs) {
    this.encounteredExpectations = false;
    this.expectationFactory = attrs.expectationFactory;
    this.resultCallback = attrs.resultCallback || function() {};
    this.id = attrs.id;
    this.description = attrs.description || '';
    this.fn = attrs.fn;
    this.beforeFns = attrs.beforeFns || function() {};
    this.afterFns = attrs.afterFns || function() {};
    this.catchingExceptions = attrs.catchingExceptions;
    this.onStart = attrs.onStart || function() {};
    this.exceptionFormatter = attrs.exceptionFormatter || function() {};
    this.getSpecName = attrs.getSpecName || function() { return ''; };
    this.expectationResultFactory = attrs.expectationResultFactory || function() { };
    this.queueRunner = attrs.queueRunner || function() {};
    this.catchingExceptions = attrs.catchingExceptions || function() { return true; };

    this.timer = attrs.timer || {setTimeout: setTimeout, clearTimeout: clearTimeout};

    if (!this.fn) {
      this.pend();
    }

    this.result = {
      id: this.id,
      description: this.description,
      fullName: this.getFullName(),
      status: this.status(),
      failedExpectations: []
    };
  }

  Spec.prototype.addExpectationResult = function(passed, data) {
    this.encounteredExpectations = true;
    if (passed) {
      return;
    }
    this.result.failedExpectations.push(this.expectationResultFactory(data));
  };

  Spec.prototype.expect = function(actual) {
    return this.expectationFactory(actual, this);
  };

  Spec.prototype.execute = function(onComplete) {
    var self = this;

    this.onStart(this);

    if (this.markedPending || this.disabled) {
      complete();
      return;
    }

    function timeoutable(fn) {
      return function(done) {
        var timeout = Function.prototype.apply.apply(self.timer.setTimeout, [j$.getGlobal(), [function() {
          onException(new Error('timeout'));
          done();
        }, j$.DEFAULT_TIMEOUT_INTERVAL]]);

        var callDone = function() {
          Function.prototype.apply.apply(self.timer.clearTimeout, [j$.getGlobal(), [timeout]]);
          done();
        };

        fn.call(this, callDone); //TODO: do we care about more than 1 arg?
      };
    }

    var befores = this.beforeFns() || [],
        afters = this.afterFns() || [],
        thisOne = (this.fn.length) ? timeoutable(this.fn) : this.fn;
    var allFns = befores.concat(thisOne).concat(afters);

    this.queueRunner({
      fns: allFns,
      onException: onException,
      onComplete: complete
    });

    function onException(e) {
        if (Spec.isPendingSpecException(e)) {
          self.pend();
          return;
        }

        self.addExpectationResult(false, {
          matcherName: "",
          passed: false,
          expected: "",
          actual: "",
          error: e
        });
    }

    function complete() {
      self.result.status = self.status();
      self.resultCallback(self.result);

      if (onComplete) {
        onComplete();
      }
    }
  };

  Spec.prototype.disable = function() {
    this.disabled = true;
  };

  Spec.prototype.pend = function() {
    this.markedPending = true;
  };

  Spec.prototype.status = function() {
    if (this.disabled) {
      return 'disabled';
    }

    if (this.markedPending || !this.encounteredExpectations) {
      return 'pending';
    }

    if (this.result.failedExpectations.length > 0) {
      return 'failed';
    } else {
      return 'passed';
    }
  };

  Spec.prototype.getFullName = function() {
    return this.getSpecName(this);
  };

  Spec.pendingSpecExceptionMessage = "=> marked Pending";

  Spec.isPendingSpecException = function(e) {
    return e.toString().indexOf(Spec.pendingSpecExceptionMessage) !== -1;
  };

  return Spec;
};

if (typeof window == void 0 && typeof exports == "object") {
  exports.Spec = jasmineRequire.Spec;
}
