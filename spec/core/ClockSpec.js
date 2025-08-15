describe('Clock', function() {
  const NODE_JS =
    typeof process !== 'undefined' &&
    process.versions &&
    typeof process.versions.node === 'string';

  it('does not replace setTimeout until it is installed', function() {
    const fakeSetTimeout = jasmine.createSpy('global setTimeout'),
      fakeGlobal = { setTimeout: fakeSetTimeout },
      delayedFunctionScheduler = jasmine.createSpyObj(
        'delayedFunctionScheduler',
        ['scheduleFunction']
      ),
      delayedFn = jasmine.createSpy('delayedFn'),
      mockDate = {
        install: function() {},
        tick: function() {},
        uninstall: function() {}
      },
      clock = new jasmineUnderTest.Clock(
        fakeGlobal,
        function() {
          return delayedFunctionScheduler;
        },
        mockDate
      );

    fakeGlobal.setTimeout(delayedFn, 0);

    expect(fakeSetTimeout).toHaveBeenCalledWith(delayedFn, 0);
    expect(delayedFunctionScheduler.scheduleFunction).not.toHaveBeenCalled();

    fakeSetTimeout.calls.reset();

    clock.install();
    fakeGlobal.setTimeout(delayedFn, 0);

    expect(delayedFunctionScheduler.scheduleFunction).toHaveBeenCalled();
    expect(fakeSetTimeout).not.toHaveBeenCalled();
  });

  it('does not replace clearTimeout until it is installed', function() {
    const fakeClearTimeout = jasmine.createSpy('global cleartimeout'),
      fakeGlobal = { clearTimeout: fakeClearTimeout },
      delayedFunctionScheduler = jasmine.createSpyObj(
        'delayedFunctionScheduler',
        ['removeFunctionWithId']
      ),
      mockDate = {
        install: function() {},
        tick: function() {},
        uninstall: function() {}
      },
      clock = new jasmineUnderTest.Clock(
        fakeGlobal,
        function() {
          return delayedFunctionScheduler;
        },
        mockDate
      );

    fakeGlobal.clearTimeout('foo');

    expect(fakeClearTimeout).toHaveBeenCalledWith('foo');
    expect(
      delayedFunctionScheduler.removeFunctionWithId
    ).not.toHaveBeenCalled();

    fakeClearTimeout.calls.reset();

    clock.install();
    fakeGlobal.clearTimeout('foo');

    expect(delayedFunctionScheduler.removeFunctionWithId).toHaveBeenCalled();
    expect(fakeClearTimeout).not.toHaveBeenCalled();
  });

  it('does not replace setInterval until it is installed', function() {
    const fakeSetInterval = jasmine.createSpy('global setInterval'),
      fakeGlobal = { setInterval: fakeSetInterval },
      delayedFunctionScheduler = jasmine.createSpyObj(
        'delayedFunctionScheduler',
        ['scheduleFunction']
      ),
      delayedFn = jasmine.createSpy('delayedFn'),
      mockDate = {
        install: function() {},
        tick: function() {},
        uninstall: function() {}
      },
      clock = new jasmineUnderTest.Clock(
        fakeGlobal,
        function() {
          return delayedFunctionScheduler;
        },
        mockDate
      );

    fakeGlobal.setInterval(delayedFn, 0);

    expect(fakeSetInterval).toHaveBeenCalledWith(delayedFn, 0);
    expect(delayedFunctionScheduler.scheduleFunction).not.toHaveBeenCalled();

    fakeSetInterval.calls.reset();

    clock.install();
    fakeGlobal.setInterval(delayedFn, 0);

    expect(delayedFunctionScheduler.scheduleFunction).toHaveBeenCalled();
    expect(fakeSetInterval).not.toHaveBeenCalled();
  });

  it('does not replace clearInterval until it is installed', function() {
    const fakeClearInterval = jasmine.createSpy('global clearinterval'),
      fakeGlobal = { clearInterval: fakeClearInterval },
      delayedFunctionScheduler = jasmine.createSpyObj(
        'delayedFunctionScheduler',
        ['removeFunctionWithId']
      ),
      mockDate = {
        install: function() {},
        tick: function() {},
        uninstall: function() {}
      },
      clock = new jasmineUnderTest.Clock(
        fakeGlobal,
        function() {
          return delayedFunctionScheduler;
        },
        mockDate
      );

    fakeGlobal.clearInterval('foo');

    expect(fakeClearInterval).toHaveBeenCalledWith('foo');
    expect(
      delayedFunctionScheduler.removeFunctionWithId
    ).not.toHaveBeenCalled();

    fakeClearInterval.calls.reset();

    clock.install();
    fakeGlobal.clearInterval('foo');

    expect(delayedFunctionScheduler.removeFunctionWithId).toHaveBeenCalled();
    expect(fakeClearInterval).not.toHaveBeenCalled();
  });

  it('does not install if the current setTimeout is not the original function on the global', function() {
    const originalFakeSetTimeout = function() {},
      replacedSetTimeout = function() {},
      fakeGlobal = { setTimeout: originalFakeSetTimeout },
      delayedFunctionSchedulerFactory = jasmine.createSpy(
        'delayedFunctionSchedulerFactory'
      ),
      mockDate = {},
      clock = new jasmineUnderTest.Clock(
        fakeGlobal,
        delayedFunctionSchedulerFactory,
        mockDate
      );

    fakeGlobal.setTimeout = replacedSetTimeout;

    expect(function() {
      clock.install();
    }).toThrowError(/unable to install/);

    expect(delayedFunctionSchedulerFactory).not.toHaveBeenCalled();
    expect(fakeGlobal.setTimeout).toBe(replacedSetTimeout);
  });

  it('does not install if the current clearTimeout is not the original function on the global', function() {
    const originalFakeClearTimeout = function() {},
      replacedClearTimeout = function() {},
      fakeGlobal = { clearTimeout: originalFakeClearTimeout },
      delayedFunctionSchedulerFactory = jasmine.createSpy(
        'delayedFunctionSchedulerFactory'
      ),
      mockDate = {},
      clock = new jasmineUnderTest.Clock(
        fakeGlobal,
        delayedFunctionSchedulerFactory,
        mockDate
      );

    fakeGlobal.clearTimeout = replacedClearTimeout;

    expect(function() {
      clock.install();
    }).toThrowError(/unable to install/);

    expect(delayedFunctionSchedulerFactory).not.toHaveBeenCalled();
    expect(fakeGlobal.clearTimeout).toBe(replacedClearTimeout);
  });

  it('does not install if the current setInterval is not the original function on the global', function() {
    const originalFakeSetInterval = function() {},
      replacedSetInterval = function() {},
      fakeGlobal = { setInterval: originalFakeSetInterval },
      delayedFunctionSchedulerFactory = jasmine.createSpy(
        'delayedFunctionSchedulerFactory'
      ),
      mockDate = {},
      clock = new jasmineUnderTest.Clock(
        fakeGlobal,
        delayedFunctionSchedulerFactory,
        mockDate
      );

    fakeGlobal.setInterval = replacedSetInterval;

    expect(function() {
      clock.install();
    }).toThrowError(/unable to install/);

    expect(delayedFunctionSchedulerFactory).not.toHaveBeenCalled();
    expect(fakeGlobal.setInterval).toBe(replacedSetInterval);
  });

  it('does not install if the current clearInterval is not the original function on the global', function() {
    const originalFakeClearInterval = function() {},
      replacedClearInterval = function() {},
      fakeGlobal = { clearInterval: originalFakeClearInterval },
      delayedFunctionSchedulerFactory = jasmine.createSpy(
        'delayedFunctionSchedulerFactory'
      ),
      mockDate = {},
      clock = new jasmineUnderTest.Clock(
        fakeGlobal,
        delayedFunctionSchedulerFactory,
        mockDate
      );

    fakeGlobal.clearInterval = replacedClearInterval;

    expect(function() {
      clock.install();
    }).toThrowError(/unable to install/);

    expect(delayedFunctionSchedulerFactory).not.toHaveBeenCalled();
    expect(fakeGlobal.clearInterval).toBe(replacedClearInterval);
  });

  it('replaces the global timer functions on uninstall', function() {
    const fakeSetTimeout = jasmine.createSpy('global setTimeout'),
      fakeClearTimeout = jasmine.createSpy('global clearTimeout'),
      fakeSetInterval = jasmine.createSpy('global setInterval'),
      fakeClearInterval = jasmine.createSpy('global clearInterval'),
      fakeGlobal = {
        setTimeout: fakeSetTimeout,
        clearTimeout: fakeClearTimeout,
        setInterval: fakeSetInterval,
        clearInterval: fakeClearInterval
      },
      delayedFunctionScheduler = jasmine.createSpyObj(
        'delayedFunctionScheduler',
        ['scheduleFunction', 'reset']
      ),
      delayedFn = jasmine.createSpy('delayedFn'),
      mockDate = {
        install: function() {},
        tick: function() {},
        uninstall: function() {}
      },
      clock = new jasmineUnderTest.Clock(
        fakeGlobal,
        function() {
          return delayedFunctionScheduler;
        },
        mockDate
      );

    clock.install();
    clock.uninstall();
    fakeGlobal.setTimeout(delayedFn, 0);
    fakeGlobal.clearTimeout('foo');
    fakeGlobal.setInterval(delayedFn, 10);
    fakeGlobal.clearInterval('bar');

    expect(fakeSetTimeout).toHaveBeenCalledWith(delayedFn, 0);
    expect(fakeClearTimeout).toHaveBeenCalledWith('foo');
    expect(fakeSetInterval).toHaveBeenCalledWith(delayedFn, 10);
    expect(fakeClearInterval).toHaveBeenCalledWith('bar');
    expect(delayedFunctionScheduler.scheduleFunction).not.toHaveBeenCalled();
  });

  it('can be installed for the duration of a passed in function and uninstalled when done', function() {
    const fakeSetTimeout = jasmine.createSpy('global setTimeout'),
      fakeClearTimeout = jasmine.createSpy('global clearTimeout'),
      fakeSetInterval = jasmine.createSpy('global setInterval'),
      fakeClearInterval = jasmine.createSpy('global clearInterval'),
      fakeGlobal = {
        setTimeout: fakeSetTimeout,
        clearTimeout: fakeClearTimeout,
        setInterval: fakeSetInterval,
        clearInterval: fakeClearInterval
      },
      delayedFunctionScheduler = jasmine.createSpyObj(
        'delayedFunctionScheduler',
        ['scheduleFunction', 'reset', 'removeFunctionWithId']
      ),
      delayedFn = jasmine.createSpy('delayedFn'),
      mockDate = {
        install: function() {},
        tick: function() {},
        uninstall: function() {}
      },
      clock = new jasmineUnderTest.Clock(
        fakeGlobal,
        function() {
          return delayedFunctionScheduler;
        },
        mockDate
      );
    let passedFunctionCalled = false;

    clock.withMock(function() {
      fakeGlobal.setTimeout(delayedFn, 0);
      fakeGlobal.clearTimeout('foo');
      fakeGlobal.setInterval(delayedFn, 10);
      fakeGlobal.clearInterval('bar');
      passedFunctionCalled = true;
    });

    expect(passedFunctionCalled).toBe(true);

    expect(fakeSetTimeout).not.toHaveBeenCalled();
    expect(fakeClearTimeout).not.toHaveBeenCalled();
    expect(fakeSetInterval).not.toHaveBeenCalled();
    expect(fakeClearInterval).not.toHaveBeenCalled();
    expect(delayedFunctionScheduler.scheduleFunction).toHaveBeenCalled();

    delayedFunctionScheduler.scheduleFunction.calls.reset();

    fakeGlobal.setTimeout(delayedFn, 0);
    fakeGlobal.clearTimeout('foo');
    fakeGlobal.setInterval(delayedFn, 10);
    fakeGlobal.clearInterval('bar');

    expect(fakeSetTimeout).toHaveBeenCalledWith(delayedFn, 0);
    expect(fakeClearTimeout).toHaveBeenCalledWith('foo');
    expect(fakeSetInterval).toHaveBeenCalledWith(delayedFn, 10);
    expect(fakeClearInterval).toHaveBeenCalledWith('bar');
    expect(delayedFunctionScheduler.scheduleFunction).not.toHaveBeenCalled();
  });

  it('can be installed for the duration of a passed in function and uninstalled if an error is thrown', function() {
    const fakeSetTimeout = jasmine.createSpy('global setTimeout'),
      fakeClearTimeout = jasmine.createSpy('global clearTimeout'),
      fakeSetInterval = jasmine.createSpy('global setInterval'),
      fakeClearInterval = jasmine.createSpy('global clearInterval'),
      fakeGlobal = {
        setTimeout: fakeSetTimeout,
        clearTimeout: fakeClearTimeout,
        setInterval: fakeSetInterval,
        clearInterval: fakeClearInterval
      },
      delayedFunctionScheduler = jasmine.createSpyObj(
        'delayedFunctionScheduler',
        ['scheduleFunction', 'reset', 'removeFunctionWithId']
      ),
      delayedFn = jasmine.createSpy('delayedFn'),
      mockDate = {
        install: function() {},
        tick: function() {},
        uninstall: function() {}
      },
      clock = new jasmineUnderTest.Clock(
        fakeGlobal,
        function() {
          return delayedFunctionScheduler;
        },
        mockDate
      );
    let passedFunctionCalled = false;

    expect(function() {
      clock.withMock(function() {
        fakeGlobal.setTimeout(delayedFn, 0);
        fakeGlobal.clearTimeout('foo');
        fakeGlobal.setInterval(delayedFn, 10);
        fakeGlobal.clearInterval('bar');
        passedFunctionCalled = true;
        throw 'oops';
      });
    }).toThrow('oops');

    expect(passedFunctionCalled).toBe(true);

    expect(fakeSetTimeout).not.toHaveBeenCalled();
    expect(fakeClearTimeout).not.toHaveBeenCalled();
    expect(fakeSetInterval).not.toHaveBeenCalled();
    expect(fakeClearInterval).not.toHaveBeenCalled();
    expect(delayedFunctionScheduler.scheduleFunction).toHaveBeenCalled();

    delayedFunctionScheduler.scheduleFunction.calls.reset();

    fakeGlobal.setTimeout(delayedFn, 0);
    fakeGlobal.clearTimeout('foo');
    fakeGlobal.setInterval(delayedFn, 10);
    fakeGlobal.clearInterval('bar');

    expect(fakeSetTimeout).toHaveBeenCalledWith(delayedFn, 0);
    expect(fakeClearTimeout).toHaveBeenCalledWith('foo');
    expect(fakeSetInterval).toHaveBeenCalledWith(delayedFn, 10);
    expect(fakeClearInterval).toHaveBeenCalledWith('bar');
    expect(delayedFunctionScheduler.scheduleFunction).not.toHaveBeenCalled();
  });

  it('schedules the delayed function (via setTimeout) with the fake timer', function() {
    const fakeSetTimeout = jasmine.createSpy('setTimeout'),
      scheduleFunction = jasmine.createSpy('scheduleFunction'),
      delayedFunctionScheduler = { scheduleFunction: scheduleFunction },
      fakeGlobal = { setTimeout: fakeSetTimeout },
      delayedFn = jasmine.createSpy('delayedFn'),
      mockDate = {
        install: function() {},
        tick: function() {},
        uninstall: function() {}
      },
      clock = new jasmineUnderTest.Clock(
        fakeGlobal,
        function() {
          return delayedFunctionScheduler;
        },
        mockDate
      ),
      timeout = new clock.FakeTimeout();

    clock.install();
    clock.setTimeout(delayedFn, 0, 'a', 'b');

    expect(fakeSetTimeout).not.toHaveBeenCalled();

    if (!NODE_JS) {
      expect(delayedFunctionScheduler.scheduleFunction).toHaveBeenCalledWith(
        delayedFn,
        0,
        ['a', 'b']
      );
    } else {
      expect(delayedFunctionScheduler.scheduleFunction).toHaveBeenCalledWith(
        delayedFn,
        0,
        ['a', 'b'],
        false,
        timeout
      );
    }
  });

  it('returns an id for the delayed function', function() {
    const fakeSetTimeout = jasmine.createSpy('setTimeout'),
      scheduleId = 123,
      scheduleFunction = jasmine
        .createSpy('scheduleFunction')
        .and.returnValue(scheduleId),
      delayedFunctionScheduler = { scheduleFunction: scheduleFunction },
      fakeGlobal = { setTimeout: fakeSetTimeout },
      delayedFn = jasmine.createSpy('delayedFn'),
      mockDate = {
        install: function() {},
        tick: function() {},
        uninstall: function() {}
      },
      clock = new jasmineUnderTest.Clock(
        fakeGlobal,
        function() {
          return delayedFunctionScheduler;
        },
        mockDate
      );

    clock.install();
    const timeout = clock.setTimeout(delayedFn, 0);

    if (!NODE_JS) {
      expect(timeout).toEqual(123);
    } else {
      expect(timeout.constructor.name).toEqual('FakeTimeout');
    }
  });

  it('clears the scheduled function with the scheduler', function() {
    const fakeClearTimeout = jasmine.createSpy('clearTimeout'),
      delayedFunctionScheduler = jasmine.createSpyObj(
        'delayedFunctionScheduler',
        ['removeFunctionWithId']
      ),
      fakeGlobal = { setTimeout: fakeClearTimeout },
      mockDate = {
        install: function() {},
        tick: function() {},
        uninstall: function() {}
      },
      clock = new jasmineUnderTest.Clock(
        fakeGlobal,
        function() {
          return delayedFunctionScheduler;
        },
        mockDate
      );

    clock.install();
    clock.clearTimeout(123);

    expect(fakeClearTimeout).not.toHaveBeenCalled();
    expect(delayedFunctionScheduler.removeFunctionWithId).toHaveBeenCalledWith(
      123
    );
  });

  it('schedules the delayed function with the fake timer', function() {
    const fakeSetInterval = jasmine.createSpy('setInterval'),
      scheduleFunction = jasmine.createSpy('scheduleFunction'),
      delayedFunctionScheduler = { scheduleFunction: scheduleFunction },
      fakeGlobal = { setInterval: fakeSetInterval },
      delayedFn = jasmine.createSpy('delayedFn'),
      mockDate = {
        install: function() {},
        tick: function() {},
        uninstall: function() {}
      },
      clock = new jasmineUnderTest.Clock(
        fakeGlobal,
        function() {
          return delayedFunctionScheduler;
        },
        mockDate
      ),
      timeout = new clock.FakeTimeout();

    clock.install();
    clock.setInterval(delayedFn, 0, 'a', 'b');

    expect(fakeSetInterval).not.toHaveBeenCalled();

    if (!NODE_JS) {
      expect(delayedFunctionScheduler.scheduleFunction).toHaveBeenCalledWith(
        delayedFn,
        0,
        ['a', 'b'],
        true
      );
    } else {
      expect(delayedFunctionScheduler.scheduleFunction).toHaveBeenCalledWith(
        delayedFn,
        0,
        ['a', 'b'],
        true,
        timeout
      );
    }
  });

  it('returns an id for the delayed function', function() {
    const fakeSetInterval = jasmine.createSpy('setInterval'),
      scheduleId = 123,
      scheduleFunction = jasmine
        .createSpy('scheduleFunction')
        .and.returnValue(scheduleId),
      delayedFunctionScheduler = { scheduleFunction: scheduleFunction },
      fakeGlobal = { setInterval: fakeSetInterval },
      delayedFn = jasmine.createSpy('delayedFn'),
      mockDate = {
        install: function() {},
        tick: function() {},
        uninstall: function() {}
      },
      clock = new jasmineUnderTest.Clock(
        fakeGlobal,
        function() {
          return delayedFunctionScheduler;
        },
        mockDate
      );

    clock.install();
    const interval = clock.setInterval(delayedFn, 0);

    if (!NODE_JS) {
      expect(interval).toEqual(123);
    } else {
      expect(interval.constructor.name).toEqual('FakeTimeout');
    }
  });

  it('clears the scheduled function with the scheduler', function() {
    const clearInterval = jasmine.createSpy('clearInterval'),
      delayedFunctionScheduler = jasmine.createSpyObj(
        'delayedFunctionScheduler',
        ['removeFunctionWithId']
      ),
      fakeGlobal = { setInterval: clearInterval },
      mockDate = {
        install: function() {},
        tick: function() {},
        uninstall: function() {}
      },
      clock = new jasmineUnderTest.Clock(
        fakeGlobal,
        function() {
          return delayedFunctionScheduler;
        },
        mockDate
      );

    clock.install();
    clock.clearInterval(123);

    expect(clearInterval).not.toHaveBeenCalled();
    expect(delayedFunctionScheduler.removeFunctionWithId).toHaveBeenCalledWith(
      123
    );
  });

  it('gives you a friendly reminder if the Clock is not installed and you tick', function() {
    const clock = new jasmineUnderTest.Clock(
      {},
      jasmine.createSpyObj('delayedFunctionScheduler', ['tick'])
    );
    expect(function() {
      clock.tick(50);
    }).toThrow();
  });
});

