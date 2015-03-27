describe("Clock", function() {

  it("does not replace setTimeout until it is installed", function() {
    var fakeSetTimeout = jasmine.createSpy("global setTimeout"),
      fakeGlobal = { setTimeout: fakeSetTimeout },
      delayedFunctionScheduler = jasmine.createSpyObj("delayedFunctionScheduler", ["scheduleFunction"]),
      delayedFn = jasmine.createSpy("delayedFn"),
      mockDate = { install: function() {}, tick: function() {}, uninstall: function() {} },
      clock = new j$.Clock(fakeGlobal, function () { return delayedFunctionScheduler; }, mockDate);

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
      mockDate = { install: function() {}, tick: function() {}, uninstall: function() {} },
      clock = new j$.Clock(fakeGlobal, function () { return delayedFunctionScheduler; }, mockDate);

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
      mockDate = { install: function() {}, tick: function() {}, uninstall: function() {} },
      clock = new j$.Clock(fakeGlobal, function () { return delayedFunctionScheduler; }, mockDate);

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
      mockDate = { install: function() {}, tick: function() {}, uninstall: function() {} },
      clock = new j$.Clock(fakeGlobal, function () { return delayedFunctionScheduler; }, mockDate);

    fakeGlobal.clearInterval("foo");

    expect(fakeClearInterval).toHaveBeenCalledWith("foo");
    expect(delayedFunctionScheduler.removeFunctionWithId).not.toHaveBeenCalled();

    fakeClearInterval.calls.reset();

    clock.install();
    fakeGlobal.clearInterval("foo");

    expect(delayedFunctionScheduler.removeFunctionWithId).toHaveBeenCalled();
    expect(fakeClearInterval).not.toHaveBeenCalled();
  });

  it("does not install if the current setTimeout is not the original function on the global", function() {
    var originalFakeSetTimeout = function() {},
      replacedSetTimeout = function() {},
      fakeGlobal = { setTimeout: originalFakeSetTimeout },
      delayedFunctionSchedulerFactory = jasmine.createSpy('delayedFunctionSchedulerFactory'),
      mockDate = {},
      clock = new j$.Clock(fakeGlobal, delayedFunctionSchedulerFactory, mockDate);

    fakeGlobal.setTimeout = replacedSetTimeout;

    expect(function() {
      clock.install();
    }).toThrowError(/unable to install/);

    expect(delayedFunctionSchedulerFactory).not.toHaveBeenCalled();
    expect(fakeGlobal.setTimeout).toBe(replacedSetTimeout);
  });

  it("does not install if the current clearTimeout is not the original function on the global", function() {
    var originalFakeClearTimeout = function() {},
      replacedClearTimeout = function() {},
      fakeGlobal = { clearTimeout: originalFakeClearTimeout },
      delayedFunctionSchedulerFactory = jasmine.createSpy('delayedFunctionSchedulerFactory'),
      mockDate = {},
      clock = new j$.Clock(fakeGlobal, delayedFunctionSchedulerFactory, mockDate);

    fakeGlobal.clearTimeout = replacedClearTimeout;

    expect(function() {
      clock.install();
    }).toThrowError(/unable to install/);

    expect(delayedFunctionSchedulerFactory).not.toHaveBeenCalled();
    expect(fakeGlobal.clearTimeout).toBe(replacedClearTimeout);
  });

  it("does not install if the current setInterval is not the original function on the global", function() {
    var originalFakeSetInterval = function() {},
      replacedSetInterval = function() {},
      fakeGlobal = { setInterval: originalFakeSetInterval },
      delayedFunctionSchedulerFactory = jasmine.createSpy('delayedFunctionSchedulerFactory'),
      mockDate = {},
      clock = new j$.Clock(fakeGlobal, delayedFunctionSchedulerFactory, mockDate);

    fakeGlobal.setInterval = replacedSetInterval;

    expect(function() {
      clock.install();
    }).toThrowError(/unable to install/);

    expect(delayedFunctionSchedulerFactory).not.toHaveBeenCalled();
    expect(fakeGlobal.setInterval).toBe(replacedSetInterval);
  });

  it("does not install if the current clearInterval is not the original function on the global", function() {
    var originalFakeClearInterval = function() {},
      replacedClearInterval = function() {},
      fakeGlobal = { clearInterval: originalFakeClearInterval },
      delayedFunctionSchedulerFactory = jasmine.createSpy('delayedFunctionSchedulerFactory'),
      mockDate = {},
      clock = new j$.Clock(fakeGlobal, delayedFunctionSchedulerFactory, mockDate);

    fakeGlobal.clearInterval = replacedClearInterval;

    expect(function() {
      clock.install();
    }).toThrowError(/unable to install/);

    expect(delayedFunctionSchedulerFactory).not.toHaveBeenCalled();
    expect(fakeGlobal.clearInterval).toBe(replacedClearInterval);
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
      mockDate = { install: function() {}, tick: function() {}, uninstall: function() {} },
      clock = new j$.Clock(fakeGlobal, function () { return delayedFunctionScheduler; }, mockDate);

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

  it("can be installed for the duration of a passed in function and uninstalled when done", function() {
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
      delayedFunctionScheduler = jasmine.createSpyObj("delayedFunctionScheduler", ["scheduleFunction", "reset", "removeFunctionWithId"]),
      delayedFn = jasmine.createSpy("delayedFn"),
      mockDate = { install: function() {}, tick: function() {}, uninstall: function() {} },
      clock = new j$.Clock(fakeGlobal, function () { return delayedFunctionScheduler; }, mockDate),
      passedFunctionCalled = false;

    clock.withMock(function() {
      fakeGlobal.setTimeout(delayedFn, 0);
      fakeGlobal.clearTimeout("foo");
      fakeGlobal.setInterval(delayedFn, 10);
      fakeGlobal.clearInterval("bar");
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
    fakeGlobal.clearTimeout("foo");
    fakeGlobal.setInterval(delayedFn, 10);
    fakeGlobal.clearInterval("bar");

    expect(fakeSetTimeout).toHaveBeenCalledWith(delayedFn, 0);
    expect(fakeClearTimeout).toHaveBeenCalledWith("foo");
    expect(fakeSetInterval).toHaveBeenCalledWith(delayedFn, 10);
    expect(fakeClearInterval).toHaveBeenCalledWith("bar");
    expect(delayedFunctionScheduler.scheduleFunction).not.toHaveBeenCalled();
  });

  it("can be installed for the duration of a passed in function and uninstalled if an error is thrown", function() {
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
      delayedFunctionScheduler = jasmine.createSpyObj("delayedFunctionScheduler", ["scheduleFunction", "reset", "removeFunctionWithId"]),
      delayedFn = jasmine.createSpy("delayedFn"),
      mockDate = { install: function() {}, tick: function() {}, uninstall: function() {} },
      clock = new j$.Clock(fakeGlobal, function () { return delayedFunctionScheduler; }, mockDate),
      passedFunctionCalled = false;

    expect(function() {
      clock.withMock(function() {
        fakeGlobal.setTimeout(delayedFn, 0);
        fakeGlobal.clearTimeout("foo");
        fakeGlobal.setInterval(delayedFn, 10);
        fakeGlobal.clearInterval("bar");
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
      mockDate = { install: function() {}, tick: function() {}, uninstall: function() {} },
      clock = new j$.Clock(fakeGlobal, function () { return delayedFunctionScheduler; }, mockDate);

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
      mockDate = { install: function() {}, tick: function() {}, uninstall: function() {} },
      clock = new j$.Clock(fakeGlobal, function () { return delayedFunctionScheduler; }, mockDate),
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
      mockDate = { install: function() {}, tick: function() {}, uninstall: function() {} },
      clock = new j$.Clock(fakeGlobal, function () { return delayedFunctionScheduler; }, mockDate);

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
      mockDate = { install: function() {}, tick: function() {}, uninstall: function() {} },
      clock = new j$.Clock(fakeGlobal, function () { return delayedFunctionScheduler; }, mockDate);

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
      mockDate = { install: function() {}, tick: function() {}, uninstall: function() {} },
      clock = new j$.Clock(fakeGlobal, function () { return delayedFunctionScheduler; }, mockDate),
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
      mockDate = { install: function() {}, tick: function() {}, uninstall: function() {} },
      clock = new j$.Clock(fakeGlobal, function () { return delayedFunctionScheduler; }, mockDate);

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
      mockDate = { install: function() {}, tick: function() {}, uninstall: function() {} },
      clock = new j$.Clock(fakeGlobal, function () { return delayedFunctionScheduler; }, mockDate);

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
      mockDate = { install: function() {}, tick: function() {}, uninstall: function() {} },
      clock = new j$.Clock({setTimeout: setTimeout}, function () { return delayedFunctionScheduler; }, mockDate);

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
      mockDate = { install: function() {}, tick: function() {}, uninstall: function() {} },
      clock = new j$.Clock({setTimeout: function() {}}, function () { return delayedFunctionScheduler; }, mockDate),
      timeoutId;

    clock.install();

    timeoutId = clock.setTimeout(clearedFn, 100);
    expect(clearedFn).not.toHaveBeenCalled();

    clock.clearTimeout(timeoutId);
    clock.tick(100);

    expect(clearedFn).not.toHaveBeenCalled();
  });

  it("can clear a previously set interval using that interval's handler", function() {
    var spy = jasmine.createSpy('spy'),
      delayedFunctionScheduler = new j$.DelayedFunctionScheduler(),
      mockDate = { install: function() {}, tick: function() {}, uninstall: function() {} },
      clock = new j$.Clock({setInterval: function() {}}, function () { return delayedFunctionScheduler; }, mockDate),
      intervalId;

    clock.install();

    intervalId = clock.setInterval(function() {
      spy();
      clock.clearInterval(intervalId);
    }, 100);
    clock.tick(200);

    expect(spy.calls.count()).toEqual(1);
  });

  it("correctly schedules functions after the Clock has advanced", function() {
    var delayedFn1 = jasmine.createSpy('delayedFn1'),
      delayedFunctionScheduler = new j$.DelayedFunctionScheduler(),
      mockDate = { install: function() {}, tick: function() {}, uninstall: function() {} },
      clock = new j$.Clock({setTimeout: function() {}}, function () { return delayedFunctionScheduler; }, mockDate);

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
        mockDate = { install: function() {}, tick: function() {}, uninstall: function() {} },
        clock = new j$.Clock({setTimeout: function() {}}, function () { return delayedFunctionScheduler; }, mockDate);

    delayedFn1.and.callFake(function() { clock.setTimeout(delayedFn2, 0); });
    clock.install();
    clock.setTimeout(delayedFn1, 5);

    clock.tick(5);
    expect(delayedFn1).toHaveBeenCalled();
    expect(delayedFn2).not.toHaveBeenCalled();

    clock.tick();
    expect(delayedFn2).toHaveBeenCalled();
  });

  it("correctly calls functions scheduled while the Clock is advancing", function() {
    var delayedFn1 = jasmine.createSpy('delayedFn1'),
        delayedFn2 = jasmine.createSpy('delayedFn2'),
        delayedFunctionScheduler = new j$.DelayedFunctionScheduler(),
        mockDate = { install: function() {}, tick: function() {}, uninstall: function() {} },
        clock = new j$.Clock({setTimeout: function() {}}, function () { return delayedFunctionScheduler; }, mockDate);

    delayedFn1.and.callFake(function() { clock.setTimeout(delayedFn2, 1); });
    clock.install();
    clock.setTimeout(delayedFn1, 5);

    clock.tick(6);
    expect(delayedFn1).toHaveBeenCalled();
    expect(delayedFn2).toHaveBeenCalled();
  });

  it("correctly schedules functions scheduled while the Clock is advancing but after the Clock is uninstalled", function() {
    var delayedFn1 = jasmine.createSpy('delayedFn1'),
        delayedFn2 = jasmine.createSpy('delayedFn2'),
        delayedFunctionScheduler = new j$.DelayedFunctionScheduler(),
        mockDate = { install: function() {}, tick: function() {}, uninstall: function() {} },
        clock = new j$.Clock({setTimeout: function() {}}, function () { return delayedFunctionScheduler; }, mockDate);

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

  it("does not mock the Date object by default", function() {
     var delayedFunctionScheduler = new j$.DelayedFunctionScheduler(),
      global = {Date: Date},
      mockDate = new j$.MockDate(global),
      clock = new j$.Clock({setTimeout: setTimeout}, function () { return delayedFunctionScheduler; }, mockDate);

    clock.install();

    expect(global.Date).toEqual(Date);

    var now = new global.Date().getTime();

    clock.tick(50);

    expect(new global.Date().getTime() - now).not.toEqual(50);
  });

  it("mocks the Date object and sets it to current time", function() {
    var delayedFunctionScheduler = new j$.DelayedFunctionScheduler(),
      global = {Date: Date},
      mockDate = new j$.MockDate(global),
      clock = new j$.Clock({setTimeout: setTimeout}, function () { return delayedFunctionScheduler; }, mockDate);

    clock.install().mockDate();

    var now = new global.Date().getTime();

    clock.tick(50);

    expect(new global.Date().getTime() - now).toEqual(50);

    var timeoutDate = 0;
    clock.setTimeout(function() {
      timeoutDate = new global.Date().getTime();
    }, 100);

    clock.tick(100);

    expect(timeoutDate - now).toEqual(150);
  });

  it("mocks the Date object and sets it to a given time", function() {
    var delayedFunctionScheduler = new j$.DelayedFunctionScheduler(),
      global = {Date: Date},
      mockDate = new j$.MockDate(global),
      clock = new j$.Clock({setTimeout: setTimeout}, function () { return delayedFunctionScheduler; }, mockDate),
      baseTime = new Date(2013, 9, 23);


    clock.install().mockDate(baseTime);

    var now = new global.Date().getTime();

    expect(now).toEqual(baseTime.getTime());

    clock.tick(50);

    expect(new global.Date().getTime()).toEqual(baseTime.getTime() + 50);

    var timeoutDate = 0;
    clock.setTimeout(function() {
      timeoutDate = new global.Date().getTime();
    }, 100);

    clock.tick(100);

    expect(timeoutDate).toEqual(baseTime.getTime() + 150);
  });
});
