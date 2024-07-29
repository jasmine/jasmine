describe('ClearStack', function() {
  it('works in an integrationy way', function(done) {
    const clearStack = jasmineUnderTest.getClearStack(
      jasmineUnderTest.getGlobal()
    );

    clearStack(function() {
      done();
    });
  });

  describe('in browsers', function() {
    usesQueueMicrotaskWithSetTimeout(function() {
      return {
        navigator: {
          userAgent:
            'Mozilla/5.0 (Windows NT 6.2; Win64; x64) AppleWebKit/605.1.15 (KHTML, like Gecko)'
        },
        // queueMicrotask should be used even though MessageChannel is present
        MessageChannel: fakeMessageChannel
      };
    });

    it('uses MessageChannel every four setTimeout calls to avoid timeout clamping', function() {
      const fakeChannel = fakeMessageChannel();
      spyOn(fakeChannel.port2, 'postMessage');
      const setTimeout = jasmine
        .createSpy('setTimeout')
        .and.callFake(function(fn) {
          fn();
        });
      const global = {
        queueMicrotask: function(fn) {
          fn();
        },
        setTimeout,
        MessageChannel: function() {
          return fakeChannel;
        }
      };
      const clearStack = jasmineUnderTest.getClearStack(global);

      for (let i = 0; i < 39; i++) clearStack(function() {});

      expect(setTimeout).toHaveBeenCalledTimes(3);
      expect(fakeChannel.port2.postMessage).not.toHaveBeenCalled();

      clearStack(function() {});
      expect(setTimeout).toHaveBeenCalledTimes(4);
      expect(fakeChannel.port2.postMessage).toHaveBeenCalledTimes(1);

      for (let i = 0; i < 39; i++) clearStack(function() {});
      expect(setTimeout).toHaveBeenCalledTimes(7);
      expect(fakeChannel.port2.postMessage).toHaveBeenCalledTimes(1);
    });

    describe('when MessageChannel is unavailable', function() {
      usesQueueMicrotaskWithSetTimeout(function() {
        return { MessageChannel: undefined };
      });
    });
  });

  describe('in Node', function() {
    usesQueueMicrotaskWithoutSetTimeout(function() {
      return {
        process: {
          versions: {
            node: '3.1415927'
          }
        }
      };
    });
  });

  function usesQueueMicrotaskWithSetTimeout(makeGlobal) {
    it('uses queueMicrotask', function() {
      const global = {
        ...makeGlobal(),
        queueMicrotask: function(fn) {
          fn();
        }
      };
      const clearStack = jasmineUnderTest.getClearStack(global);
      let called = false;

      clearStack(function() {
        called = true;
      });

      expect(called).toBe(true);
    });

    it('uses setTimeout instead of queueMicrotask every 10 calls to make sure we release the CPU', function() {
      const queueMicrotask = jasmine.createSpy('queueMicrotask');
      const setTimeout = jasmine.createSpy('setTimeout');
      const global = {
        ...makeGlobal(),
        queueMicrotask,
        setTimeout
      };
      const clearStack = jasmineUnderTest.getClearStack(global);

      for (let i = 0; i < 9; i++) {
        clearStack(function() {});
      }

      expect(queueMicrotask).toHaveBeenCalled();
      expect(setTimeout).not.toHaveBeenCalled();

      clearStack(function() {});
      expect(queueMicrotask).toHaveBeenCalledTimes(9);
      expect(setTimeout).toHaveBeenCalledTimes(1);

      clearStack(function() {});
      expect(queueMicrotask).toHaveBeenCalledTimes(10);
      expect(setTimeout).toHaveBeenCalledTimes(1);
    });
  }

  function usesQueueMicrotaskWithoutSetTimeout(makeGlobal) {
    it('uses queueMicrotask', function() {
      const global = {
        ...makeGlobal(),
        queueMicrotask: function(fn) {
          fn();
        }
      };
      const clearStack = jasmineUnderTest.getClearStack(global);
      let called = false;

      clearStack(function() {
        called = true;
      });

      expect(called).toBe(true);
    });

    it('does not use setTimeout', function() {
      const queueMicrotask = jasmine.createSpy('queueMicrotask');
      const setTimeout = jasmine.createSpy('setTimeout');
      const global = {
        ...makeGlobal(),
        queueMicrotask,
        setTimeout
      };
      const clearStack = jasmineUnderTest.getClearStack(global);

      clearStack(function() {});
      clearStack(function() {});
      clearStack(function() {});
      clearStack(function() {});
      clearStack(function() {});
      clearStack(function() {});
      clearStack(function() {});
      clearStack(function() {});
      clearStack(function() {});
      clearStack(function() {});

      expect(queueMicrotask).toHaveBeenCalledTimes(10);
      expect(setTimeout).not.toHaveBeenCalled();
    });
  }

  function fakeMessageChannel() {
    const channel = {
      port1: {},
      port2: {
        postMessage: function() {
          channel.port1.onmessage();
        }
      }
    };
    return channel;
  }
});
