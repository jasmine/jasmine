describe("Clock", function() {

  it("does not replace setTimeout until it is installed", function() {
    var fakeSetTimeout = jasmine.createSpy("global setTimeout"),
      fakeGlobal = { setTimeout: fakeSetTimeout },
      delayedFunctionScheduler = jasmine.createSpyObj("delayedFunctionScheduler", ["scheduleFunction"]),
      delayedFn = jasmine.createSpy("delayedFn"),
      clock = new j$.Clock(fakeGlobal, delayedFunctionScheduler);

    fakeGlobal.setTimeout(delayedFn, 0);

    expect(fakeSetTimeout).toHaveBeenCalledWith(delayedFn, 0);
    expect(delayedFunctionScheduler.scheduleFunction).not.toHaveBeenCalled();

    fakeSetTimeout.calls.reset();

    clock.install();
    fakeGlobal.setTimeout(delayedFn, 0);

    expect(delayedFunctionScheduler.scheduleFunction).toHaveBeenCalled();
    expect(fakeSetTimeout).not.toHaveBeenCalled();
  });

  it("does not replace clearTimeout until it is installed", function() {
    var fakeClearTimeout = jasmine.createSpy("global cleartimeout"),
      fakeGlobal = { clearTimeout: fakeClearTimeout },
      delayedFunctionScheduler = jasmine.createSpyObj("delayedFunctionScheduler", ["removeFunctionWithId"]),
      delayedFn = jasmine.createSpy("delayedFn"),
      clock = new j$.Clock(fakeGlobal, delayedFunctionScheduler);

    fakeGlobal.clearTimeout("foo");

    expect(fakeClearTimeout).toHaveBeenCalledWith("foo");
    expect(delayedFunctionScheduler.removeFunctionWithId).not.toHaveBeenCalled();

    fakeClearTimeout.calls.reset();

    clock.install();
    fakeGlobal.clearTimeout("foo");

    expect(delayedFunctionScheduler.removeFunctionWithId).toHaveBeenCalled();
    expect(fakeClearTimeout).not.toHaveBeenCalled();
  });

  it("does not replace setInterval until it is installed", function() {
    var fakeSetInterval = jasmine.createSpy("global setInterval"),
      fakeGlobal = { setInterval: fakeSetInterval },
      delayedFunctionScheduler = jasmine.createSpyObj("delayedFunctionScheduler", ["scheduleFunction"]),
      delayedFn = jasmine.createSpy("delayedFn"),
      clock = new j$.Clock(fakeGlobal, delayedFunctionScheduler);

    fakeGlobal.setInterval(delayedFn, 0);

    expect(fakeSetInterval).toHaveBeenCalledWith(delayedFn, 0);
    expect(delayedFunctionScheduler.scheduleFunction).not.toHaveBeenCalled();

    fakeSetInterval.calls.reset();

    clock.install();
    fakeGlobal.setInterval(delayedFn, 0);

    expect(delayedFunctionScheduler.scheduleFunction).toHaveBeenCalled();
    expect(fakeSetInterval).not.toHaveBeenCalled();
  });

  it("does not replace clearInterval until it is installed", function() {
    var fakeClearInterval = jasmine.createSpy("global clearinterval"),
      fakeGlobal = { clearInterval: fakeClearInterval },
      delayedFunctionScheduler = jasmine.createSpyObj("delayedFunctionScheduler", ["removeFunctionWithId"]),
      delayedFn = jasmine.createSpy("delayedFn"),
      clock = new j$.Clock(fakeGlobal, delayedFunctionScheduler);

    fakeGlobal.clearInterval("foo");

    expect(fakeClearInterval).toHaveBeenCalledWith("foo");
    expect(delayedFunctionScheduler.removeFunctionWithId).not.toHaveBeenCalled();

    fakeClearInterval.calls.reset();

    clock.install();
    fakeGlobal.clearInterval("foo");

    expect(delayedFunctionScheduler.removeFunctionWithId).toHaveBeenCalled();
    expect(fakeClearInterval).not.toHaveBeenCalled();
  });

  it("replaces the global timer functions on uninstall", function() {
    var fakeSetTimeout = jasmine.createSpy("global setTimeout"),
      fakeClearTimeout = jasmine.createSpy("global clearTimeout"),
      fakeSetInterval = jasmine.createSpy("global setInterval"),
      fakeClearInterval = jasmine.createSpy("global clearInterval"),
      fakeGlobal = {
        setTimeout: fakeSetTimeout,
        clearTimeout: fakeClearTimeout,
        setInterval: fakeSetInterval,
        clearInterval: fakeClearInterval
      },
      delayedFunctionScheduler = jasmine.createSpyObj("delayedFunctionScheduler", ["scheduleFunction", "reset"]),
      delayedFn = jasmine.createSpy("delayedFn"),
      clock = new j$.Clock(fakeGlobal, delayedFunctionScheduler);

    clock.install();
    clock.uninstall();
    fakeGlobal.setTimeout(delayedFn, 0);
    fakeGlobal.clearTimeout("foo");
    fakeGlobal.setInterval(delayedFn, 10);
    fakeGlobal.clearInterval("bar");

    expect(fakeSetTimeout).toHaveBeenCalledWith(delayedFn, 0);
    expect(fakeClearTimeout).toHaveBeenCalledWith("foo");
    expect(fakeSetInterval).toHaveBeenCalledWith(delayedFn, 10);
    expect(fakeClearInterval).toHaveBeenCalledWith("bar");
    expect(delayedFunctionScheduler.scheduleFunction).not.toHaveBeenCalled();
  });

  it("schedules the delayed function (via setTimeout) with the fake timer", function() {
    var fakeSetTimeout = jasmine.createSpy('setTimeout'),
      scheduleFunction = jasmine.createSpy('scheduleFunction'),
      delayedFunctionScheduler = { scheduleFunction: scheduleFunction },
      fakeGlobal = { setTimeout: fakeSetTimeout },
      delayedFn = jasmine.createSpy('delayedFn'),
      clock = new j$.Clock(fakeGlobal, delayedFunctionScheduler);

    clock.install();
    clock.setTimeout(delayedFn, 0, 'a', 'b');

    expect(fakeSetTimeout).not.toHaveBeenCalled();
    expect(delayedFunctionScheduler.scheduleFunction).toHaveBeenCalledWith(delayedFn, 0, ['a', 'b']);
  });

  it("returns an id for the delayed function", function() {
    var fakeSetTimeout = jasmine.createSpy('setTimeout'),
      scheduleId = 123,
      scheduleFunction = jasmine.createSpy('scheduleFunction').and.returnValue(scheduleId),
      delayedFunctionScheduler = {scheduleFunction: scheduleFunction},
      fakeGlobal = { setTimeout: fakeSetTimeout },
      delayedFn = jasmine.createSpy('delayedFn'),
      clock = new j$.Clock(fakeGlobal, delayedFunctionScheduler),
      timeoutId;

    clock.install();
    timeoutId = clock.setTimeout(delayedFn, 0);

    expect(timeoutId).toEqual(123);
  });

  it("clears the scheduled function with the scheduler", function() {
    var fakeClearTimeout = jasmine.createSpy('clearTimeout'),
      delayedFunctionScheduler = jasmine.createSpyObj('delayedFunctionScheduler', ['removeFunctionWithId']),
      fakeGlobal = { setTimeout: fakeClearTimeout },
      delayedFn = jasmine.createSpy('delayedFn'),
      clock = new j$.Clock(fakeGlobal, delayedFunctionScheduler);

    clock.install();
    clock.clearTimeout(123);

    expect(fakeClearTimeout).not.toHaveBeenCalled();
    expect(delayedFunctionScheduler.removeFunctionWithId).toHaveBeenCalledWith(123);
  });

  it("schedules the delayed function with the fake timer", function() {
    var fakeSetInterval = jasmine.createSpy('setInterval'),
      scheduleFunction = jasmine.createSpy('scheduleFunction'),
      delayedFunctionScheduler = {scheduleFunction: scheduleFunction},
      fakeGlobal = { setInterval: fakeSetInterval },
      delayedFn = jasmine.createSpy('delayedFn'),
      clock = new j$.Clock(fakeGlobal, delayedFunctionScheduler);

    clock.install();
    clock.setInterval(delayedFn, 0, 'a', 'b');

    expect(fakeSetInterval).not.toHaveBeenCalled();
    expect(delayedFunctionScheduler.scheduleFunction).toHaveBeenCalledWith(delayedFn, 0, ['a', 'b'], true);
  });

  it("returns an id for the delayed function", function() {
    var fakeSetInterval = jasmine.createSpy('setInterval'),
      scheduleId = 123,
      scheduleFunction = jasmine.createSpy('scheduleFunction').and.returnValue(scheduleId),
      delayedFunctionScheduler = {scheduleFunction: scheduleFunction},
      fakeGlobal = { setInterval: fakeSetInterval },
      delayedFn = jasmine.createSpy('delayedFn'),
      clock = new j$.Clock(fakeGlobal, delayedFunctionScheduler),
      intervalId;

    clock.install();
    intervalId = clock.setInterval(delayedFn, 0);

    expect(intervalId).toEqual(123);
  });

  it("clears the scheduled function with the scheduler", function() {
    var clearInterval = jasmine.createSpy('clearInterval'),
      delayedFunctionScheduler = jasmine.createSpyObj('delayedFunctionScheduler', ['removeFunctionWithId']),
      fakeGlobal = { setInterval: clearInterval },
      delayedFn = jasmine.createSpy('delayedFn'),
      clock = new j$.Clock(fakeGlobal, delayedFunctionScheduler);

    clock.install();
    clock.clearInterval(123);

    expect(clearInterval).not.toHaveBeenCalled();
    expect(delayedFunctionScheduler.removeFunctionWithId).toHaveBeenCalledWith(123);
  });

  it("gives you a friendly reminder if the Clock is not installed and you tick", function() {
    var clock = new j$.Clock({}, jasmine.createSpyObj('delayedFunctionScheduler', ['tick']));
    expect(function() {
      clock.tick(50);
    }).toThrow();
  });

  it("on IE < 9, fails if extra args are passed to fake clock", function() {
    //fail, because this would break in IE9.
    var fakeSetTimeout = jasmine.createSpy('setTimeout'),
      fakeSetInterval = jasmine.createSpy('setInterval'),
      delayedFunctionScheduler = jasmine.createSpyObj('delayedFunctionScheduler', ['scheduleFunction']),
      fn = jasmine.createSpy('fn'),
      fakeGlobal = {
        setTimeout: fakeSetTimeout,
        setInterval: fakeSetInterval
      },
      clock = new j$.Clock(fakeGlobal, delayedFunctionScheduler);

    fakeSetTimeout.apply = null;
    fakeSetInterval.apply = null;

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
      delayedFunctionScheduler = new j$.DelayedFunctionScheduler(),
      clock = new j$.Clock({setTimeout: setTimeout}, delayedFunctionScheduler);

    clock.install();

    clock.setTimeout(delayedFn1, 0);
    var intervalId = clock.setInterval(recurring1, 50);
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

  it("can clear a previously set timeout", function() {
    var clearedFn = jasmine.createSpy('clearedFn'),
      delayedFunctionScheduler = new j$.DelayedFunctionScheduler(),
      clock = new j$.Clock({setTimeout: function() {}}, delayedFunctionScheduler),
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
      delayedFunctionScheduler = new j$.DelayedFunctionScheduler(),
      clock = new j$.Clock({setTimeout: function() {}}, delayedFunctionScheduler);

    clock.install();

    clock.tick(100);
    clock.setTimeout(delayedFn1, 10, ['some', 'arg']);
    clock.tick(5);
    expect(delayedFn1).not.toHaveBeenCalled();
    clock.tick(5);
    expect(delayedFn1).toHaveBeenCalled();
  });

  it("correctly schedules functions while the Clock is advancing", function() {
    var delayedFn1 = jasmine.createSpy('delayedFn1'),
        delayedFn2 = jasmine.createSpy('delayedFn2'),
        delayedFunctionScheduler = new j$.DelayedFunctionScheduler(),
        clock = new j$.Clock({setTimeout: function() {}}, delayedFunctionScheduler);

    delayedFn1.and.callFake(function() { clock.setTimeout(delayedFn2, 0); });
    clock.install();
    clock.setTimeout(delayedFn1, 5);

    clock.tick(5);
    expect(delayedFn1).toHaveBeenCalled();
    expect(delayedFn2).not.toHaveBeenCalled();

    clock.tick();
    expect(delayedFn2).toHaveBeenCalled();
  });

  it("calls the global clearTimeout correctly when not installed", function() {
    var delayedFunctionScheduler = jasmine.createSpyObj('delayedFunctionScheduler', ['clearTimeout']),
      global = jasmine.getGlobal(),
      clock = new j$.Clock(global, delayedFunctionScheduler);

    expect(function() {
      clock.clearTimeout(123)
    }).not.toThrow();
  });

  it("calls the global clearTimeout correctly when not installed", function() {
    var delayedFunctionScheduler = jasmine.createSpyObj('delayedFunctionScheduler', ['clearTimeout']),
      global = jasmine.getGlobal(),
      clock = new j$.Clock(global, delayedFunctionScheduler);

    expect(function() {
      clock.clearInterval(123)
    }).not.toThrow();
  });
});
