describe("GlobalErrors", function() {
  it("is installed only when there are listeners", function() {
    var fakeGlobal = { onerror: null },
      errors = new jasmineUnderTest.GlobalErrors(fakeGlobal);

    errors.install();
    expect(fakeGlobal.onerror).toBeNull();

    errors.pushListener(function() {});
    expect(fakeGlobal.onerror).not.toBeNull();

    errors.pushListener(function() {});
    errors.popListener();
    expect(fakeGlobal.onerror).not.toBeNull();

    errors.popListener();
    expect(fakeGlobal.onerror).toBeNull();
  });

  it("calls the added handler on error", function() {
    var fakeGlobal = { onerror: null },
        handler = jasmine.createSpy('errorHandler'),
        errors = new jasmineUnderTest.GlobalErrors(fakeGlobal);

    errors.install();
    errors.pushListener(handler);

    fakeGlobal.onerror('foo');

    expect(handler).toHaveBeenCalledWith('foo');
  });

  it("only calls the most recent handler", function() {
    var fakeGlobal = { onerror: null },
        handler1 = jasmine.createSpy('errorHandler1'),
        handler2 = jasmine.createSpy('errorHandler2'),
        errors = new jasmineUnderTest.GlobalErrors(fakeGlobal);

    errors.install();
    errors.pushListener(handler1);
    errors.pushListener(handler2);

    fakeGlobal.onerror('foo');

    expect(handler1).not.toHaveBeenCalled();
    expect(handler2).toHaveBeenCalledWith('foo');
  });

  it("calls previous handlers when one is removed", function() {
    var fakeGlobal = { onerror: null },
        handler1 = jasmine.createSpy('errorHandler1'),
        handler2 = jasmine.createSpy('errorHandler2'),
        errors = new jasmineUnderTest.GlobalErrors(fakeGlobal);

    errors.install();
    errors.pushListener(handler1);
    errors.pushListener(handler2);

    errors.popListener();

    fakeGlobal.onerror('foo');

    expect(handler1).toHaveBeenCalledWith('foo');
    expect(handler2).not.toHaveBeenCalled();
  });

  it("uninstalls itself, putting back a previous callback", function() {
    var originalCallback = jasmine.createSpy('error'),
        fakeGlobal = { onerror: originalCallback },
        errors = new jasmineUnderTest.GlobalErrors(fakeGlobal);

    expect(fakeGlobal.onerror).toBe(originalCallback);

    errors.install();
    errors.pushListener(function() {});

    expect(fakeGlobal.onerror).not.toBe(originalCallback);

    errors.uninstall();

    expect(fakeGlobal.onerror).toBe(originalCallback);
  });

  it("works in node.js", function() {
    var fakeGlobal = {
          process: {
            on: jasmine.createSpy('process.on'),
            removeListener: jasmine.createSpy('process.removeListener'),
            listeners: jasmine.createSpy('process.listeners').and.returnValue(['foo']),
            removeAllListeners: jasmine.createSpy('process.removeAllListeners')
          }
        },
        handler = jasmine.createSpy('errorHandler'),
        errors = new jasmineUnderTest.GlobalErrors(fakeGlobal);

    errors.install();
    errors.pushListener(handler);
    expect(fakeGlobal.process.on).toHaveBeenCalledWith('uncaughtException', jasmine.any(Function));
    expect(fakeGlobal.process.listeners).toHaveBeenCalledWith('uncaughtException');
    expect(fakeGlobal.process.removeAllListeners).toHaveBeenCalledWith('uncaughtException');

    var addedListener = fakeGlobal.process.on.calls.argsFor(0)[1];
    addedListener(new Error('bar'));

    expect(handler).toHaveBeenCalledWith(new Error('bar'));

    errors.uninstall();

    expect(fakeGlobal.process.removeListener).toHaveBeenCalledWith('uncaughtException', addedListener);
    expect(fakeGlobal.process.on).toHaveBeenCalledWith('uncaughtException', 'foo');
  });
});
