describe("Spec", function() {

  it("#isPendingSpecException returns true for a pending spec exception", function() {
    var e = new Error(jasmine.Spec.pendingSpecExceptionMessage);

    expect(jasmine.Spec.isPendingSpecException(e)).toBe(true);
  });

  it("#isPendingSpecException returns true for a pending spec exception", function() {
    var e = new Error("foo");

    expect(jasmine.Spec.isPendingSpecException(e)).toBe(false);
  });

  it("delegates execution to a QueueRunner", function() {
    var fakeQueueRunner = jasmine.createSpy('fakeQueueRunner'),
      spec = new jasmine.Spec({
        description: 'my test',
        id: 'some-id',
        fn: function() {},
        queueRunner: fakeQueueRunner
      });

    spec.execute();

    expect(fakeQueueRunner).toHaveBeenCalled();
  });

  it("should call the start callback on execution", function() {
    var fakeQueueRunner = jasmine.createSpy('fakeQueueRunner'),
      beforesWereCalled = false,
      startCallback = originalJasmine.createSpy('startCallback'),
      spec = new jasmine.Spec({
        id: 123,
        description: 'foo bar',
        fn: function() {},
        onStart: startCallback,
        queueRunner: fakeQueueRunner
      });

    spec.execute();

    expect(startCallback).toHaveBeenCalledWith(spec);
  });

  it("should call the start callback on execution but before any befores are called", function() {
    var fakeQueueRunner = jasmine.createSpy('fakeQueueRunner'),
      beforesWereCalled = false,
      startCallback = originalJasmine.createSpy('start-callback').andCallFake(function() {
        expect(beforesWereCalled).toBe(false);
      }),
      spec = new jasmine.Spec({
        fn: function() {},
        beforeFns: function() {
          return [function() {
            beforesWereCalled = true
          }]
        },
        onStart: startCallback,
        queueRunner: fakeQueueRunner
      });

    spec.execute();

    expect(startCallback).toHaveBeenCalled();
  });

  it("provides all before fns and after fns to be run", function() {
    var fakeQueueRunner = jasmine.createSpy('fakeQueueRunner'),
      before = originalJasmine.createSpy('before'),
      after = originalJasmine.createSpy('after'),
      fn = originalJasmine.createSpy('test body').andCallFake(function() {
        expect(before).toHaveBeenCalled();
        expect(after).not.toHaveBeenCalled();
      }),
      spec = new jasmine.Spec({
        fn: fn,
        beforeFns: function() {
          return [before]
        },
        afterFns: function() {
          return [after]
        },
        queueRunner: fakeQueueRunner
      });

    spec.execute();

    var allSpecFns = fakeQueueRunner.mostRecentCall.args[0].fns;
    expect(allSpecFns).toEqual([before, fn, after]);
  });

  it("is marked pending if created without a function body", function() {
    var fakeQueueRunner = jasmine.createSpy('fakeQueueRunner'),

      startCallback = originalJasmine.createSpy('startCallback'),
      resultCallback = originalJasmine.createSpy('resultCallback'),
      spec = new jasmine.Spec({
        onStart: startCallback,
        fn: null,
        resultCallback: resultCallback,
        queueRunner: fakeQueueRunner
      });


    expect(spec.status()).toBe('pending');
  });

  it("can be disabled, but still calls callbacks", function() {
    var fakeQueueRunner = jasmine.createSpy('fakeQueueRunner'),
      startCallback = originalJasmine.createSpy('startCallback'),
      specBody = originalJasmine.createSpy('specBody'),
      resultCallback = originalJasmine.createSpy('resultCallback'),
      spec = new jasmine.Spec({
        onStart:startCallback,
        fn: specBody,
        resultCallback: resultCallback,
        queueRunner: fakeQueueRunner
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
      startCallback = originalJasmine.createSpy('startCallback'),
      resultCallback = originalJasmine.createSpy('resultCallback'),
      spec = new jasmine.Spec({
        onStart: startCallback,
        resultCallback: resultCallback,
        description: "with a spec",
        getSpecName: function() {
          return "a suite with a spec"
        },
        queueRunner: fakeQueueRunner
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
    var done = originalJasmine.createSpy('done callback'),
      spec = new jasmine.Spec({
        fn: function() {},
        catchExceptions: function() { return false; },
        resultCallback: function() {},
        queueRunner: function(attrs) { attrs.onComplete(); }
      });

    spec.execute(done);

    expect(done).toHaveBeenCalled();
  });

  it("#status returns pending by default", function() {
    var spec = new jasmine.Spec({fn: jasmine.createSpy("spec body")});
    expect(spec.status()).toEqual('pending');
  });

  it("#status returns pending if no expectations were encountered", function() {
    var specBody = jasmine.createSpy("spec body"),
      spec = new jasmine.Spec({fn: specBody});

    spec.execute();

    expect(spec.status()).toEqual('pending');
  });

  it("#status returns passed if all expectations in the spec have passed", function() {
    var spec = new jasmine.Spec({fn: jasmine.createSpy("spec body")});
    spec.addExpectationResult(true);
    expect(spec.status()).toBe('passed');
  });

  it("#status returns failed if any expectations in the spec have failed", function() {
    var spec = new jasmine.Spec({ fn: jasmine.createSpy("spec body") });
    spec.addExpectationResult(true);
    spec.addExpectationResult(false);
    expect(spec.status()).toBe('failed');
  });

  it("can return its full name", function() {
    var spec;
    spec = new jasmine.Spec({
      getSpecName: function(passedVal) {
//        expect(passedVal).toBe(spec);  TODO: a exec time, spec is undefined WTF?
        return 'expected val';
      }
    });

    expect(spec.getFullName()).toBe('expected val');
  });

  describe("when a spec is marked pending during execution", function() {
    it("should mark the spec as pending", function() {
      var fakeQueueRunner = function(opts) {
          opts.onException(new Error(jasmine.Spec.pendingSpecExceptionMessage));
        },
        spec = new jasmine.Spec({
          description: 'my test',
          id: 'some-id',
          fn: function() { },
          queueRunner: fakeQueueRunner
        });

      spec.execute();

      expect(spec.status()).toEqual("pending");
    });
  });
});
