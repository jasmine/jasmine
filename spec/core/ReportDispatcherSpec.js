describe('ReportDispatcher', function() {
  it('builds an interface of requested methods', function() {
    const dispatcher = new jasmineUnderTest.ReportDispatcher([
      'foo',
      'bar',
      'baz'
    ]);

    expect(dispatcher.foo).toBeDefined();
    expect(dispatcher.bar).toBeDefined();
    expect(dispatcher.baz).toBeDefined();
  });

  it('dispatches requested methods to added reporters', function() {
    const runQueue = jasmine.createSpy('runQueue'),
      dispatcher = new jasmineUnderTest.ReportDispatcher(
        ['foo', 'bar'],
        runQueue
      ),
      reporter = jasmine.createSpyObj('reporter', ['foo', 'bar']),
      anotherReporter = jasmine.createSpyObj('reporter', ['foo', 'bar']);

    dispatcher.addReporter(reporter);
    dispatcher.addReporter(anotherReporter);

    dispatcher.foo({ an: 'event' });

    expect(runQueue).toHaveBeenCalledWith(
      jasmine.objectContaining({
        queueableFns: [
          { fn: jasmine.any(Function) },
          { fn: jasmine.any(Function) }
        ],
        isReporter: true
      })
    );

    let fns = runQueue.calls.mostRecent().args[0].queueableFns;
    fns[0].fn();
    expect(reporter.foo).toHaveBeenCalledWith({ an: 'event' });
    expect(reporter.foo.calls.mostRecent().object).toBe(reporter);

    fns[1].fn();
    expect(anotherReporter.foo).toHaveBeenCalledWith({ an: 'event' });
    expect(anotherReporter.foo.calls.mostRecent().object).toBe(anotherReporter);

    runQueue.calls.reset();

    dispatcher.bar({ another: 'event' });

    expect(runQueue).toHaveBeenCalledWith(
      jasmine.objectContaining({
        queueableFns: [
          { fn: jasmine.any(Function) },
          { fn: jasmine.any(Function) }
        ],
        isReporter: true
      })
    );

    fns = runQueue.calls.mostRecent().args[0].queueableFns;
    fns[0].fn();
    expect(reporter.bar).toHaveBeenCalledWith({ another: 'event' });

    fns[1].fn();
    expect(anotherReporter.bar).toHaveBeenCalledWith({ another: 'event' });
  });

  it('passes each reporter a separate deep copy of the event', function() {
    const runQueue = jasmine.createSpy('runQueue');
    const dispatcher = new jasmineUnderTest.ReportDispatcher(
      ['foo', 'bar'],
      runQueue
    );
    const reporter = jasmine.createSpyObj('reporter', ['foo']);
    const anotherReporter = jasmine.createSpyObj('anotherReporter', ['foo']);
    const event = {
      child: {
        grandchild: 'something'
      }
    };
    dispatcher.addReporter(reporter);
    dispatcher.addReporter(anotherReporter);

    dispatcher.foo(event);

    for (const fn of runQueue.calls.mostRecent().args[0].queueableFns) {
      fn.fn();
    }

    expect(reporter.foo).toHaveBeenCalledWith(event);
    expect(anotherReporter.foo).toHaveBeenCalledWith(event);
    const receivedEvents = [reporter, anotherReporter].map(function(reporter) {
      return reporter.foo.calls.mostRecent().args[0];
    });
    expect(receivedEvents[0]).not.toBe(event);
    expect(receivedEvents[0]).not.toBe(receivedEvents[1]);
    expect(receivedEvents[0].child).not.toBe(event.child);
    expect(receivedEvents[0].child).not.toBe(receivedEvents[1].child);
  });

  it("does not dispatch to a reporter if the reporter doesn't accept the method", function() {
    const runQueue = jasmine.createSpy('runQueue'),
      dispatcher = new jasmineUnderTest.ReportDispatcher(['foo'], runQueue),
      reporter = jasmine.createSpyObj('reporter', ['baz']);

    dispatcher.addReporter(reporter);

    dispatcher.foo(123, 456);
    expect(runQueue).toHaveBeenCalledWith(
      jasmine.objectContaining({
        queueableFns: []
      })
    );
  });

  it("allows providing a fallback reporter in case there's no other reporter", function() {
    const runQueue = jasmine.createSpy('runQueue'),
      dispatcher = new jasmineUnderTest.ReportDispatcher(
        ['foo', 'bar'],
        runQueue
      ),
      reporter = jasmine.createSpyObj('reporter', ['foo', 'bar']);

    dispatcher.provideFallbackReporter(reporter);
    dispatcher.foo({ an: 'event' });

    expect(runQueue).toHaveBeenCalledWith(
      jasmine.objectContaining({
        queueableFns: [{ fn: jasmine.any(Function) }],
        isReporter: true
      })
    );

    const fns = runQueue.calls.mostRecent().args[0].queueableFns;
    fns[0].fn();
    expect(reporter.foo).toHaveBeenCalledWith({ an: 'event' });
  });

  it('does not call fallback reporting methods when another reporter is provided', function() {
    const runQueue = jasmine.createSpy('runQueue'),
      dispatcher = new jasmineUnderTest.ReportDispatcher(
        ['foo', 'bar'],
        runQueue
      ),
      reporter = jasmine.createSpyObj('reporter', ['foo', 'bar']),
      fallbackReporter = jasmine.createSpyObj('otherReporter', ['foo', 'bar']);

    dispatcher.provideFallbackReporter(fallbackReporter);
    dispatcher.addReporter(reporter);
    dispatcher.foo({ an: 'event' });

    expect(runQueue).toHaveBeenCalledWith(
      jasmine.objectContaining({
        queueableFns: [{ fn: jasmine.any(Function) }],
        isReporter: true
      })
    );

    const fns = runQueue.calls.mostRecent().args[0].queueableFns;
    fns[0].fn();
    expect(reporter.foo).toHaveBeenCalledWith({ an: 'event' });
    expect(fallbackReporter.foo).not.toHaveBeenCalled();
  });

  it('allows registered reporters to be cleared', function() {
    const runQueue = jasmine.createSpy('runQueue'),
      dispatcher = new jasmineUnderTest.ReportDispatcher(
        ['foo', 'bar'],
        runQueue
      ),
      reporter1 = jasmine.createSpyObj('reporter1', ['foo', 'bar']),
      reporter2 = jasmine.createSpyObj('reporter2', ['foo', 'bar']);

    dispatcher.addReporter(reporter1);
    dispatcher.foo({ an: 'event' });
    expect(runQueue).toHaveBeenCalledWith(
      jasmine.objectContaining({
        queueableFns: [{ fn: jasmine.any(Function) }],
        isReporter: true
      })
    );

    let fns = runQueue.calls.mostRecent().args[0].queueableFns;
    fns[0].fn();
    expect(reporter1.foo).toHaveBeenCalledWith({ an: 'event' });

    dispatcher.clearReporters();
    dispatcher.addReporter(reporter2);
    dispatcher.bar({ another: 'event' });

    expect(runQueue).toHaveBeenCalledWith(
      jasmine.objectContaining({
        queueableFns: [{ fn: jasmine.any(Function) }],
        isReporter: true
      })
    );

    fns = runQueue.calls.mostRecent().args[0].queueableFns;
    fns[0].fn();
    expect(reporter1.bar).not.toHaveBeenCalled();
    expect(reporter2.bar).toHaveBeenCalledWith({ another: 'event' });
  });
});
