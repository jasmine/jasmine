describe("Spec", function() {

  it("#isPendingSpecException returns true for a pending spec exception", function() {
    var e = new Error(j$.Spec.pendingSpecExceptionMessage);

    expect(j$.Spec.isPendingSpecException(e)).toBe(true);
  });

  it("#isPendingSpecException returns true for a pending spec exception (even when FF bug is present)", function() {
    var fakeError = {
      toString: function() { return "Error: " + j$.Spec.pendingSpecExceptionMessage; }
    };

    expect(j$.Spec.isPendingSpecException(fakeError)).toBe(true);
  });

  it("#isPendingSpecException returns false for not a pending spec exception", function() {
    var e = new Error("foo");

    expect(j$.Spec.isPendingSpecException(e)).toBe(false);
  });

  it("#isPendingSpecException returns false for thrown values that don't have toString", function() {
    expect(j$.Spec.isPendingSpecException(void 0)).toBe(false);
  });

  it("delegates execution to a QueueRunner", function() {
    var fakeQueueRunner = jasmine.createSpy('fakeQueueRunner'),
      spec = new j$.Spec({
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
      spec = new j$.Spec({
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
      spec = new j$.Spec({
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
      spec = new j$.Spec({
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
      spec = new j$.Spec({
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
      spec = new j$.Spec({
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

  it("can be marked pending, but still calls callbacks when executed", function() {
    var fakeQueueRunner = jasmine.createSpy('fakeQueueRunner'),
      startCallback = jasmine.createSpy('startCallback'),
      resultCallback = jasmine.createSpy('resultCallback'),
      spec = new j$.Spec({
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
      passedExpectations: []
    });
  });

  it("should call the done callback on execution complete", function() {
    var done = jasmine.createSpy('done callback'),
      spec = new j$.Spec({
        queueableFn: { fn: function() {} },
        catchExceptions: function() { return false; },
        resultCallback: function() {},
        queueRunnerFactory: function(attrs) { attrs.onComplete(); }
      });

    spec.execute(done);

    expect(done).toHaveBeenCalled();
  });

  it("#status returns passing by default", function() {
    var spec = new j$.Spec({queueableFn: { fn: jasmine.createSpy("spec body")} });
    expect(spec.status()).toBe('passed');
  });

  it("#status returns passed if all expectations in the spec have passed", function() {
    var spec = new j$.Spec({queueableFn: { fn: jasmine.createSpy("spec body")} });
    spec.addExpectationResult(true);
    expect(spec.status()).toBe('passed');
  });

  it("#status returns failed if any expectations in the spec have failed", function() {
    var spec = new j$.Spec({queueableFn: { fn: jasmine.createSpy("spec body") } });
    spec.addExpectationResult(true);
    spec.addExpectationResult(false);
    expect(spec.status()).toBe('failed');
  });

  it("keeps track of passed and failed expectations", function() {
    var resultCallback = jasmine.createSpy('resultCallback'),
      spec = new j$.Spec({
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

  it("can return its full name", function() {
    var specNameSpy = jasmine.createSpy('specNameSpy').and.returnValue('expected val');

    var spec = new j$.Spec({
      getSpecName: specNameSpy,
      queueableFn: { fn: null }
    });

    expect(spec.getFullName()).toBe('expected val');
    expect(specNameSpy.calls.mostRecent().args[0].id).toEqual(spec.id);
  });

   describe("when a spec is marked pending during execution", function() {
    it("should mark the spec as pending", function() {
      var fakeQueueRunner = function(opts) {
          opts.onException(new Error(j$.Spec.pendingSpecExceptionMessage));
        },
        spec = new j$.Spec({
          description: 'my test',
          id: 'some-id',
          queueableFn: { fn: function() { } },
          queueRunnerFactory: fakeQueueRunner
        });

      spec.execute();

      expect(spec.status()).toEqual("pending");
    });
  });
});
