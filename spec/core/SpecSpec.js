describe("Spec", function() {

  it("#isPendingSpecException returns true for a pending spec exception", function() {
    var e = new Error(jasmineUnderTest.Spec.pendingSpecExceptionMessage);

    expect(jasmineUnderTest.Spec.isPendingSpecException(e)).toBe(true);
  });

  it("#isPendingSpecException returns true for a pending spec exception (even when FF bug is present)", function() {
    var fakeError = {
      toString: function() { return "Error: " + jasmineUnderTest.Spec.pendingSpecExceptionMessage; }
    };

    expect(jasmineUnderTest.Spec.isPendingSpecException(fakeError)).toBe(true);
  });

  it("#isPendingSpecException returns true for a pending spec exception with a custom message", function() {
    expect(jasmineUnderTest.Spec.isPendingSpecException(jasmineUnderTest.Spec.pendingSpecExceptionMessage + 'foo')).toBe(true);
  });

  it("#isPendingSpecException returns false for not a pending spec exception", function() {
    var e = new Error("foo");

    expect(jasmineUnderTest.Spec.isPendingSpecException(e)).toBe(false);
  });

  it("#isPendingSpecException returns false for thrown values that don't have toString", function() {
    expect(jasmineUnderTest.Spec.isPendingSpecException(void 0)).toBe(false);
  });

  it("delegates execution to a QueueRunner", function() {
    var fakeQueueRunner = jasmine.createSpy('fakeQueueRunner'),
      spec = new jasmineUnderTest.Spec({
        description: 'my test',
        id: 'some-id',
        queueableFn: { fn: function() {} },
        queueRunnerFactory: fakeQueueRunner
      });

    spec.execute();

    expect(fakeQueueRunner).toHaveBeenCalled();
  });

  it("should call the start callback on execution", function() {
    var fakeQueueRunner = jasmine.createSpy('fakeQueueRunner'),
      startCallback = jasmine.createSpy('startCallback'),
      spec = new jasmineUnderTest.Spec({
        id: 123,
        description: 'foo bar',
        queueableFn: { fn: function() {} },
        onStart: startCallback,
        queueRunnerFactory: fakeQueueRunner
      });

    spec.execute();

    // TODO: due to some issue with the Pretty Printer, this line fails, but the other two pass.
    // This means toHaveBeenCalledWith on IE8 will always be broken.

    //   expect(startCallback).toHaveBeenCalledWith(spec);
    expect(startCallback).toHaveBeenCalled();
    expect(startCallback.calls.first().object).toEqual(spec);
  });

  it("should call the start callback on execution but before any befores are called", function() {
    var fakeQueueRunner = jasmine.createSpy('fakeQueueRunner'),
      beforesWereCalled = false,
      startCallback = jasmine.createSpy('start-callback').and.callFake(function() {
        expect(beforesWereCalled).toBe(false);
      }),
      spec = new jasmineUnderTest.Spec({
        queueableFn: { fn: function() {} },
        beforeFns: function() {
          return [function() {
            beforesWereCalled = true
          }]
        },
        onStart: startCallback,
        queueRunnerFactory: fakeQueueRunner
      });

    spec.execute();

    expect(startCallback).toHaveBeenCalled();
  });

  it("provides all before fns and after fns to be run", function() {
    var fakeQueueRunner = jasmine.createSpy('fakeQueueRunner'),
      before = jasmine.createSpy('before'),
      after = jasmine.createSpy('after'),
      queueableFn = { fn: jasmine.createSpy('test body').and.callFake(function() {
        expect(before).toHaveBeenCalled();
        expect(after).not.toHaveBeenCalled();
      }) },
      spec = new jasmineUnderTest.Spec({
        queueableFn: queueableFn,
        beforeAndAfterFns: function() {
          return {befores: [before], afters: [after]}
        },
        queueRunnerFactory: fakeQueueRunner
      });

    spec.execute();

    var allSpecFns = fakeQueueRunner.calls.mostRecent().args[0].queueableFns;
    expect(allSpecFns).toEqual([before, queueableFn, after]);
  });

  it("is marked pending if created without a function body", function() {
    var fakeQueueRunner = jasmine.createSpy('fakeQueueRunner'),

      startCallback = jasmine.createSpy('startCallback'),
      resultCallback = jasmine.createSpy('resultCallback'),
      spec = new jasmineUnderTest.Spec({
        onStart: startCallback,
        queueableFn: { fn: null },
        resultCallback: resultCallback,
        queueRunnerFactory: fakeQueueRunner
      });

    expect(spec.status()).toBe('pending');
  });

  it("can be disabled, but still calls callbacks", function() {
    var fakeQueueRunner = jasmine.createSpy('fakeQueueRunner'),
      startCallback = jasmine.createSpy('startCallback'),
      specBody = jasmine.createSpy('specBody'),
      resultCallback = jasmine.createSpy('resultCallback'),
      spec = new jasmineUnderTest.Spec({
        onStart:startCallback,
        queueableFn: { fn: specBody },
        resultCallback: resultCallback,
        queueRunnerFactory: fakeQueueRunner
      });

    spec.disable();

    expect(spec.status()).toBe('disabled');

    spec.execute();

    expect(fakeQueueRunner).not.toHaveBeenCalled();
    expect(specBody).not.toHaveBeenCalled();

    expect(startCallback).toHaveBeenCalled();
    expect(resultCallback).toHaveBeenCalled();
  });

  it("can be disabled at execution time by a parent", function() {
    var fakeQueueRunner = jasmine.createSpy('fakeQueueRunner'),
      startCallback = jasmine.createSpy('startCallback'),
      specBody = jasmine.createSpy('specBody'),
      resultCallback = jasmine.createSpy('resultCallback'),
      spec = new jasmineUnderTest.Spec({
        onStart:startCallback,
        queueableFn: { fn: specBody },
        resultCallback: resultCallback,
        queueRunnerFactory: fakeQueueRunner
      });

    spec.execute(undefined, false);

    expect(spec.result.status).toBe('disabled');

    expect(fakeQueueRunner).not.toHaveBeenCalled();
    expect(specBody).not.toHaveBeenCalled();

    expect(startCallback).toHaveBeenCalled();
    expect(resultCallback).toHaveBeenCalled();
  });

  it("can be marked pending, but still calls callbacks when executed", function() {
    var fakeQueueRunner = jasmine.createSpy('fakeQueueRunner'),
      startCallback = jasmine.createSpy('startCallback'),
      resultCallback = jasmine.createSpy('resultCallback'),
      spec = new jasmineUnderTest.Spec({
        onStart: startCallback,
        resultCallback: resultCallback,
        description: "with a spec",
        getSpecName: function() {
          return "a suite with a spec"
        },
        queueRunnerFactory: fakeQueueRunner,
        queueableFn: { fn: null }
      });

    spec.pend();

    expect(spec.status()).toBe('pending');

    spec.execute();

    expect(fakeQueueRunner).not.toHaveBeenCalled();

    expect(startCallback).toHaveBeenCalled();
    expect(resultCallback).toHaveBeenCalledWith({
      id: spec.id,
      status: 'pending',
      description: 'with a spec',
      fullName: 'a suite with a spec',
      failedExpectations: [],
      passedExpectations: [],
      pendingReason: ''
    });
  });

  it("should call the done callback on execution complete", function() {
    var done = jasmine.createSpy('done callback'),
      spec = new jasmineUnderTest.Spec({
        queueableFn: { fn: function() {} },
        catchExceptions: function() { return false; },
        resultCallback: function() {},
        queueRunnerFactory: function(attrs) { attrs.onComplete(); }
      });

    spec.execute(done);

    expect(done).toHaveBeenCalled();
  });

  it("#status returns passing by default", function() {
    var spec = new jasmineUnderTest.Spec({queueableFn: { fn: jasmine.createSpy("spec body")} });
    expect(spec.status()).toBe('passed');
  });

  it("#status returns passed if all expectations in the spec have passed", function() {
    var spec = new jasmineUnderTest.Spec({queueableFn: { fn: jasmine.createSpy("spec body")} });
    spec.addExpectationResult(true);
    expect(spec.status()).toBe('passed');
  });

  it("#status returns failed if any expectations in the spec have failed", function() {
    var spec = new jasmineUnderTest.Spec({queueableFn: { fn: jasmine.createSpy("spec body") } });
    spec.addExpectationResult(true);
    spec.addExpectationResult(false);
    expect(spec.status()).toBe('failed');
  });

  it("keeps track of passed and failed expectations", function() {
    var resultCallback = jasmine.createSpy('resultCallback'),
      spec = new jasmineUnderTest.Spec({
        queueableFn: { fn: jasmine.createSpy("spec body") },
        expectationResultFactory: function (data) { return data; },
        queueRunnerFactory: function(attrs) { attrs.onComplete(); },
        resultCallback: resultCallback
      });
    spec.addExpectationResult(true, 'expectation1');
    spec.addExpectationResult(false, 'expectation2');

    spec.execute();

    expect(resultCallback.calls.first().args[0].passedExpectations).toEqual(['expectation1']);
    expect(resultCallback.calls.first().args[0].failedExpectations).toEqual(['expectation2']);
  });

  it("throws an ExpectationFailed error upon receiving a failed expectation when 'throwOnExpectationFailure' is set", function() {
    var resultCallback = jasmine.createSpy('resultCallback'),
      spec = new jasmineUnderTest.Spec({
      queueableFn: { fn: function() {} },
      expectationResultFactory: function(data) { return data; },
      queueRunnerFactory: function(attrs) { attrs.onComplete(); },
      resultCallback: resultCallback,
      throwOnExpectationFailure: true
    });

    spec.addExpectationResult(true, 'passed');
    expect(function() {
      spec.addExpectationResult(false, 'failed')
    }).toThrowError(jasmineUnderTest.errors.ExpectationFailed);

    spec.execute();

    expect(resultCallback.calls.first().args[0].passedExpectations).toEqual(['passed']);
    expect(resultCallback.calls.first().args[0].failedExpectations).toEqual(['failed']);
  });

  it("does not throw an ExpectationFailed error when handling an error", function() {
    var resultCallback = jasmine.createSpy('resultCallback'),
      spec = new jasmineUnderTest.Spec({
        queueableFn: { fn: function() {} },
        expectationResultFactory: function(data) { return data; },
        queueRunnerFactory: function(attrs) { attrs.onComplete(); },
        resultCallback: resultCallback,
        throwOnExpectationFailure: true
      });

    spec.onException('failing exception');
  });

  it("can return its full name", function() {
    var specNameSpy = jasmine.createSpy('specNameSpy').and.returnValue('expected val');

    var spec = new jasmineUnderTest.Spec({
      getSpecName: specNameSpy,
      queueableFn: { fn: null }
    });

    expect(spec.getFullName()).toBe('expected val');
    expect(specNameSpy.calls.mostRecent().args[0].id).toEqual(spec.id);
  });

  describe("when a spec is marked pending during execution", function() {
    it("should mark the spec as pending", function() {
      var fakeQueueRunner = function(opts) {
          opts.onException(new Error(jasmineUnderTest.Spec.pendingSpecExceptionMessage));
        },
        spec = new jasmineUnderTest.Spec({
          description: 'my test',
          id: 'some-id',
          queueableFn: { fn: function() { } },
          queueRunnerFactory: fakeQueueRunner
        });

      spec.execute();

      expect(spec.status()).toEqual("pending");
      expect(spec.result.pendingReason).toEqual('');
    });

    it("should set the pendingReason", function() {
      var fakeQueueRunner = function(opts) {
          opts.onException(new Error(jasmineUnderTest.Spec.pendingSpecExceptionMessage + 'custom message'));
        },
        spec = new jasmineUnderTest.Spec({
          description: 'my test',
          id: 'some-id',
          queueableFn: { fn: function() { } },
          queueRunnerFactory: fakeQueueRunner
        });

      spec.execute();

      expect(spec.status()).toEqual("pending");
      expect(spec.result.pendingReason).toEqual('custom message');
    });
  });

  it("should log a failure when handling an exception", function() {
    var resultCallback = jasmine.createSpy('resultCallback'),
      spec = new jasmineUnderTest.Spec({
        queueableFn: { fn: function() {} },
        expectationResultFactory: function(data) { return data; },
        queueRunnerFactory: function(attrs) { attrs.onComplete(); },
        resultCallback: resultCallback
      });

    spec.onException('foo');
    spec.execute();

    expect(resultCallback.calls.first().args[0].failedExpectations).toEqual([{
      error: 'foo',
      matcherName: '',
      passed: false,
      expected: '',
      actual: ''
    }]);
  });

  it("should not log an additional failure when handling an ExpectationFailed error", function() {
    var resultCallback = jasmine.createSpy('resultCallback'),
      spec = new jasmineUnderTest.Spec({
        queueableFn: { fn: function() {} },
        expectationResultFactory: function(data) { return data; },
        queueRunnerFactory: function(attrs) { attrs.onComplete(); },
        resultCallback: resultCallback
      });

    spec.onException(new jasmineUnderTest.errors.ExpectationFailed());
    spec.execute();

    expect(resultCallback.calls.first().args[0].failedExpectations).toEqual([]);
  });

  it("retrieves a result with updated status", function() {
    var spec = new jasmineUnderTest.Spec({ queueableFn: { fn: function() {} } });

    expect(spec.getResult().status).toBe('passed');
  });

  it("retrives a result with disabled status", function() {
    var spec = new jasmineUnderTest.Spec({ queueableFn: { fn: function() {} } });
    spec.disable();

    expect(spec.getResult().status).toBe('disabled');
  });

  it("retrives a result with pending status", function() {
    var spec = new jasmineUnderTest.Spec({ queueableFn: { fn: function() {} } });
    spec.pend();

    expect(spec.getResult().status).toBe('pending');
  });

  it("should not be executable when disabled", function() {
    var spec = new jasmineUnderTest.Spec({
      queueableFn: { fn: function() {} }
    });
    spec.disable();

    expect(spec.isExecutable()).toBe(false);
  });

  it("should be executable when pending", function() {
    var spec = new jasmineUnderTest.Spec({
      queueableFn: { fn: function() {} }
    });
    spec.pend();

    expect(spec.isExecutable()).toBe(true);
  });

  it("should be executable when not disabled or pending", function() {
    var spec = new jasmineUnderTest.Spec({
      queueableFn: { fn: function() {} }
    });

    expect(spec.isExecutable()).toBe(true);
  });
});
