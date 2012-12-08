describe("Spec", function() {
  it("reports results for passing tests", function() {
    var resultCallback = originalJasmine.createSpy('resultCallback'),
    expectationFactory = function(actual, spec) {
      expect(actual).toBe('some-actual');
      return {
        pass: function() {
          spec.addExpectationResult(true);
        }
      }
    },
    spec = new jasmine.Spec({
      description: 'my test',
      id: 'some-id',
      fn: function() {
        this.expect('some-actual').pass();
      },
      resultCallback: resultCallback,
      expectationFactory: expectationFactory
    });

    spec.execute();

    expect(resultCallback).toHaveBeenCalledWith({
      id: "some-id",
      status: "passed",
      description: "my test",
      failedExpectations: []
    });
  });
  it("reports results for failing tests", function() {
    var resultCallback = originalJasmine.createSpy('resultCallback'),
    expectationFactory = function(actual, spec) {
      expect(actual).toBe('some-actual');
      return {
        fail: function() {
          spec.addExpectationResult(true);
        }
      }
    },
    spec = new jasmine.Spec({
      description: 'my test',
      id: 'some-id',
      fn: function() {
        this.expect('some-actual').fail();
      },
      resultCallback: resultCallback,
      expectationFactory: expectationFactory
    });

    spec.execute();

    expect(resultCallback).toHaveBeenCalledWith({
      id: "some-id",
      status: "passed",
      description: "my test",
      failedExpectations: []
    });
  });

  it("executes before fns, after fns", function() {
    var before = originalJasmine.createSpy('before'),
    after = originalJasmine.createSpy('after'),
    fn = originalJasmine.createSpy('test body').andCallFake(function() {
      expect(before).toHaveBeenCalled();
      expect(after).not.toHaveBeenCalled();
    });
    spec = new jasmine.Spec({
      fn: fn,
      beforeFns: function() {
        return [before]
      },
      afterFns: function() {
        return [after]
      }
    });

    spec.execute();

    expect(before).toHaveBeenCalled();
    expect(before.mostRecentCall.object).toBe(spec);

    expect(fn).toHaveBeenCalled();

    expect(after).toHaveBeenCalled();
    expect(after.mostRecentCall.object).toBe(spec);
  });

  it("passes an optional callback to spec bodies, befores, and afters", function() {
    //TODO: it would be nice if spy arity could match the fake, so we could do something like:
    //createSpy('asyncfn').andCallFake(function(done) {});
    var resultCallback = originalJasmine.createSpy('resultCallback'),
    beforeCallback = originalJasmine.createSpy('beforeCallback'),
    fnCallback = originalJasmine.createSpy('fnCallback'),
    afterCallback = originalJasmine.createSpy('afterCallback'),
    before = function(done) {
      beforeCallback();
      setTimeout(function() { done() }, 100);
    },
    fn = function(done) {
      fnCallback();
      setTimeout(function() { done() }, 100);
    },
    after = function(done) {
      afterCallback();
      setTimeout(function() { done() }, 100);
    },
    spec = new jasmine.Spec({
      resultCallback: resultCallback,
      fn: fn,
      beforeFns: function() {
        return [before]
      },
      afterFns: function() {
        return [after]
      }
    });
    clock.install();

    spec.execute();

    expect(beforeCallback).toHaveBeenCalled();
    expect(fnCallback).not.toHaveBeenCalled();
    expect(afterCallback).not.toHaveBeenCalled();
    expect(resultCallback).not.toHaveBeenCalled();

    clock.tick(100);

    expect(fnCallback).toHaveBeenCalled();
    expect(afterCallback).not.toHaveBeenCalled();
    expect(resultCallback).not.toHaveBeenCalled();

    clock.tick(100);

    expect(afterCallback).toHaveBeenCalled();
    expect(resultCallback).not.toHaveBeenCalled();

    clock.tick(100);

    expect(resultCallback).toHaveBeenCalled();
  });

  it("status returns null by default", function() {
    var spec = new jasmine.Spec({});
    expect(spec.status()).toBeNull();
  });

  it("status returns passed if all expectations in the spec have passed", function() {
    var spec = new jasmine.Spec({});
    spec.addExpectationResult(true);
    expect(spec.status()).toBe('passed');
  });

  it("status returns failed if any expectations in the spec have failed", function() {
    var spec = new jasmine.Spec({});
    spec.addExpectationResult(true);
    spec.addExpectationResult(false);
    expect(spec.status()).toBe('failed');
  });

  it("calls the resultCallback with a failure when an exception occurs in the spec fn", function() {
    //TODO: one day we should pass a stack with this.
    var resultCallback = originalJasmine.createSpy('resultCallback'),
    spec = new jasmine.Spec({
      fn: function() {
        throw new Error();
      },
      catchExceptions: true,
      resultCallback: resultCallback
    });

    expect(resultCallback).not.toHaveBeenCalled();
    spec.execute();
    expect(resultCallback).toHaveBeenCalledWith(
      originalJasmine.objectContaining({status: 'failed'})
    );

  });

  it("throws when an exception occurs in the spec fn if catchExceptions is false", function() {
    //TODO: one day we should pass a stack with this.
    var resultCallback = originalJasmine.createSpy('resultCallback'),
    spec = new jasmine.Spec({
      fn: function() {
        throw new Error();
      },
      catchExceptions: false,
      resultCallback: resultCallback
    });

    expect(function() {
      spec.execute();
    }).toThrow();
  });

  it("should call the start callback before any befores are called", function() {
    var beforesWereCalled = false,
    startCallback = originalJasmine.createSpy('start-callback').andCallFake(function() {
      expect(beforesWereCalled).toBe(false);
    }),
    spec = new jasmine.Spec({
      fn: function() {
      },
      beforeFns: function() {
        return [function() {
          beforesWereCalled = true
        }]
      },
      startCallback: startCallback,
      catchExceptions: false,
      resultCallback: function() {
      }
    });

    spec.execute();
    expect(startCallback).toHaveBeenCalled();
  });

  it("can return its full name", function() {
    var spec = new jasmine.Spec({
      getSpecName: function(passedVal) {
        expect(passedVal).toBe(spec);
        return 'expected val';
      }
    });

    expect(spec.getFullName()).toBe('expected val');
  });

  it("can be disabled", function() {
    var startCallback = originalJasmine.createSpy('startCallback'),
    specBody = originalJasmine.createSpy('specBody'),
    resultCallback = originalJasmine.createSpy('resultCallback'),
    spec = new jasmine.Spec({
      startCallback: startCallback,
      fn: specBody,
      resultCallback: resultCallback

    });

    spec.disable();
    expect(spec.status()).toBe('disabled');

    spec.execute();

    expect(startCallback).not.toHaveBeenCalled();
    expect(specBody).not.toHaveBeenCalled();
    //TODO: with expected data.
    expect(resultCallback).toHaveBeenCalled();
  });
});

