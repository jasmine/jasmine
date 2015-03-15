describe("DelayedFunctionScheduler", function() {
  it("schedules a function for later execution", function() {
    var scheduler = new j$.DelayedFunctionScheduler(),
      fn = jasmine.createSpy('fn');

    scheduler.scheduleFunction(fn, 0);

    expect(fn).not.toHaveBeenCalled();

    scheduler.tick(0);

    expect(fn).toHaveBeenCalled();
  });

  it("schedules a string for later execution", function() {
    var scheduler = new j$.DelayedFunctionScheduler(),
      strfn = "horrible = true;";

    scheduler.scheduleFunction(strfn, 0);

    scheduler.tick(0);

    expect(horrible).toEqual(true);
  });

  it("#tick defaults to 0", function() {
    var scheduler = new j$.DelayedFunctionScheduler(),
      fn = jasmine.createSpy('fn');

    scheduler.scheduleFunction(fn, 0);

    expect(fn).not.toHaveBeenCalled();

    scheduler.tick();

    expect(fn).toHaveBeenCalled();
  });

  it("defaults delay to 0", function() {
    var scheduler = new j$.DelayedFunctionScheduler(),
      fn = jasmine.createSpy('fn');

    scheduler.scheduleFunction(fn);

    expect(fn).not.toHaveBeenCalled();

    scheduler.tick(0);

    expect(fn).toHaveBeenCalled();
  });

  it("optionally passes params to scheduled functions", function() {
    var scheduler = new j$.DelayedFunctionScheduler(),
      fn = jasmine.createSpy('fn');

    scheduler.scheduleFunction(fn, 0, ['foo', 'bar']);

    expect(fn).not.toHaveBeenCalled();

    scheduler.tick(0);

    expect(fn).toHaveBeenCalledWith('foo', 'bar');
  });

  it("scheduled fns can optionally reoccur", function() {
    var scheduler = new j$.DelayedFunctionScheduler(),
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

  it("increments scheduled fns ids unless one is passed", function() {
    var scheduler = new j$.DelayedFunctionScheduler();

    expect(scheduler.scheduleFunction(function() {
    }, 0)).toBe(1);
    expect(scheduler.scheduleFunction(function() {
    }, 0)).toBe(2);
    expect(scheduler.scheduleFunction(function() {
    }, 0, [], false, 123)).toBe(123);
    expect(scheduler.scheduleFunction(function() {
    }, 0)).toBe(3);
  });

  it("#removeFunctionWithId removes a previously scheduled function with a given id", function() {
    var scheduler = new j$.DelayedFunctionScheduler(),
      fn = jasmine.createSpy('fn'),
      timeoutKey;

    timeoutKey = scheduler.scheduleFunction(fn, 0);

    expect(fn).not.toHaveBeenCalled();

    scheduler.removeFunctionWithId(timeoutKey);

    scheduler.tick(0);

    expect(fn).not.toHaveBeenCalled();
  });

  it("executes recurring functions interleaved with regular functions in the correct order", function() {
    var scheduler = new j$.DelayedFunctionScheduler(),
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

  it("schedules a function for later execution during a tick", function () {
    var scheduler = new j$.DelayedFunctionScheduler(),
      fn = jasmine.createSpy('fn'),
      fnDelay = 10;

    scheduler.scheduleFunction(function () {
      scheduler.scheduleFunction(fn, fnDelay);
    }, 0);

    expect(fn).not.toHaveBeenCalled();

    scheduler.tick(fnDelay);

    expect(fn).toHaveBeenCalled();
  });

  it("#removeFunctionWithId removes a previously scheduled function with a given id during a tick", function () {
    var scheduler = new j$.DelayedFunctionScheduler(),
      fn = jasmine.createSpy('fn'),
      fnDelay = 10,
      timeoutKey;

    scheduler.scheduleFunction(function () {
      scheduler.removeFunctionWithId(timeoutKey);
    }, 0);
    timeoutKey = scheduler.scheduleFunction(fn, fnDelay);

    expect(fn).not.toHaveBeenCalled();

    scheduler.tick(fnDelay);

    expect(fn).not.toHaveBeenCalled();
  });

  it("executes recurring functions interleaved with regular functions and functions scheduled during a tick in the correct order", function () {
    var scheduler = new j$.DelayedFunctionScheduler(),
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
        scheduler.scheduleFunction(innerFn, 10);  // 41ms absolute
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

  it("executes recurring functions after rescheduling them", function () {
    var scheduler = new j$.DelayedFunctionScheduler(),
      recurring = function() {
        expect(scheduler.scheduleFunction).toHaveBeenCalled();
      };

    scheduler.scheduleFunction(recurring, 10, [], true);

    spyOn(scheduler, "scheduleFunction");

    scheduler.tick(10);
  });

  it("removes functions during a tick that runs the function", function() {
    var scheduler = new j$.DelayedFunctionScheduler(),
      fn = jasmine.createSpy('fn'),
      fnDelay = 10,
      timeoutKey;

    timeoutKey = scheduler.scheduleFunction(fn, fnDelay, [], true);
    scheduler.scheduleFunction(function () {
      scheduler.removeFunctionWithId(timeoutKey);
    }, 2 * fnDelay);

    expect(fn).not.toHaveBeenCalled();

    scheduler.tick(3 * fnDelay);

    expect(fn).toHaveBeenCalled();
    expect(fn.calls.count()).toBe(2);
  });

  it("removes functions during the first tick that runs the function", function() {
    var scheduler = new j$.DelayedFunctionScheduler(),
      fn = jasmine.createSpy('fn'),
      fnDelay = 10,
      timeoutKey;

    timeoutKey = scheduler.scheduleFunction(fn, fnDelay, [], true);
    scheduler.scheduleFunction(function () {
      scheduler.removeFunctionWithId(timeoutKey);
    }, fnDelay);

    expect(fn).not.toHaveBeenCalled();

    scheduler.tick(3 * fnDelay);

    expect(fn).toHaveBeenCalled();
    expect(fn.calls.count()).toBe(1);
  });
});

