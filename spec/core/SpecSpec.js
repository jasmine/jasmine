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

  it("#isPendingSpecException returns true for a pending spec exception", function() {
    var e = new Error("foo");

    expect(j$.Spec.isPendingSpecException(e)).toBe(false);
  });

  it("delegates execution to a QueueRunner", function() {
    var fakeQueueRunner = jasmine.createSpy('fakeQueueRunner'),
      spec = new j$.Spec({
        description: 'my test',
        id: 'some-id',
        fn: function() {},
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
        fn: function() {},
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
        fn: function() {},
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
      fn = jasmine.createSpy('test body').and.callFake(function() {
        expect(before).toHaveBeenCalled();
        expect(after).not.toHaveBeenCalled();
      }),
      spec = new j$.Spec({
        fn: fn,
        beforeFns: function() {
          return [before]
        },
        afterFns: function() {
          return [after]
        },
        queueRunnerFactory: fakeQueueRunner
      });

    spec.execute();

    var allSpecFns = fakeQueueRunner.calls.mostRecent().args[0].fns;
    expect(allSpecFns).toEqual([before, fn, after]);
  });

  it("is marked pending if created without a function body", function() {
    var fakeQueueRunner = jasmine.createSpy('fakeQueueRunner'),

      startCallback = jasmine.createSpy('startCallback'),
      resultCallback = jasmine.createSpy('resultCallback'),
      spec = new j$.Spec({
        onStart: startCallback,
        fn: null,
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
        fn: specBody,
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
        queueRunnerFactory: fakeQueueRunner
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
      failedExpectations: []
    });
  });

  it("should call the done callback on execution complete", function() {
    var done = jasmine.createSpy('done callback'),
      spec = new j$.Spec({
        fn: function() {},
        catchExceptions: function() { return false; },
        resultCallback: function() {},
        queueRunnerFactory: function(attrs) { attrs.onComplete(); }
      });

    spec.execute(done);

    expect(done).toHaveBeenCalled();
  });

  it("#status returns passing by default", function() {
    var spec = new j$.Spec({fn: jasmine.createSpy("spec body")});
    expect(spec.status()).toEqual('passed');
  });

  it("#status returns passed if all expectations in the spec have passed", function() {
    var spec = new j$.Spec({fn: jasmine.createSpy("spec body")});
    spec.addExpectationResult(true);
    expect(spec.status()).toBe('passed');
  });

  it("#status returns failed if any expectations in the spec have failed", function() {
    var spec = new j$.Spec({ fn: jasmine.createSpy("spec body") });
    spec.addExpectationResult(true);
    spec.addExpectationResult(false);
    expect(spec.status()).toBe('failed');
  });

  it("can return its full name", function() {
    var specNameSpy = jasmine.createSpy('specNameSpy').and.returnValue('expected val');

    var spec = new j$.Spec({
      getSpecName: specNameSpy
    });

    expect(spec.getFullName()).toBe('expected val');
    expect(specNameSpy.calls.mostRecent().args[0].id).toEqual(spec.id);
  });

  it("sets a timeout for async functions to keep them from running forever", function() {
    var queueRunnerSpy = jasmine.createSpy('queue runner'),
      setTimeoutSpy = jasmine.createSpy('setTimeout'),
      spec = new j$.Spec({
        beforeFns: function() { return [function(done) { }]; },
        fn: function(done) { },
        afterFns: function() { return [function(done) { }]; },
        timer: {
          setTimeout: setTimeoutSpy,
          clearTimeout: function() {}
        },
        queueRunnerFactory: queueRunnerSpy
      });

    spec.execute();
    var fns = queueRunnerSpy.calls.mostRecent().args[0].fns;

    for (var i = 0; i < fns.length; i++) {
      fns[i]();
    }

    expect(setTimeoutSpy.calls.count()).toEqual(3);
    expect(setTimeoutSpy).toHaveBeenCalledWith(jasmine.any(Function), j$.DEFAULT_TIMEOUT_INTERVAL);
  });

  it("resets the timeout timer when an async before throws an exception", function() {
    var queueRunnerSpy = jasmine.createSpy('queueRunner'),
      clearTimeoutSpy = jasmine.createSpy('clear timeout'),
      spec = new j$.Spec({
        beforeFns: function() { return [function(done) {}]; },
        fn: function() { },
        timer: {
          setTimeout: function () { return 920; },
          clearTimeout: clearTimeoutSpy
        },
        queueRunnerFactory: queueRunnerSpy
      });

    spec.execute();
    queueRunnerSpy.calls.mostRecent().args[0].fns[0]();
    queueRunnerSpy.calls.mostRecent().args[0].onException(new Error());

    expect(clearTimeoutSpy).toHaveBeenCalledWith(920);
  });

  it("resets the timeout timer when an async spec throws an exception", function() {
    var queueRunnerSpy = jasmine.createSpy('queueRunner'),
      clearTimeoutSpy = jasmine.createSpy('clear timeout'),
      spec = new j$.Spec({
        fn: function(done) { },
        timer: {
          setTimeout: function () { return 920; },
          clearTimeout: clearTimeoutSpy
        },
        queueRunnerFactory: queueRunnerSpy
      });

    spec.execute();
    queueRunnerSpy.calls.mostRecent().args[0].fns[0]();
    queueRunnerSpy.calls.mostRecent().args[0].onException(new Error());

    expect(clearTimeoutSpy).toHaveBeenCalledWith(920);
  });

  it("resets the timeout timer when an async after spec throws an exception", function() {
    var queueRunnerSpy = jasmine.createSpy('queueRunner'),
      clearTimeoutSpy = jasmine.createSpy('clear timeout'),
      spec = new j$.Spec({
        fn: function() { },
        afterFns: function() { return [function(done) {}]; },
        timer: {
          setTimeout: function () { return 920; },
          clearTimeout: clearTimeoutSpy
        },
        queueRunnerFactory: queueRunnerSpy
      });

    spec.execute();
    queueRunnerSpy.calls.mostRecent().args[0].fns[1]();
    queueRunnerSpy.calls.mostRecent().args[0].onException(new Error());

    expect(clearTimeoutSpy).toHaveBeenCalledWith(920);
  });
  describe("when a spec is marked pending during execution", function() {
    it("should mark the spec as pending", function() {
      var fakeQueueRunner = function(opts) {
          opts.onException(new Error(j$.Spec.pendingSpecExceptionMessage));
        },
        spec = new j$.Spec({
          description: 'my test',
          id: 'some-id',
          fn: function() { },
          queueRunnerFactory: fakeQueueRunner
        });

      spec.execute();

      expect(spec.status()).toEqual("pending");
    });
  });
});
