describe("Clock", function() {

// TODO: fullName/SpecFilter is broken, so don't nest describes you want to filter

  it("calls the global setTimeout directly if Clock is not installed", function() {
    var setTimeout = jasmine.createSpy('setTimeout'),
      delayedFunctionScheduler = jasmine.createSpyObj('delayedFunctionScheduler', ['scheduleFunction']),
      global = { setTimeout: setTimeout },
      delayedFn = jasmine.createSpy('delayedFn'),
      clock = new jasmine.Clock(global, delayedFunctionScheduler);

    clock.setTimeout(delayedFn, 0);

    expect(delayedFunctionScheduler.scheduleFunction).not.toHaveBeenCalled();
    expect(setTimeout).toHaveBeenCalledWith(delayedFn, 0);
  });

  it("schedules the delayed function with the fake timer", function() {
    var setTimeout = jasmine.createSpy('setTimeout'),
      scheduleFunction = jasmine.createSpy('scheduleFunction'),
      delayedFunctionScheduler = {scheduleFunction: scheduleFunction},
      global = { setTimeout: setTimeout },
      delayedFn = jasmine.createSpy('delayedFn'),
      clock = new jasmine.Clock(global, delayedFunctionScheduler);

    clock.install();
    clock.setTimeout(delayedFn, 0, 'a', 'b');

    expect(setTimeout).not.toHaveBeenCalled();
    expect(delayedFunctionScheduler.scheduleFunction).toHaveBeenCalledWith(delayedFn, 0, ['a', 'b']);
  });

  it("returns an id for the delayed function", function() {
    var setTimeout = jasmine.createSpy('setTimeout'),
      scheduleId = 123,
      scheduleFunction = jasmine.createSpy('scheduleFunction').andReturn(scheduleId),
      delayedFunctionScheduler = {scheduleFunction: scheduleFunction},
      global = { setTimeout: setTimeout },
      delayedFn = jasmine.createSpy('delayedFn'),
      clock = new jasmine.Clock(global, delayedFunctionScheduler),
      timeoutId;

    clock.install();
    timeoutId = clock.setTimeout(delayedFn, 0);

    expect(timeoutId).toEqual(123);
  });

  it("calls the global clearTimeout directly if Clock is not installed", function() {
    var clearTimeout = jasmine.createSpy('clearTimeout'),
      delayedFunctionScheduler = jasmine.createSpyObj('delayedFunctionScheduler', ['clearTimeout']),
      global = { clearTimeout: clearTimeout },
      clock = new jasmine.Clock(global, delayedFunctionScheduler);

    clock.clearTimeout(123);

    expect(clearTimeout).toHaveBeenCalledWith(123);
  });

  it("clears the scheduled function with the scheduler", function() {
    var clearTimeout = jasmine.createSpy('clearTimeout'),
      delayedFunctionScheduler = jasmine.createSpyObj('delayedFunctionScheduler', ['removeFunctionWithId']),
      global = { setTimeout: clearTimeout },
      delayedFn = jasmine.createSpy('delayedFn'),
      clock = new jasmine.Clock(global, delayedFunctionScheduler);

    clock.install();
    clock.clearTimeout(123);

    expect(clearTimeout).not.toHaveBeenCalled();
    expect(delayedFunctionScheduler.removeFunctionWithId).toHaveBeenCalledWith(123);
  });

  it("calls the global setInterval directly if Clock is not installed", function() {
    var setInterval = jasmine.createSpy('setInterval'),
      delayedFunctionScheduler = jasmine.createSpyObj('delayedFunctionScheduler', ['scheduleFunction']),
      global = { setInterval: setInterval },
      delayedFn = jasmine.createSpy('delayedFn'),
      clock = new jasmine.Clock(global, delayedFunctionScheduler);

    clock.setInterval(delayedFn, 0);

    expect(delayedFunctionScheduler.scheduleFunction).not.toHaveBeenCalled();
    expect(setInterval).toHaveBeenCalledWith(delayedFn, 0);
  });

  it("schedules the delayed function with the fake timer", function() {
    var setInterval = jasmine.createSpy('setInterval'),
      scheduleFunction = jasmine.createSpy('scheduleFunction'),
      delayedFunctionScheduler = {scheduleFunction: scheduleFunction},
      global = { setInterval: setInterval },
      delayedFn = jasmine.createSpy('delayedFn'),
      clock = new jasmine.Clock(global, delayedFunctionScheduler);

    clock.install();
    clock.setInterval(delayedFn, 0, 'a', 'b');

    expect(setInterval).not.toHaveBeenCalled();
    expect(delayedFunctionScheduler.scheduleFunction).toHaveBeenCalledWith(delayedFn, 0, ['a', 'b'], true);
  });

  it("returns an id for the delayed function", function() {
    var setInterval = jasmine.createSpy('setInterval'),
      scheduleId = 123,
      scheduleFunction = jasmine.createSpy('scheduleFunction').andReturn(scheduleId),
      delayedFunctionScheduler = {scheduleFunction: scheduleFunction},
      global = { setInterval: setInterval },
      delayedFn = jasmine.createSpy('delayedFn'),
      clock = new jasmine.Clock(global, delayedFunctionScheduler),
      intervalId;

    clock.install();
    intervalId = clock.setInterval(delayedFn, 0);

    expect(intervalId).toEqual(123);
  });

  it("calls the global clearInterval directly if Clock is not installed", function() {
    var clearInterval = jasmine.createSpy('clearInterval'),
      delayedFunctionScheduler = jasmine.createSpyObj('delayedFunctionScheduler', ['clearInterval']),
      global = { clearInterval: clearInterval },
      clock = new jasmine.Clock(global, delayedFunctionScheduler);

    clock.clearInterval(123);

    expect(clearInterval).toHaveBeenCalledWith(123);
  });

  it("clears the scheduled function with the scheduler", function() {
    var clearInterval = jasmine.createSpy('clearInterval'),
      delayedFunctionScheduler = jasmine.createSpyObj('delayedFunctionScheduler', ['removeFunctionWithId']),
      global = { setInterval: clearInterval },
      delayedFn = jasmine.createSpy('delayedFn'),
      clock = new jasmine.Clock(global, delayedFunctionScheduler);

    clock.install();
    clock.clearInterval(123);

    expect(clearInterval).not.toHaveBeenCalled();
    expect(delayedFunctionScheduler.removeFunctionWithId).toHaveBeenCalledWith(123);
  });

  it("gives you a friendly reminder if the Clock is not installed and you tick", function() {
    var clock = new jasmine.Clock({}, jasmine.createSpyObj('delayedFunctionScheduler', ['tick']));
    expect(function() {
      clock.tick(50);
    }).toThrow();
  });

  it("can be uninstalled", function() {
    var setTimeout = jasmine.createSpy('setTimeout'),
      setInterval = jasmine.createSpy('setInterval'),
      delayedFunctionScheduler = jasmine.createSpyObj('delayedFunctionScheduler', ['scheduleFunction', 'tick', 'reset']),
      global = { setTimeout: setTimeout, setInterval: setInterval },
      delayedFn = jasmine.createSpy('delayedFn'),
      clock = new jasmine.Clock(global, delayedFunctionScheduler);

    clock.install();
    clock.setTimeout(delayedFn, 0);
    expect(setTimeout).not.toHaveBeenCalled();

    clock.setInterval(delayedFn, 0);
    expect(setInterval).not.toHaveBeenCalled();

    expect(function() {
      clock.tick(0);
    }).not.toThrow();

    clock.uninstall();

    expect(delayedFunctionScheduler.reset).toHaveBeenCalled();

    clock.setTimeout(delayedFn, 0);

    expect(setTimeout).toHaveBeenCalled();

    clock.setInterval(delayedFn, 0);
    expect(setInterval).toHaveBeenCalled();

    expect(function() {
      clock.tick(0);
    }).toThrow();
  });


  it("on IE < 9, fails if extra args are passed to fake clock", function() {
    //fail, because this would break in IE9.
    var setTimeout = jasmine.createSpy('setTimeout'),
    setInterval = jasmine.createSpy('setInterval'),
    delayedFunctionScheduler = jasmine.createSpyObj('delayedFunctionScheduler', ['scheduleFunction']),
    fn = jasmine.createSpy('fn'),
    global = { setTimeout: setTimeout, setInterval: setInterval },
    clock = new jasmine.Clock(global, delayedFunctionScheduler);

    setTimeout.apply = null;
    setInterval.apply = null;

    clock.install();

    clock.setTimeout(fn, 0);
    expect(delayedFunctionScheduler.scheduleFunction).toHaveBeenCalledWith(fn, 0, []);
    expect(function() {
      clock.setTimeout(fn, 0, 'extra');
    }).toThrow();

    clock.setInterval(fn, 0);
    expect(delayedFunctionScheduler.scheduleFunction).toHaveBeenCalledWith(fn, 0, [], true);
    expect(function() {
      clock.setInterval(fn, 0, 'extra');
    }).toThrow();
  });

});

