describe("ClearStack", function() {
  it("works in an integrationy way", function(done) {
    var clearStack = jasmineUnderTest.getClearStack(jasmineUnderTest.getGlobal());

    clearStack(function() {
      done();
    });
  });

  it("uses nextTick when available", function() {
    var nextTick = jasmine.createSpy('nextTick').and.callFake(function(fn) { fn() }),
        global = { process: { nextTick: nextTick } },
        clearStack = jasmineUnderTest.getClearStack(global),
        called = false;

    clearStack(function() {
      called = true;
    });

    expect(called).toBe(true);
    expect(nextTick).toHaveBeenCalled();
  });

  it("uses setImmediate when available", function() {
    var setImmediate = jasmine.createSpy('setImmediate').and.callFake(function(fn) { fn() }),
        global = { setImmediate: setImmediate },
        clearStack = jasmineUnderTest.getClearStack(global),
        called = false;

    clearStack(function() {
      called = true;
    });

    expect(called).toBe(true);
    expect(setImmediate).toHaveBeenCalled();
  });

  it("uses MessageChannels when available", function() {
    var fakeChannel = {
          port1: {},
          port2: { postMessage: function() { fakeChannel.port1.onmessage(); } }
        },
        global = { MessageChannel: function() { return fakeChannel; } },
        clearStack = jasmineUnderTest.getClearStack(global),
        called = false;

    clearStack(function() {
      called = true;
    });

    expect(called).toBe(true);
  });

  it("falls back to setTimeout", function() {
    var setTimeout = jasmine.createSpy('setTimeout').and.callFake(function(fn) { fn() }),
        global = { setTimeout: setTimeout },
        clearStack = jasmineUnderTest.getClearStack(global),
        called = false;

    clearStack(function() {
      called = true;
    });

    expect(called).toBe(true);
    expect(setTimeout).toHaveBeenCalledWith(jasmine.any(Function), 0);
  });
});
