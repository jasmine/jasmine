describe("ReportDispatcher", function() {

  it("builds an interface of requested methods", function() {
    var dispatcher = new jasmineUnderTest.ReportDispatcher(['foo', 'bar', 'baz']);

    expect(dispatcher.foo).toBeDefined();
    expect(dispatcher.bar).toBeDefined();
    expect(dispatcher.baz).toBeDefined();
  });

  it("dispatches requested methods to added reporters", function() {
    var queueRunnerFactory = jasmine.createSpy('queueRunner'),
      dispatcher = new jasmineUnderTest.ReportDispatcher(['foo', 'bar'], queueRunnerFactory),
      reporter = jasmine.createSpyObj('reporter', ['foo', 'bar']),
      anotherReporter = jasmine.createSpyObj('reporter', ['foo', 'bar']),
      completeCallback = jasmine.createSpy('complete');

    dispatcher.addReporter(reporter);
    dispatcher.addReporter(anotherReporter);

    dispatcher.foo(123, 456, completeCallback);

    expect(queueRunnerFactory).toHaveBeenCalledWith(jasmine.objectContaining({
      queueableFns: [{fn: jasmine.any(Function)}, {fn: jasmine.any(Function)}],
      isReporter: true
    }));

    var fns = queueRunnerFactory.calls.mostRecent().args[0].queueableFns;
    fns[0].fn();
    expect(reporter.foo).toHaveBeenCalledWith(123, 456);
    expect(reporter.foo.calls.mostRecent().object).toBe(reporter);

    fns[1].fn();
    expect(anotherReporter.foo).toHaveBeenCalledWith(123, 456);
    expect(anotherReporter.foo.calls.mostRecent().object).toBe(anotherReporter);

    queueRunnerFactory.calls.reset();

    dispatcher.bar('a', 'b', completeCallback);

    expect(queueRunnerFactory).toHaveBeenCalledWith(jasmine.objectContaining({
      queueableFns: [{fn: jasmine.any(Function)}, {fn: jasmine.any(Function)}],
      isReporter: true
    }));

    fns = queueRunnerFactory.calls.mostRecent().args[0].queueableFns;
    fns[0].fn();
    expect(reporter.bar).toHaveBeenCalledWith('a', 'b');

    fns[1].fn();
    expect(anotherReporter.bar).toHaveBeenCalledWith('a', 'b');
  });

  it("does not dispatch to a reporter if the reporter doesn't accept the method", function() {
    var queueRunnerFactory = jasmine.createSpy('queueRunner'),
      dispatcher = new jasmineUnderTest.ReportDispatcher(['foo'], queueRunnerFactory),
      reporter = jasmine.createSpyObj('reporter', ['baz']);

    dispatcher.addReporter(reporter);

    dispatcher.foo(123, 456);
    expect(queueRunnerFactory).toHaveBeenCalledWith(jasmine.objectContaining({
      queueableFns: []
    }));
  });

  it("allows providing a fallback reporter in case there's no other reporter", function() {
    var queueRunnerFactory = jasmine.createSpy('queueRunner'),
      dispatcher = new jasmineUnderTest.ReportDispatcher(['foo', 'bar'], queueRunnerFactory),
      reporter = jasmine.createSpyObj('reporter', ['foo', 'bar']),
      completeCallback = jasmine.createSpy('complete');

    dispatcher.provideFallbackReporter(reporter);
    dispatcher.foo(123, 456, completeCallback);

    expect(queueRunnerFactory).toHaveBeenCalledWith(jasmine.objectContaining({
      queueableFns: [{fn: jasmine.any(Function)}],
      isReporter: true
    }));

    var fns = queueRunnerFactory.calls.mostRecent().args[0].queueableFns;
    fns[0].fn();
    expect(reporter.foo).toHaveBeenCalledWith(123, 456);
  });

  it("does not call fallback reporting methods when another reporter is provided", function() {
    var queueRunnerFactory = jasmine.createSpy('queueRunner'),
      dispatcher = new jasmineUnderTest.ReportDispatcher(['foo', 'bar'], queueRunnerFactory),
      reporter = jasmine.createSpyObj('reporter', ['foo', 'bar']),
      fallbackReporter = jasmine.createSpyObj('otherReporter', ['foo', 'bar']),
      completeCallback = jasmine.createSpy('complete');

    dispatcher.provideFallbackReporter(fallbackReporter);
    dispatcher.addReporter(reporter);
    dispatcher.foo(123, 456, completeCallback);

    expect(queueRunnerFactory).toHaveBeenCalledWith(jasmine.objectContaining({
      queueableFns: [{fn: jasmine.any(Function)}],
      isReporter: true
    }));

    var fns = queueRunnerFactory.calls.mostRecent().args[0].queueableFns;
    fns[0].fn();
    expect(reporter.foo).toHaveBeenCalledWith(123, 456);
    expect(fallbackReporter.foo).not.toHaveBeenCalledWith(123, 456);
  });

  it("allows registered reporters to be cleared", function() {
    var queueRunnerFactory = jasmine.createSpy('queueRunner'),
        dispatcher = new jasmineUnderTest.ReportDispatcher(['foo', 'bar'], queueRunnerFactory),
        reporter1 = jasmine.createSpyObj('reporter1', ['foo', 'bar']),
        reporter2 = jasmine.createSpyObj('reporter2', ['foo', 'bar']),
      completeCallback = jasmine.createSpy('complete');

    dispatcher.addReporter(reporter1);
    dispatcher.foo(123, completeCallback);
    expect(queueRunnerFactory).toHaveBeenCalledWith(jasmine.objectContaining({
      queueableFns: [{fn: jasmine.any(Function)}],
      isReporter: true
    }));

    var fns = queueRunnerFactory.calls.mostRecent().args[0].queueableFns;
    fns[0].fn();
    expect(reporter1.foo).toHaveBeenCalledWith(123);

    dispatcher.clearReporters();
    dispatcher.addReporter(reporter2);
    dispatcher.bar(456, completeCallback);

    expect(queueRunnerFactory).toHaveBeenCalledWith(jasmine.objectContaining({
      queueableFns: [{fn: jasmine.any(Function)}],
      isReporter: true
    }));

    fns = queueRunnerFactory.calls.mostRecent().args[0].queueableFns;
    fns[0].fn();
    expect(reporter1.bar).not.toHaveBeenCalled();
    expect(reporter2.bar).toHaveBeenCalledWith(456);
  });
});
