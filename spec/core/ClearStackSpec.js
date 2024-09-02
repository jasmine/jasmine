describe('ClearStack', function() {
  it('works in an integrationy way', function(done) {
    const clearStack = jasmineUnderTest.getClearStack(
      jasmineUnderTest.getGlobal()
    );

    clearStack(function() {
      done();
    });
  });

  describe('in Safari', function() {
    usesQueueMicrotaskWithSetTimeout(function() {
      return {
        navigator: {
          userAgent:
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_6) AppleWebKit/605.0.8 (KHTML, like Gecko) Version/15.1 Safari/605.0.8'
        },
        // queueMicrotask should be used even though MessageChannel is present
        MessageChannel: fakeMessageChannel
      };
    });

    it('uses MessageChannel to reduce setTimeout clamping', function() {
      const fakeChannel = fakeMessageChannel();
      spyOn(fakeChannel.port2, 'postMessage');
      const queueMicrotask = jasmine.createSpy('queueMicrotask');
      const global = {
        navigator: {
          userAgent:
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_6) AppleWebKit/605.0.8 (KHTML, like Gecko) Version/15.1 Safari/605.0.8'
        },
        MessageChannel: function() {
          return fakeChannel;
        },
        queueMicrotask
      };

      const clearStack = jasmineUnderTest.getClearStack(global);

      for (let i = 0; i < 9; i++) clearStack(function() {});

      expect(fakeChannel.port2.postMessage).not.toHaveBeenCalled();

      clearStack(function() {});

      expect(fakeChannel.port2.postMessage).toHaveBeenCalledTimes(1);
    });
  });

  describe("in WebKit (Playwright's build for Windows)", function() {
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
  });

  describe('in browsers other than Safari', function() {
    usesMessageChannel(function() {
      return {
        navigator: {
          // Chrome's user agent string contains "Safari" so it's a good test case
          userAgent:
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/104.0.0.0 Safari/537.36'
        }
      };
    });

    describe('when MessageChannel is unavailable', function() {
      usesQueueMicrotaskWithSetTimeout(function() {
        return {
          navigator: {
            userAgent: 'CERN-LineMode/2.15 libwww/2.17b3',
            MessageChannel: undefined
          }
        };
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

  function usesMessageChannel(makeGlobal) {
    it('uses MessageChannel', function() {
      const global = {
        ...makeGlobal(),
        MessageChannel: fakeMessageChannel
      };
      const clearStack = jasmineUnderTest.getClearStack(global);
      let called = false;

      clearStack(function() {
        called = true;
      });

      expect(called).toBe(true);
    });

    it('uses setTimeout instead of MessageChannel every 10 calls to make sure we release the CPU', function() {
      const fakeChannel = fakeMessageChannel();
      spyOn(fakeChannel.port2, 'postMessage');
      const setTimeout = jasmine.createSpy('setTimeout');
      const global = {
        ...makeGlobal(),
        setTimeout,
        MessageChannel: function() {
          return fakeChannel;
        }
      };
      const clearStack = jasmineUnderTest.getClearStack(global);

      for (let i = 0; i < 9; i++) {
        clearStack(function() {});
      }

      expect(fakeChannel.port2.postMessage).toHaveBeenCalled();
      expect(setTimeout).not.toHaveBeenCalled();

      clearStack(function() {});
      expect(fakeChannel.port2.postMessage).toHaveBeenCalledTimes(9);
      expect(setTimeout).toHaveBeenCalledTimes(1);

      clearStack(function() {});
      expect(fakeChannel.port2.postMessage).toHaveBeenCalledTimes(10);
      expect(setTimeout).toHaveBeenCalledTimes(1);
    });

    it('calls setTimeout when onmessage is called recursively', function() {
      const setTimeout = jasmine.createSpy('setTimeout');
      const global = {
        ...makeGlobal(),
        setTimeout,
        MessageChannel: fakeMessageChannel
      };
      const clearStack = jasmineUnderTest.getClearStack(global);
      const fn = jasmine.createSpy('second clearStack function');

      clearStack(function() {
        clearStack(fn);
      });

      expect(fn).not.toHaveBeenCalled();
      expect(setTimeout).toHaveBeenCalledWith(fn, 0);
    });
  }

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
