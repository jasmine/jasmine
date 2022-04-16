describe('ClearStack', function() {
  it('works in an integrationy way', function(done) {
    const clearStack = jasmineUnderTest.getClearStack(
      jasmineUnderTest.getGlobal()
    );

    clearStack(function() {
      done();
    });
  });

  it('uses setImmediate when available', function() {
    const setImmediate = jasmine
        .createSpy('setImmediate')
        .and.callFake(function(fn) {
          fn();
        }),
      global = { setImmediate: setImmediate },
      clearStack = jasmineUnderTest.getClearStack(global);
    let called = false;

    clearStack(function() {
      called = true;
    });

    expect(called).toBe(true);
    expect(setImmediate).toHaveBeenCalled();
  });

  it('uses setTimeout instead of setImmediate every 10 calls to make sure we release the CPU', function() {
    const setImmediate = jasmine.createSpy('setImmediate'),
      setTimeout = jasmine.createSpy('setTimeout'),
      global = { setImmediate: setImmediate, setTimeout: setTimeout },
      clearStack = jasmineUnderTest.getClearStack(global);

    clearStack(function() {});
    clearStack(function() {});
    clearStack(function() {});
    clearStack(function() {});
    clearStack(function() {});
    clearStack(function() {});
    clearStack(function() {});
    clearStack(function() {});
    clearStack(function() {});

    expect(setImmediate).toHaveBeenCalled();
    expect(setTimeout).not.toHaveBeenCalled();

    clearStack(function() {});
    expect(setImmediate.calls.count()).toEqual(9);
    expect(setTimeout.calls.count()).toEqual(1);

    clearStack(function() {});
    expect(setImmediate.calls.count()).toEqual(10);
    expect(setTimeout.calls.count()).toEqual(1);
  });

  it('uses MessageChannels when available', function() {
    const fakeChannel = {
        port1: {},
        port2: {
          postMessage: function() {
            fakeChannel.port1.onmessage();
          }
        }
      },
      global = {
        MessageChannel: function() {
          return fakeChannel;
        }
      },
      clearStack = jasmineUnderTest.getClearStack(global);
    let called = false;

    clearStack(function() {
      called = true;
    });

    expect(called).toBe(true);
  });

  it('uses setTimeout instead of MessageChannel every 10 calls to make sure we release the CPU', function() {
    const fakeChannel = {
        port1: {},
        port2: {
          postMessage: jasmine
            .createSpy('postMessage')
            .and.callFake(function() {
              fakeChannel.port1.onmessage();
            })
        }
      },
      setTimeout = jasmine.createSpy('setTimeout'),
      global = {
        MessageChannel: function() {
          return fakeChannel;
        },
        setTimeout: setTimeout
      },
      clearStack = jasmineUnderTest.getClearStack(global);

    clearStack(function() {});
    clearStack(function() {});
    clearStack(function() {});
    clearStack(function() {});
    clearStack(function() {});
    clearStack(function() {});
    clearStack(function() {});
    clearStack(function() {});
    clearStack(function() {});

    expect(fakeChannel.port2.postMessage).toHaveBeenCalled();
    expect(setTimeout).not.toHaveBeenCalled();

    clearStack(function() {});
    expect(fakeChannel.port2.postMessage.calls.count()).toEqual(9);
    expect(setTimeout.calls.count()).toEqual(1);

    clearStack(function() {});
    expect(fakeChannel.port2.postMessage.calls.count()).toEqual(10);
    expect(setTimeout.calls.count()).toEqual(1);
  });

  it('calls setTimeout when onmessage is called recursively', function() {
    const fakeChannel = {
        port1: {},
        port2: {
          postMessage: function() {
            fakeChannel.port1.onmessage();
          }
        }
      },
      setTimeout = jasmine.createSpy('setTimeout'),
      global = {
        MessageChannel: function() {
          return fakeChannel;
        },
        setTimeout: setTimeout
      },
      clearStack = jasmineUnderTest.getClearStack(global),
      fn = jasmine.createSpy('second clearStack function');

    clearStack(function() {
      clearStack(fn);
    });

    expect(fn).not.toHaveBeenCalled();
    expect(setTimeout).toHaveBeenCalledWith(fn, 0);
  });

  it('falls back to setTimeout', function() {
    const setTimeout = jasmine
        .createSpy('setTimeout')
        .and.callFake(function(fn) {
          fn();
        }),
      global = { setTimeout: setTimeout },
      clearStack = jasmineUnderTest.getClearStack(global);
    let called = false;

    clearStack(function() {
      called = true;
    });

    expect(called).toBe(true);
    expect(setTimeout).toHaveBeenCalledWith(jasmine.any(Function), 0);
  });
});
