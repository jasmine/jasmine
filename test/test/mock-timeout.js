// Mock setTimeout, clearTimeout
// Contributed by Pivotal Computer Systems, www.pivotalsf.com

jasmine.Clock = {
  timeoutsMade: 0,

  scheduledFunctions: {},

  nowMillis: 0,

  reset: function() {
    jasmine.Clock.assertInstalled();

    this.scheduledFunctions = {};
    this.nowMillis = 0;
    this.timeoutsMade = 0;
  },

  tick: function(millis) {
    jasmine.Clock.assertInstalled();

    var oldMillis = this.nowMillis;
    var newMillis = oldMillis + millis;
    this.runFunctionsWithinRange(oldMillis, newMillis);
    this.nowMillis = newMillis;
  },

  runFunctionsWithinRange: function(oldMillis, nowMillis) {
    var scheduledFunc;
    var funcsToRun = [];
    for (var timeoutKey in this.scheduledFunctions) {
      scheduledFunc = this.scheduledFunctions[timeoutKey];
      if (scheduledFunc != undefined &&
          scheduledFunc.runAtMillis >= oldMillis &&
          scheduledFunc.runAtMillis <= nowMillis) {
        funcsToRun.push(scheduledFunc);
        this.scheduledFunctions[timeoutKey] = undefined;
      }
    }

    if (funcsToRun.length > 0) {
      funcsToRun.sort(function(a, b) {
        return a.runAtMillis - b.runAtMillis;
      });
      for (var i = 0; i < funcsToRun.length; ++i) {
        try {
          this.nowMillis = funcsToRun[i].runAtMillis;
          funcsToRun[i].funcToCall();
          if (funcsToRun[i].recurring) {
            jasmine.Clock.scheduleFunction(funcsToRun[i].timeoutKey,
              funcsToRun[i].funcToCall,
              funcsToRun[i].millis,
              true);
          }
        } catch(e) {
        }
      }
      this.runFunctionsWithinRange(oldMillis, nowMillis);
    }
  },

  scheduleFunction: function(timeoutKey, funcToCall, millis, recurring) {
    jasmine.Clock.scheduledFunctions[timeoutKey] = {
      runAtMillis: jasmine.Clock.nowMillis + millis,
      funcToCall: funcToCall,
      recurring: recurring,
      timeoutKey: timeoutKey,
      millis: millis
    };
  },

  useMock: function() {
    var spec = jasmine.getEnv().currentSpec;
    spec.after(jasmine.Clock.uninstallMock);

    jasmine.Clock.installMock();
  },

  installMock: function() {
    jasmine.Clock.installed = jasmine.Clock.mock;
  },

  uninstallMock: function() {
    jasmine.Clock.assertInstalled();
    jasmine.Clock.installed = jasmine.Clock.real;
  },

  real: {
    setTimeout: window.setTimeout,
    clearTimeout: window.clearTimeout,
    setInterval: window.setInterval,
    clearInterval: window.clearInterval
  },

  mock: {
    setTimeout: function(funcToCall, millis) {
      jasmine.Clock.timeoutsMade = jasmine.Clock.timeoutsMade + 1;
      jasmine.Clock.scheduleFunction(jasmine.Clock.timeoutsMade, funcToCall, millis, false);
      return jasmine.Clock.timeoutsMade;
    },
    setInterval: function(funcToCall, millis) {
      jasmine.Clock.timeoutsMade = jasmine.Clock.timeoutsMade + 1;
      jasmine.Clock.scheduleFunction(jasmine.Clock.timeoutsMade, funcToCall, millis, true);
      return jasmine.Clock.timeoutsMade;
    },
    clearTimeout: function(timeoutKey) {
      jasmine.Clock.scheduledFunctions[timeoutKey] = undefined;
    },
    clearInterval: function(timeoutKey) {
      jasmine.Clock.scheduledFunctions[timeoutKey] = undefined;
    }
  },

  assertInstalled: function() {
    if (jasmine.Clock.installed != jasmine.Clock.mock) {
      throw new Error("Mock clock is not installed, use jasmine.Clock.useMock()");
    }
  },  

  installed: null
};
jasmine.Clock.installed = jasmine.Clock.real;

window.setTimeout = function(funcToCall, millis) {
  return jasmine.Clock.installed.setTimeout.apply(this, arguments);
};

window.setInterval = function(funcToCall, millis) {
  return jasmine.Clock.installed.setInterval.apply(this, arguments);
};

window.clearTimeout = function(timeoutKey) {
  return jasmine.Clock.installed.clearTimeout.apply(this, arguments);
};

window.clearInterval = function(timeoutKey) {
  return jasmine.Clock.installed.clearInterval.apply(this, arguments);
};

