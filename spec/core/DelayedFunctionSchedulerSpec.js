describe("DelayedFunctionScheduler", function() {
  it("schedules a function for later execution", function() {
    var scheduler = new jasmine.DelayedFunctionScheduler(),
      fn = jasmine.createSpy('fn');

    scheduler.scheduleFunction(fn, 0);

    expect(fn).not.toHaveBeenCalled();

    scheduler.tick(0);

    expect(fn).toHaveBeenCalled();
  });

  it("#tick defaults to 0", function() {
    var scheduler = new jasmine.DelayedFunctionScheduler(),
      fn = jasmine.createSpy('fn');

    scheduler.scheduleFunction(fn, 0);

    expect(fn).not.toHaveBeenCalled();

    scheduler.tick();

    expect(fn).toHaveBeenCalled();
  });

  it("defaults delay to 0", function() {
    var scheduler = new jasmine.DelayedFunctionScheduler(),
      fn = jasmine.createSpy('fn');

    scheduler.scheduleFunction(fn);

    expect(fn).not.toHaveBeenCalled();

    scheduler.tick(0);

    expect(fn).toHaveBeenCalled();
  });

  it("optionally passes params to scheduled functions", function() {
    var scheduler = new jasmine.DelayedFunctionScheduler(),
      fn = jasmine.createSpy('fn');

    scheduler.scheduleFunction(fn, 0, ['foo', 'bar']);

    expect(fn).not.toHaveBeenCalled();

    scheduler.tick(0);

    expect(fn).toHaveBeenCalledWith('foo', 'bar');
  });

  it("scheduled fns can optionally reoccur", function() {
    var scheduler = new jasmine.DelayedFunctionScheduler(),
      fn = jasmine.createSpy('fn');

    scheduler.scheduleFunction(fn, 20, [], true);

    expect(fn).not.toHaveBeenCalled();

    scheduler.tick(20);

    expect(fn.callCount).toBe(1);

    scheduler.tick(40);

    expect(fn.callCount).toBe(3);

    scheduler.tick(21);

    expect(fn.callCount).toBe(4);

  });

  it("increments scheduled fns ids unless one is passed", function() {
    var scheduler = new jasmine.DelayedFunctionScheduler();

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
    var scheduler = new jasmine.DelayedFunctionScheduler(),
      fn = jasmine.createSpy('fn'),
      timeoutKey;

    timeoutKey = scheduler.scheduleFunction(fn, 0);

    expect(fn).not.toHaveBeenCalled();

    scheduler.removeFunctionWithId(timeoutKey);

    scheduler.tick(0);

    expect(fn).not.toHaveBeenCalled();
  });

  it("reset removes scheduled functions", function() {
    var scheduler = new jasmine.DelayedFunctionScheduler(),
      fn = jasmine.createSpy('fn');

    scheduler.scheduleFunction(fn, 0);

    expect(fn).not.toHaveBeenCalled();

    scheduler.reset();

    scheduler.tick(0);

    expect(fn).not.toHaveBeenCalled();
  });

  it("reset resets the returned ids", function() {
    var scheduler = new jasmine.DelayedFunctionScheduler();
    expect(scheduler.scheduleFunction(function() { }, 0)).toBe(1);
    expect(scheduler.scheduleFunction(function() { }, 0, [], false, 123)).toBe(123);

    scheduler.reset();
    expect(scheduler.scheduleFunction(function() { }, 0)).toBe(1);
    expect(scheduler.scheduleFunction(function() { }, 0, [], false, 123)).toBe(123);
  });

  it("reset resets the current tick time", function() {
    var scheduler = new jasmine.DelayedFunctionScheduler(),
      fn = jasmine.createSpy('fn');

    expect(fn).not.toHaveBeenCalled();

    scheduler.tick(15);
    scheduler.reset();

    scheduler.scheduleFunction(fn, 20, [], false, 1, 20);

    scheduler.tick(5);

    expect(fn).not.toHaveBeenCalled();
  });

  it("executes recurring functions interleaved with regular functions in the correct order", function() {
    var scheduler = new jasmine.DelayedFunctionScheduler(),
      fn = jasmine.createSpy('fn'),
      recurringCallCount = 0,
      recurring = jasmine.createSpy('recurring').andCallFake(function() {
        recurringCallCount++;
        if (recurringCallCount < 5) {
          expect(fn).not.toHaveBeenCalled();
        }
      });

    scheduler.scheduleFunction(recurring, 10, [], true);
    scheduler.scheduleFunction(fn, 50);

    scheduler.tick(60);

    expect(recurring).toHaveBeenCalled();
    expect(recurring.callCount).toBe(6);
    expect(fn).toHaveBeenCalled();
  });

});