describe("Clock (acceptance)", function() {
  it("can run setTimeouts/setIntervals synchronously", function() {
    var delayedFn1 = jasmine.createSpy('delayedFn1'),
      delayedFn2 = jasmine.createSpy('delayedFn2'),
      delayedFn3 = jasmine.createSpy('delayedFn3'),
      recurring1 = jasmine.createSpy('recurring1'),
      delayedFunctionScheduler = new jasmine.DelayedFunctionScheduler(),
      clock = new jasmine.Clock({setTimeout: setTimeout}, delayedFunctionScheduler);

    clock.install();

    clock.setTimeout(delayedFn1, 0, 'some', 'arg');
    var intervalId = clock.setInterval(recurring1, 50, 'some', 'other', 'args');
    clock.setTimeout(delayedFn2, 100);
    clock.setTimeout(delayedFn3, 200);

    expect(delayedFn1).not.toHaveBeenCalled();
    expect(delayedFn2).not.toHaveBeenCalled();
    expect(delayedFn3).not.toHaveBeenCalled();

    clock.tick(0);

    expect(delayedFn1).toHaveBeenCalledWith('some', 'arg');
    expect(delayedFn2).not.toHaveBeenCalled();
    expect(delayedFn3).not.toHaveBeenCalled();

    clock.tick(50);

    expect(recurring1).toHaveBeenCalledWith('some', 'other', 'args');
    expect(recurring1.callCount).toBe(1);
    expect(delayedFn2).not.toHaveBeenCalled();
    expect(delayedFn3).not.toHaveBeenCalled();

    clock.tick(50);

    expect(recurring1.callCount).toBe(2);
    expect(delayedFn2).toHaveBeenCalled();
    expect(delayedFn3).not.toHaveBeenCalled();

    clock.tick(100);

    expect(recurring1.callCount).toBe(4);
    expect(delayedFn3).toHaveBeenCalled();

    clock.clearInterval(intervalId);
    clock.tick(50);

    expect(recurring1.callCount).toBe(4);
  });

  it("can clear a previously set timeout", function() {
    var clearedFn = jasmine.createSpy('clearedFn'),
      delayedFunctionScheduler = new jasmine.DelayedFunctionScheduler(),
      clock = new jasmine.Clock({setTimeout: function() {}}, delayedFunctionScheduler),
      timeoutId;

    clock.install();

    timeoutId = clock.setTimeout(clearedFn, 100);
    expect(clearedFn).not.toHaveBeenCalled();

    clock.clearTimeout(timeoutId);
    clock.tick(100);

    expect(clearedFn).not.toHaveBeenCalled();
  });

  it("correctly schedules functions after the Clock has advanced", function() {
    var delayedFn1 = jasmine.createSpy('delayedFn1'),
      delayedFunctionScheduler = new jasmine.DelayedFunctionScheduler(),
      clock = new jasmine.Clock({setTimeout: function(){}}, delayedFunctionScheduler);

    clock.install();

    clock.tick(100);
    clock.setTimeout(delayedFn1, 10, ['some', 'arg']);
    clock.tick(5);
    expect(delayedFn1).not.toHaveBeenCalled();
    clock.tick(5);
    expect(delayedFn1).toHaveBeenCalled();
  });
});
