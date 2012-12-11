describe("Spec", function() {

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

    expect(startCallback).not.toHaveBeenCalled();
    expect(fakeQueueRunner).not.toHaveBeenCalled();
    expect(specBody).not.toHaveBeenCalled();

    expect(resultCallback).toHaveBeenCalled();
  });

  it("should call the results callback on execution complete", function() {
    var fakeQueueRunner = jasmine.createSpy('fakeQueueRunner'),

      startCallback = originalJasmine.createSpy('startCallback'),
      specBody = originalJasmine.createSpy('specBody'),
      resultCallback = originalJasmine.createSpy('resultCallback'),
      spec = new jasmine.Spec({
        onStart:startCallback,
        fn: specBody,
        resultCallback: resultCallback,
        description: "with a spec",
        getSpecName: function() { return "a suite with a spec"},
        queueRunner: fakeQueueRunner
      });

    spec.disable();

    expect(spec.status()).toBe('disabled');

    spec.execute();

    expect(startCallback).not.toHaveBeenCalled();
    expect(fakeQueueRunner).not.toHaveBeenCalled();
    expect(specBody).not.toHaveBeenCalled();

    expect(resultCallback).toHaveBeenCalledWith({
      id: spec.id,
      status: 'disabled',
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

  it("#status returns null by default", function() {
    var spec = new jasmine.Spec({});
    expect(spec.status()).toBeNull();
  });

  it("#status returns passed if all expectations in the spec have passed", function() {
    var spec = new jasmine.Spec({});
    spec.addExpectationResult(true);
    expect(spec.status()).toBe('passed');
  });

  it("#status returns failed if any expectations in the spec have failed", function() {
    var spec = new jasmine.Spec({});
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
});
