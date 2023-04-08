describe('ParallelReportDispatcher', function() {
  it('dispatches the standard reporter events', async function() {
    const subject = new jasmineUnderTest.ParallelReportDispatcher(() => {}, {
      globalErrors: mockGlobalErrors()
    });
    const events = [
      'jasmineStarted',
      'jasmineDone',
      'suiteStarted',
      'suiteDone',
      'specStarted',
      'specDone'
    ];
    const reporter = jasmine.createSpyObj('reporter', events);
    subject.addReporter(reporter);

    for (const eventName of events) {
      const payload = { payloadFor: eventName };
      await subject[eventName](payload);
      expect(reporter[eventName]).toHaveBeenCalledWith(payload);
    }
  });

  it('installs and uninstalls the global error handler', function() {
    const globalErrors = mockGlobalErrors();
    const subject = new jasmineUnderTest.ParallelReportDispatcher(() => {}, {
      globalErrors
    });

    subject.installGlobalErrors();
    expect(globalErrors.install).toHaveBeenCalled();

    subject.uninstallGlobalErrors();
    expect(globalErrors.uninstall).toHaveBeenCalled();
  });

  it('handles global errors from async reporters', async function() {
    const globalErrors = mockGlobalErrors();
    const onError = jasmine.createSpy('onError');
    const subject = new jasmineUnderTest.ParallelReportDispatcher(onError, {
      globalErrors
    });
    const reporter = jasmine.createSpyObj('reporter', [
      'jasmineStarted',
      'jasmineDone'
    ]);
    let resolveStarted;
    reporter.jasmineStarted.and.callFake(function() {
      return new Promise(function(res) {
        resolveStarted = res;
      });
    });
    subject.addReporter(reporter);

    const promise = subject.jasmineStarted({});
    expect(globalErrors.pushListener).toHaveBeenCalled();
    expect(globalErrors.popListener).not.toHaveBeenCalled();
    const error = new Error('nope');
    globalErrors.pushListener.calls.argsFor(0)[0](error);
    expect(onError).toHaveBeenCalledWith(error);

    resolveStarted();
    await promise;
    expect(globalErrors.popListener).toHaveBeenCalled();
  });

  it('handles done(error) from callback-style async reporters', function() {
    const globalErrors = mockGlobalErrors();
    const onError = jasmine.createSpy('onError');
    const subject = new jasmineUnderTest.ParallelReportDispatcher(onError, {
      globalErrors
    });
    const reporter = jasmine.createSpyObj('reporter', [
      'jasmineStarted',
      'jasmineDone'
    ]);
    let callback;
    reporter.jasmineStarted = function(event, cb) {
      callback = cb;
    };
    subject.addReporter(reporter);

    subject.jasmineStarted({});

    expect(callback).toBeInstanceOf(Function);
    const error = new Error('nope');
    callback(error);

    expect(onError).toHaveBeenCalledWith(error);
  });

  it('handles done.fail() from callback-style async reporters', function() {
    const globalErrors = mockGlobalErrors();
    const onError = jasmine.createSpy('onError');
    const subject = new jasmineUnderTest.ParallelReportDispatcher(onError, {
      globalErrors
    });
    const reporter = jasmine.createSpyObj('reporter', [
      'jasmineStarted',
      'jasmineDone'
    ]);
    let callback;
    reporter.jasmineStarted = function(event, cb) {
      callback = cb;
    };
    subject.addReporter(reporter);

    subject.jasmineStarted({});

    expect(callback).toBeInstanceOf(Function);
    const error = new Error('nope');
    callback.fail(error);
    expect(onError).toHaveBeenCalledWith(error);
    onError.calls.reset();

    callback.fail();
    expect(onError).toHaveBeenCalledWith(
      new Error('A reporter called done.fail()')
    );
  });

  it('handles errors due to mixed async style in reporters', async function() {
    const globalErrors = mockGlobalErrors();
    const onError = jasmine.createSpy('onError');
    const subject = new jasmineUnderTest.ParallelReportDispatcher(onError, {
      globalErrors
    });
    subject.addReporter({
      async jasmineStarted(event, done) {
        done();
      }
    });

    await subject.jasmineStarted({});
    expect(onError).toHaveBeenCalledWith(
      new Error(
        'An asynchronous before/it/after function took a done callback but also returned a promise. Either remove the done callback (recommended) or change the function to not return a promise.'
      )
    );
  });

  it('handles errors due to multiple done calls in reporters', async function() {
    const globalErrors = mockGlobalErrors();
    const onError = jasmine.createSpy('onError');
    const subject = new jasmineUnderTest.ParallelReportDispatcher(onError, {
      globalErrors
    });
    subject.addReporter({
      jasmineStarted(event, done) {
        done();
        done();
      }
    });

    await subject.jasmineStarted({});
    expect(onError).toHaveBeenCalledWith(
      new Error(
        "An asynchronous reporter callback called its 'done' callback more than once."
      )
    );
  });

  function mockGlobalErrors() {
    const globalErrors = jasmine.createSpyObj('globalErrors', [
      'install',
      'pushListener',
      'popListener'
    ]);

    globalErrors.install.and.callFake(function() {
      globalErrors.uninstall = jasmine.createSpy('globalErrors.uninstall');
    });

    return globalErrors;
  }
});
