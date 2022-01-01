describe('DelayedFunctionScheduler', function() {
  it('schedules a function for later execution', function() {
    var scheduler = new jasmineUnderTest.DelayedFunctionScheduler(),
      fn = jasmine.createSpy('fn');

    scheduler.scheduleFunction(fn, 0);

    expect(fn).not.toHaveBeenCalled();

    scheduler.tick(0);

    expect(fn).toHaveBeenCalled();
  });

  it('schedules a string for later execution', function() {
    var scheduler = new jasmineUnderTest.DelayedFunctionScheduler(),
      strfn = 'horrible = true;';

    scheduler.scheduleFunction(strfn, 0);

    scheduler.tick(0);

    expect(horrible).toEqual(true);
  });

  it('#tick defaults to 0', function() {
    var scheduler = new jasmineUnderTest.DelayedFunctionScheduler(),
      fn = jasmine.createSpy('fn');

    scheduler.scheduleFunction(fn, 0);

    expect(fn).not.toHaveBeenCalled();

    scheduler.tick();

    expect(fn).toHaveBeenCalled();
  });

  it('defaults delay to 0', function() {
    var scheduler = new jasmineUnderTest.DelayedFunctionScheduler(),
      fn = jasmine.createSpy('fn');

    scheduler.scheduleFunction(fn);

    expect(fn).not.toHaveBeenCalled();

    scheduler.tick(0);

    expect(fn).toHaveBeenCalled();
  });

  it('optionally passes params to scheduled functions', function() {
    var scheduler = new jasmineUnderTest.DelayedFunctionScheduler(),
      fn = jasmine.createSpy('fn');

    scheduler.scheduleFunction(fn, 0, ['foo', 'bar']);

    expect(fn).not.toHaveBeenCalled();

    scheduler.tick(0);

    expect(fn).toHaveBeenCalledWith('foo', 'bar');
  });

  it('scheduled fns can optionally reoccur', function() {
    var scheduler = new jasmineUnderTest.DelayedFunctionScheduler(),
      fn = jasmine.createSpy('fn');

    scheduler.scheduleFunction(fn, 20, [], true);

    expect(fn).not.toHaveBeenCalled();

    scheduler.tick(20);

    expect(fn.calls.count()).toBe(1);

    scheduler.tick(40);

    expect(fn.calls.count()).toBe(3);

    scheduler.tick(21);

    expect(fn.calls.count()).toBe(4);
  });

  it('increments scheduled fns ids unless one is passed', function() {
    var scheduler = new jasmineUnderTest.DelayedFunctionScheduler();

    expect(scheduler.scheduleFunction(function() {}, 0)).toBe(1);
    expect(scheduler.scheduleFunction(function() {}, 0)).toBe(2);
    expect(scheduler.scheduleFunction(function() {}, 0, [], false, 123)).toBe(
      123
    );
    expect(scheduler.scheduleFunction(function() {}, 0)).toBe(3);
  });

  it('#removeFunctionWithId removes a previously scheduled function with a given id', function() {
    var scheduler = new jasmineUnderTest.DelayedFunctionScheduler(),
      fn = jasmine.createSpy('fn'),
      timeoutKey;

    timeoutKey = scheduler.scheduleFunction(fn, 0);

    expect(fn).not.toHaveBeenCalled();

    scheduler.removeFunctionWithId(timeoutKey);

    scheduler.tick(0);

    expect(fn).not.toHaveBeenCalled();
  });

  it('executes recurring functions interleaved with regular functions in the correct order', function() {
    var scheduler = new jasmineUnderTest.DelayedFunctionScheduler(),
      fn = jasmine.createSpy('fn'),
      recurringCallCount = 0,
      recurring = jasmine.createSpy('recurring').and.callFake(function() {
        recurringCallCount++;
        if (recurringCallCount < 5) {
          expect(fn).not.toHaveBeenCalled();
        }
      });

    scheduler.scheduleFunction(recurring, 10, [], true);
    scheduler.scheduleFunction(fn, 50);

    scheduler.tick(60);

    expect(recurring).toHaveBeenCalled();
    expect(recurring.calls.count()).toBe(6);
    expect(fn).toHaveBeenCalled();
  });

  it('schedules a function for later execution during a tick', function() {
    var scheduler = new jasmineUnderTest.DelayedFunctionScheduler(),
      fn = jasmine.createSpy('fn'),
      fnDelay = 10;

    scheduler.scheduleFunction(function() {
      scheduler.scheduleFunction(fn, fnDelay);
    }, 0);

    expect(fn).not.toHaveBeenCalled();

    scheduler.tick(fnDelay);

    expect(fn).toHaveBeenCalled();
  });

  it('#removeFunctionWithId removes a previously scheduled function with a given id during a tick', function() {
    var scheduler = new jasmineUnderTest.DelayedFunctionScheduler(),
      fn = jasmine.createSpy('fn'),
      fnDelay = 10,
      timeoutKey;

    scheduler.scheduleFunction(function() {
      scheduler.removeFunctionWithId(timeoutKey);
    }, 0);
    timeoutKey = scheduler.scheduleFunction(fn, fnDelay);

    expect(fn).not.toHaveBeenCalled();

    scheduler.tick(fnDelay);

    expect(fn).not.toHaveBeenCalled();
  });

  it('executes recurring functions interleaved with regular functions and functions scheduled during a tick in the correct order', function() {
    var scheduler = new jasmineUnderTest.DelayedFunctionScheduler(),
      fn = jasmine.createSpy('fn'),
      recurringCallCount = 0,
      recurring = jasmine.createSpy('recurring').and.callFake(function() {
        recurringCallCount++;
        if (recurringCallCount < 5) {
          expect(fn).not.toHaveBeenCalled();
        }
      }),
      innerFn = jasmine.createSpy('innerFn').and.callFake(function() {
        expect(recurring.calls.count()).toBe(4);
        expect(fn).not.toHaveBeenCalled();
      }),
      scheduling = jasmine.createSpy('scheduling').and.callFake(function() {
        expect(recurring.calls.count()).toBe(3);
        expect(fn).not.toHaveBeenCalled();
        scheduler.scheduleFunction(innerFn, 10); // 41ms absolute
      });

    scheduler.scheduleFunction(recurring, 10, [], true);
    scheduler.scheduleFunction(fn, 50);
    scheduler.scheduleFunction(scheduling, 31);

    scheduler.tick(60);

    expect(recurring).toHaveBeenCalled();
    expect(recurring.calls.count()).toBe(6);
    expect(fn).toHaveBeenCalled();
    expect(scheduling).toHaveBeenCalled();
    expect(innerFn).toHaveBeenCalled();
  });

  it('executes recurring functions after rescheduling them', function() {
    var scheduler = new jasmineUnderTest.DelayedFunctionScheduler(),
      recurring = function() {
        expect(scheduler.scheduleFunction).toHaveBeenCalled();
      };

    scheduler.scheduleFunction(recurring, 10, [], true);

    spyOn(scheduler, 'scheduleFunction');

    scheduler.tick(10);
  });

  it('removes functions during a tick that runs the function', function() {
    var scheduler = new jasmineUnderTest.DelayedFunctionScheduler(),
      spy = jasmine.createSpy('fn'),
      spyAndRemove = jasmine.createSpy('fn'),
      fnDelay = 10,
      timeoutKey;

    spyAndRemove.and.callFake(function() {
      scheduler.removeFunctionWithId(timeoutKey);
    });

    scheduler.scheduleFunction(spyAndRemove, fnDelay);

    timeoutKey = scheduler.scheduleFunction(spy, fnDelay, [], true);

    scheduler.tick(2 * fnDelay);

    expect(spy).not.toHaveBeenCalled();
    expect(spyAndRemove).toHaveBeenCalled();
  });

  it('removes functions during the first tick that runs the function', function() {
    var scheduler = new jasmineUnderTest.DelayedFunctionScheduler(),
      fn = jasmine.createSpy('fn'),
      fnDelay = 10,
      timeoutKey;

    timeoutKey = scheduler.scheduleFunction(fn, fnDelay, [], true);
    scheduler.scheduleFunction(function() {
      scheduler.removeFunctionWithId(timeoutKey);
    }, fnDelay);

    expect(fn).not.toHaveBeenCalled();

    scheduler.tick(3 * fnDelay);

    expect(fn).toHaveBeenCalled();
    expect(fn.calls.count()).toBe(1);
  });

  it("does not remove a function that hasn't been added yet", function() {
    var scheduler = new jasmineUnderTest.DelayedFunctionScheduler(),
      fn = jasmine.createSpy('fn'),
      fnDelay = 10;

    scheduler.removeFunctionWithId('foo');
    scheduler.scheduleFunction(fn, fnDelay, [], false, 'foo');

    expect(fn).not.toHaveBeenCalled();

    scheduler.tick(fnDelay + 1);

    expect(fn).toHaveBeenCalled();
  });

  it('updates the mockDate per scheduled time', function() {
    var scheduler = new jasmineUnderTest.DelayedFunctionScheduler(),
      tickDate = jasmine.createSpy('tickDate');

    scheduler.scheduleFunction(function() {});
    scheduler.scheduleFunction(function() {}, 1);

    scheduler.tick(1, tickDate);

    expect(tickDate).toHaveBeenCalledWith(0);
    expect(tickDate).toHaveBeenCalledWith(1);
  });

  describe('ticking inside a scheduled function', function() {
    let clock;

    // Runner function calls the callback until it returns false
    function runWork(workCallback) {
      while (workCallback()) {}
    }

    // Make a worker that takes a little time and tracks when it finished
    function mockWork(times) {
      return () => {
        clock.tick(1);
        const now = new Date().getTime();
        expect(lastWork)
          .withContext('Previous function calls should always be in the past')
          .toBeLessThan(now);
        lastWork = now;
        times--;
        return times > 0;
      };
    }
    let lastWork = 0;

    beforeEach(() => {
      clock = jasmineUnderTest.getEnv().clock;
      clock.install();
      clock.mockDate(new Date(1));
    });

    afterEach(function() {
      jasmineUnderTest.getEnv().clock.uninstall();
    });

    it('preserves monotonically-increasing current time', () => {
      const work1 = mockWork(3);
      setTimeout(() => {
        runWork(work1);
      }, 1);
      clock.tick(1);
      expect(lastWork)
        .withContext('tick should advance past last-scheduled function')
        .toBeLessThanOrEqual(new Date().getTime());

      const work2 = mockWork(3);
      setTimeout(() => {
        runWork(work2);
      }, 1);
      clock.tick(1);
      expect(lastWork)
        .withContext('tick should advance past last-scheduled function')
        .toBeLessThanOrEqual(new Date().getTime());
    });
  });
});
