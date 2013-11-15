getJasmineRequireObj().Spec = function(j$) {
  function Spec(attrs) {
    this.expectationFactory = attrs.expectationFactory;
    this.resultCallback = attrs.resultCallback || function() {};
    this.id = attrs.id;
    this.description = attrs.description || '';
    this.fn = attrs.fn;
    this.beforeFns = attrs.beforeFns || function() { return []; };
    this.afterFns = attrs.afterFns || function() { return []; };
    this.onStart = attrs.onStart || function() {};
    this.exceptionFormatter = attrs.exceptionFormatter || function() {};
    this.getSpecName = attrs.getSpecName || function() { return ''; };
    this.expectationResultFactory = attrs.expectationResultFactory || function() { };
    this.queueRunnerFactory = attrs.queueRunnerFactory || function() {};
    this.catchingExceptions = attrs.catchingExceptions || function() { return true; };

    this.timer = attrs.timer || {setTimeout: setTimeout, clearTimeout: clearTimeout};

    if (!this.fn) {
      this.pend();
    }

    this.result = {
      id: this.id,
      description: this.description,
      fullName: this.getFullName(),
      failedExpectations: []
    };
  }

  Spec.prototype.addExpectationResult = function(passed, data) {
    if (passed) {
      return;
    }
    this.result.failedExpectations.push(this.expectationResultFactory(data));
  };

  Spec.prototype.expect = function(actual) {
    return this.expectationFactory(actual, this);
  };

  Spec.prototype.execute = function(onComplete) {
    var self = this,
        timeout;

    this.onStart(this);

    if (this.markedPending || this.disabled) {
      complete();
      return;
    }

    function timeoutable(fn) {
      return function(done) {
        timeout = Function.prototype.apply.apply(self.timer.setTimeout, [j$.getGlobal(), [function() {
          onException(new Error('Timeout - Async callback was not invoked within timeout specified by jasmine.DEFAULT_TIMEOUT_INTERVAL.'));
          done();
        }, j$.DEFAULT_TIMEOUT_INTERVAL]]);

        var callDone = function() {
          clearTimeoutable();
          done();
        };

        fn.call(this, callDone); //TODO: do we care about more than 1 arg?
      };
    }

    function clearTimeoutable() {
      Function.prototype.apply.apply(self.timer.clearTimeout, [j$.getGlobal(), [timeout]]);
      timeout = void 0;
    }

    var allFns = this.beforeFns().concat(this.fn).concat(this.afterFns()),
      allTimeoutableFns = [];
    for (var i = 0; i < allFns.length; i++) {
      var fn = allFns[i];
      allTimeoutableFns.push(fn.length > 0 ? timeoutable(fn) : fn);
    }

    this.queueRunnerFactory({
      fns: allTimeoutableFns,
      onException: onException,
      onComplete: complete
    });

    function onException(e) {
      clearTimeoutable();
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

    if (this.markedPending) {
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