describe('Clock (acceptance)', function() {
  it('can run setTimeouts/setIntervals synchronously', function() {
    const delayedFn1 = jasmine.createSpy('delayedFn1'),
      delayedFn2 = jasmine.createSpy('delayedFn2'),
      delayedFn3 = jasmine.createSpy('delayedFn3'),
      recurring1 = jasmine.createSpy('recurring1'),
      delayedFunctionScheduler = new jasmineUnderTest.DelayedFunctionScheduler(),
      mockDate = {
        install: function() {},
        tick: function() {},
        uninstall: function() {}
      },
      clock = new jasmineUnderTest.Clock(
        { setTimeout: setTimeout },
        function() {
          return delayedFunctionScheduler;
        },
        mockDate
      );

    clock.install();

    clock.setTimeout(delayedFn1, 0);
    const intervalId = clock.setInterval(recurring1, 50);
    clock.setTimeout(delayedFn2, 100);
    clock.setTimeout(delayedFn3, 200);

    expect(delayedFn1).not.toHaveBeenCalled();
    expect(delayedFn2).not.toHaveBeenCalled();
    expect(delayedFn3).not.toHaveBeenCalled();

    clock.tick(0);

    expect(delayedFn1).toHaveBeenCalled();
    expect(delayedFn2).not.toHaveBeenCalled();
    expect(delayedFn3).not.toHaveBeenCalled();

    clock.tick(50);

    expect(recurring1).toHaveBeenCalled();
    expect(recurring1.calls.count()).toBe(1);
    expect(delayedFn2).not.toHaveBeenCalled();
    expect(delayedFn3).not.toHaveBeenCalled();

    clock.tick(50);

    expect(recurring1.calls.count()).toBe(2);
    expect(delayedFn2).toHaveBeenCalled();
    expect(delayedFn3).not.toHaveBeenCalled();

    clock.tick(100);

    expect(recurring1.calls.count()).toBe(4);
    expect(delayedFn3).toHaveBeenCalled();

    clock.clearInterval(intervalId);
    clock.tick(50);

    expect(recurring1.calls.count()).toBe(4);
  });

  describe('auto tick mode', () => {
    let delayedFunctionScheduler;
    let mockDate;
    let clock;

    beforeEach(() => {
      delayedFunctionScheduler = new jasmineUnderTest.DelayedFunctionScheduler();
      mockDate = {
        install: function() {},
        tick: function() {},
        uninstall: function() {}
      };
      // window setTimeout to window to make firefox happy
      const _setTimeout =
        typeof window !== 'undefined' ? setTimeout.bind(window) : setTimeout;
      // passing a fake global allows us to preserve the real timing functions for use in tests
      const _global = { setTimeout: _setTimeout, setInterval: setInterval };
      clock = new jasmineUnderTest.Clock(
        _global,
        function() {
          return delayedFunctionScheduler;
        },
        mockDate
      );
      clock.install().autoTick();
    });

    afterEach(() => {
      clock.uninstall();
    });

    it('flushes microtask queue between macrotasks', async () => {
      const log = [];
      await new Promise(r => clock.setTimeout(r, 10)).then(() => {
        log.push(1);
        Promise.resolve().then(() => log.push(2));
        Promise.resolve().then(() => log.push(3));
      });
      await new Promise(r => clock.setTimeout(r, 10)).then(() => {
        log.push(4);
        Promise.resolve().then(() => log.push(5));
      });
      expect(log).toEqual([1, 2, 3, 4, 5]);
    });

    it('can run setTimeouts/setIntervals asynchronously', function() {
      const recurring = jasmine.createSpy('recurring'),
        fn1 = jasmine.createSpy('fn1'),
        fn2 = jasmine.createSpy('fn2'),
        fn3 = jasmine.createSpy('fn3');

      const intervalId = clock.setInterval(recurring, 50);
      // In a microtask, add some timeouts.
      Promise.resolve()
        .then(function() {
          return new Promise(function(resolve) {
            clock.setTimeout(resolve, 25);
          });
        })
        .then(function() {
          fn1();
          return new Promise(function(resolve) {
            clock.setTimeout(resolve, 200);
          });
        })
        .then(function() {
          fn2();
          return new Promise(function(resolve) {
            clock.setTimeout(resolve, 100);
          });
        })
        .then(function() {
          fn3();
        });

      expect(recurring).not.toHaveBeenCalled();
      expect(fn1).not.toHaveBeenCalled();
      expect(fn2).not.toHaveBeenCalled();
      expect(fn3).not.toHaveBeenCalled();

      return new Promise(resolve => clock.setTimeout(resolve, 50))
        .then(function() {
          expect(recurring).toHaveBeenCalledTimes(1);
          expect(fn1).toHaveBeenCalled();
          expect(fn2).not.toHaveBeenCalled();
          expect(fn3).not.toHaveBeenCalled();

          return new Promise(resolve => clock.setTimeout(resolve, 175));
        })
        .then(function() {
          expect(recurring).toHaveBeenCalledTimes(4);
          expect(fn1).toHaveBeenCalled();
          expect(fn2).toHaveBeenCalled();
          expect(fn3).not.toHaveBeenCalled();

          clock.clearInterval(intervalId);
          return new Promise(resolve => clock.setTimeout(resolve, 100));
        })
        .then(function() {
          expect(recurring).toHaveBeenCalledTimes(4);
          expect(fn1).toHaveBeenCalled();
          expect(fn2).toHaveBeenCalled();
          expect(fn3).toHaveBeenCalled();
        });
    });

    it('aborts auto ticking when uninstalled, even if installed again synchonrously', async () => {
      clock.uninstall();
      clock.install();

      let resolved = false;
      const promise = new Promise(resolve => {
        clock.setTimeout(resolve, 1);
      }).then(() => {
        resolved = true;
      });

      // wait some real time and verify that the clock did not flush the timer above automatically
      await new Promise(resolve => setTimeout(resolve, 2));
      expect(resolved).toBe(false);

      // enabling auto tick again will flush the timer
      clock.autoTick();
      await expectAsync(promise).toBeResolved();
    });

    it('speeds up the execution of the timers in all browsers', async () => {
      const startTimeMs = performance.now() / 1000;
      await new Promise(resolve => clock.setTimeout(resolve, 5000));
      await new Promise(resolve => clock.setTimeout(resolve, 5000));
      await new Promise(resolve => clock.setTimeout(resolve, 5000));
      await new Promise(resolve => clock.setTimeout(resolve, 5000));
      const endTimeMs = performance.now() / 1000;
      // Ensure we didn't take 20s to complete the awaits above and, in fact, can do it in a fraction of a second
      expect(endTimeMs - startTimeMs).toBeLessThan(100);
    });

    it('is easy to test async functions with interleaved timers and microtasks', async () => {
      async function blackBoxWithLotsOfAsyncStuff() {
        await new Promise(r => clock.setTimeout(r, 10));
        await Promise.resolve();
        await Promise.resolve();
        await new Promise(r => clock.setTimeout(r, 20));
        await Promise.resolve();
        await Promise.resolve();
        await Promise.resolve();
        return 'done';
      }
      const result = await blackBoxWithLotsOfAsyncStuff();
      expect(result).toBe('done');
    });
  });

  it('can clear a previously set timeout', function() {
    const clearedFn = jasmine.createSpy('clearedFn'),
      delayedFunctionScheduler = new jasmineUnderTest.DelayedFunctionScheduler(),
      mockDate = {
        install: function() {},
        tick: function() {},
        uninstall: function() {}
      },
      clock = new jasmineUnderTest.Clock(
        { setTimeout: function() {} },
        function() {
          return delayedFunctionScheduler;
        },
        mockDate
      );

    clock.install();

    const timeoutId = clock.setTimeout(clearedFn, 100);
    expect(clearedFn).not.toHaveBeenCalled();

    clock.clearTimeout(timeoutId);
    clock.tick(100);

    expect(clearedFn).not.toHaveBeenCalled();
  });

  it("can clear a previously set interval using that interval's handler", function() {
    const spy = jasmine.createSpy('spy'),
      delayedFunctionScheduler = new jasmineUnderTest.DelayedFunctionScheduler(),
      mockDate = {
        install: function() {},
        tick: function() {},
        uninstall: function() {}
      },
      clock = new jasmineUnderTest.Clock(
        { setInterval: function() {} },
        function() {
          return delayedFunctionScheduler;
        },
        mockDate
      );

    clock.install();

    const intervalId = clock.setInterval(function() {
      spy();
      clock.clearInterval(intervalId);
    }, 100);
    clock.tick(200);

    expect(spy.calls.count()).toEqual(1);
  });

  it('correctly schedules functions after the Clock has advanced', function() {
    const delayedFn1 = jasmine.createSpy('delayedFn1'),
      delayedFunctionScheduler = new jasmineUnderTest.DelayedFunctionScheduler(),
      mockDate = {
        install: function() {},
        tick: function() {},
        uninstall: function() {}
      },
      clock = new jasmineUnderTest.Clock(
        { setTimeout: function() {} },
        function() {
          return delayedFunctionScheduler;
        },
        mockDate
      );

    clock.install();

    clock.tick(100);
    clock.setTimeout(delayedFn1, 10, ['some', 'arg']);
    clock.tick(5);
    expect(delayedFn1).not.toHaveBeenCalled();
    clock.tick(5);
    expect(delayedFn1).toHaveBeenCalled();
  });

  it('correctly schedules functions while the Clock is advancing', function() {
    const delayedFn1 = jasmine.createSpy('delayedFn1'),
      delayedFn2 = jasmine.createSpy('delayedFn2'),
      delayedFunctionScheduler = new jasmineUnderTest.DelayedFunctionScheduler(),
      mockDate = {
        install: function() {},
        tick: function() {},
        uninstall: function() {}
      },
      clock = new jasmineUnderTest.Clock(
        { setTimeout: function() {} },
        function() {
          return delayedFunctionScheduler;
        },
        mockDate
      );

    delayedFn1.and.callFake(function() {
      clock.setTimeout(delayedFn2, 0);
    });
    clock.install();
    clock.setTimeout(delayedFn1, 5);

    clock.tick(5);
    expect(delayedFn1).toHaveBeenCalled();
    expect(delayedFn2).not.toHaveBeenCalled();

    clock.tick();
    expect(delayedFn2).toHaveBeenCalled();
  });

  it('correctly calls functions scheduled while the Clock is advancing', function() {
    const delayedFn1 = jasmine.createSpy('delayedFn1'),
      delayedFn2 = jasmine.createSpy('delayedFn2'),
      delayedFunctionScheduler = new jasmineUnderTest.DelayedFunctionScheduler(),
      mockDate = {
        install: function() {},
        tick: function() {},
        uninstall: function() {}
      },
      clock = new jasmineUnderTest.Clock(
        { setTimeout: function() {} },
        function() {
          return delayedFunctionScheduler;
        },
        mockDate
      );

    delayedFn1.and.callFake(function() {
      clock.setTimeout(delayedFn2, 1);
    });
    clock.install();
    clock.setTimeout(delayedFn1, 5);

    clock.tick(6);
    expect(delayedFn1).toHaveBeenCalled();
    expect(delayedFn2).toHaveBeenCalled();
  });

  it('correctly schedules functions scheduled while the Clock is advancing but after the Clock is uninstalled', function() {
    const delayedFn1 = jasmine.createSpy('delayedFn1'),
      delayedFn2 = jasmine.createSpy('delayedFn2'),
      delayedFunctionScheduler = new jasmineUnderTest.DelayedFunctionScheduler(),
      mockDate = {
        install: function() {},
        tick: function() {},
        uninstall: function() {}
      },
      clock = new jasmineUnderTest.Clock(
        { setTimeout: function() {} },
        function() {
          return delayedFunctionScheduler;
        },
        mockDate
      );

    delayedFn1.and.callFake(function() {
      clock.uninstall();
      clock.install();
      clock.setTimeout(delayedFn2, 0);
    });

    clock.install();
    clock.setTimeout(delayedFn1, 1);

    clock.tick(1);
    expect(delayedFn1).toHaveBeenCalled();
    expect(delayedFn2).not.toHaveBeenCalled();

    clock.tick(1);
    expect(delayedFn2).toHaveBeenCalled();
  });

  it('does not mock the Date object by default', function() {
    const delayedFunctionScheduler = new jasmineUnderTest.DelayedFunctionScheduler(),
      global = { Date: Date },
      mockDate = new jasmineUnderTest.MockDate(global),
      clock = new jasmineUnderTest.Clock(
        { setTimeout: setTimeout },
        function() {
          return delayedFunctionScheduler;
        },
        mockDate
      );

    clock.install();

    expect(global.Date).toEqual(Date);

    const now = new global.Date().getTime();

    clock.tick(50);

    expect(new global.Date().getTime() - now).not.toEqual(50);
  });

  it('mocks the Date object and sets it to current time', function() {
    const delayedFunctionScheduler = new jasmineUnderTest.DelayedFunctionScheduler(),
      global = { Date: Date },
      mockDate = new jasmineUnderTest.MockDate(global),
      clock = new jasmineUnderTest.Clock(
        { setTimeout: setTimeout },
        function() {
          return delayedFunctionScheduler;
        },
        mockDate
      );

    clock.install().mockDate();

    const now = new global.Date().getTime();

    clock.tick(50);

    expect(new global.Date().getTime() - now).toEqual(50);

    let timeoutDate = 0;
    clock.setTimeout(function() {
      timeoutDate = new global.Date().getTime();
    }, 100);

    clock.tick(100);

    expect(timeoutDate - now).toEqual(150);
  });

  it('mocks the Date object and sets it to a given time', function() {
    const delayedFunctionScheduler = new jasmineUnderTest.DelayedFunctionScheduler(),
      global = { Date: Date },
      mockDate = new jasmineUnderTest.MockDate(global),
      clock = new jasmineUnderTest.Clock(
        { setTimeout: setTimeout },
        function() {
          return delayedFunctionScheduler;
        },
        mockDate
      ),
      baseTime = new Date(2013, 9, 23);

    clock.install().mockDate(baseTime);

    const now = new global.Date().getTime();

    expect(now).toEqual(baseTime.getTime());

    clock.tick(50);

    expect(new global.Date().getTime()).toEqual(baseTime.getTime() + 50);

    let timeoutDate = 0;
    clock.setTimeout(function() {
      timeoutDate = new global.Date().getTime();
    }, 100);

    clock.tick(100);

    expect(timeoutDate).toEqual(baseTime.getTime() + 150);
  });

  it('throws mockDate is called with a non-Date', function() {
    const delayedFunctionScheduler = new jasmineUnderTest.DelayedFunctionScheduler(),
      global = { Date: Date },
      mockDate = new jasmineUnderTest.MockDate(global),
      clock = new jasmineUnderTest.Clock(
        { setTimeout: setTimeout },
        function() {
          return delayedFunctionScheduler;
        },
        mockDate
      );

    expect(() => clock.mockDate(12345)).toThrowError(
      'The argument to jasmine.clock().mockDate(), if specified, should be ' +
        'a Date instance.'
    );
  });

  it('mocks the Date object and updates the date per delayed function', function() {
    const delayedFunctionScheduler = new jasmineUnderTest.DelayedFunctionScheduler(),
      global = { Date: Date },
      mockDate = new jasmineUnderTest.MockDate(global),
      clock = new jasmineUnderTest.Clock(
        { setTimeout: setTimeout },
        function() {
          return delayedFunctionScheduler;
        },
        mockDate
      ),
      baseTime = new Date();

    clock.install().mockDate(baseTime);

    const actualTimes = [];
    const pushCurrentTime = function() {
      actualTimes.push(global.Date().getTime());
    };
    delayedFunctionScheduler.scheduleFunction(pushCurrentTime);
    delayedFunctionScheduler.scheduleFunction(pushCurrentTime, 1);
    delayedFunctionScheduler.scheduleFunction(pushCurrentTime, 3);

    clock.tick(1);
    expect(global.Date().getTime()).toEqual(baseTime.getTime() + 1);

    clock.tick(3);
    expect(global.Date().getTime()).toEqual(baseTime.getTime() + 4);

    clock.tick(1);
    expect(global.Date().getTime()).toEqual(baseTime.getTime() + 5);

    expect(actualTimes).toEqual([
      baseTime.getTime(),
      baseTime.getTime() + 1,
      baseTime.getTime() + 3
    ]);
  });

  it('correctly clears a scheduled timeout while the Clock is advancing', function() {
    const delayedFunctionScheduler = new jasmineUnderTest.DelayedFunctionScheduler(),
      global = { Date: Date, setTimeout: undefined },
      mockDate = new jasmineUnderTest.MockDate(global),
      clock = new jasmineUnderTest.Clock(
        global,
        function() {
          return delayedFunctionScheduler;
        },
        mockDate
      );

    clock.install();

    let timerId2;

    global.setTimeout(function() {
      global.clearTimeout(timerId2);
    }, 100);

    timerId2 = global.setTimeout(fail, 100);

    clock.tick(100);
  });

  it('correctly clears a scheduled interval while the Clock is advancing', function() {
    const delayedFunctionScheduler = new jasmineUnderTest.DelayedFunctionScheduler(),
      global = { Date: Date, setTimeout: undefined },
      mockDate = new jasmineUnderTest.MockDate(global),
      clock = new jasmineUnderTest.Clock(
        global,
        function() {
          return delayedFunctionScheduler;
        },
        mockDate
      );

    clock.install();

    let timerId2;
    global.setInterval(function() {
      global.clearInterval(timerId2);
    }, 100);

    timerId2 = global.setInterval(fail, 100);

    clock.tick(400);
  });

  describe('Intl.DateTimeFormat integration', function() {
    let clock, fakeGlobal, delayedFunctionScheduler, mockDate, fakeEnv;

    beforeEach(function() {
      fakeGlobal = {
        Date: Date,
        Intl: Intl,
        setTimeout: jasmine.createSpy('setTimeout'),
        clearTimeout: jasmine.createSpy('clearTimeout'),
        setInterval: jasmine.createSpy('setInterval'),
        clearInterval: jasmine.createSpy('clearInterval')
      };
      fakeEnv = {
        configuration: jasmine.createSpy('configuration').and.returnValue({
          mockIntlDateTimeFormat: true
        })
      };
      delayedFunctionScheduler = new jasmineUnderTest.DelayedFunctionScheduler();
      mockDate = new jasmineUnderTest.MockDate(fakeGlobal, fakeEnv);
      clock = new jasmineUnderTest.Clock(
        fakeGlobal,
        function() {
          return delayedFunctionScheduler;
        },
        mockDate
      );
    });




    it('should preserve other Intl.DateTimeFormat methods', function() {
      clock.install();
      clock.mockDate(new Date(2020, 11, 20, 10, 10));

      const formatter = new fakeGlobal.Intl.DateTimeFormat('en-US', {
        timeZone: 'UTC'
      });

      expect(typeof formatter.resolvedOptions).toBe('function');
      expect(formatter.resolvedOptions().locale).toMatch(/en/);
      expect(typeof formatter.formatRange).toBe('function');
      expect(
        formatter.formatRange(
          new Date(2020, 11, 20, 10, 10),
          new Date(2020, 12, 20, 10, 10)
        )
      ).toBe('12/20/2020 – 1/20/2021');
      expect(typeof formatter.formatRangeToParts).toBe('function');
      expect(
        formatter.formatRangeToParts(
          new Date(2020, 11, 20, 10, 10),
          new Date(2020, 12, 20, 10, 10)
        )
      ).toEqual(jasmine.any(Array));
    });


    it('should handle environment without Intl gracefully', function() {
      const fakeGlobalWithoutIntl = {
        Date: Date,
        setTimeout: jasmine.createSpy('setTimeout'),
        clearTimeout: jasmine.createSpy('clearTimeout'),
        setInterval: jasmine.createSpy('setInterval'),
        clearInterval: jasmine.createSpy('clearInterval')
      };

      const mockDateWithoutIntl = new jasmineUnderTest.MockDate(
        fakeGlobalWithoutIntl,
        fakeEnv
      );
      const clockWithoutIntl = new jasmineUnderTest.Clock(
        fakeGlobalWithoutIntl,
        function() {
          return delayedFunctionScheduler;
        },
        mockDateWithoutIntl
      );

      expect(function() {
        clockWithoutIntl.install();
        clockWithoutIntl.uninstall();
      }).not.toThrow();
    });

    describe('when mockIntlDateTimeFormat configuration is disabled', function() {
      beforeEach(function() {
        fakeEnv.configuration = jasmine
          .createSpy('configuration')
          .and.returnValue({
            mockIntlDateTimeFormat: false
          });
        mockDate = new jasmineUnderTest.MockDate(fakeGlobal, fakeEnv);
        clock = new jasmineUnderTest.Clock(
          fakeGlobal,
          function() {
            return delayedFunctionScheduler;
          },
          mockDate
        );
      });

      it('should not mock Intl.DateTimeFormat when configuration is disabled', function() {
        const originalIntl = fakeGlobal.Intl;
        clock.install();
        clock.mockDate(new Date(2020, 11, 20, 10, 10));

        expect(fakeGlobal.Intl).toBe(originalIntl);

        const formatter = new fakeGlobal.Intl.DateTimeFormat('en-US', {
          timeZone: 'UTC'
        });

        // Should use real current date, not mocked date
        expect(formatter.format()).not.toEqual(
          formatter.format(new fakeGlobal.Date())
        );
      });
    });
  });
});
