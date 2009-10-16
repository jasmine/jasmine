// Mock setTimeout, clearTimeout
// Contributed by Pivotal Computer Systems, www.pivotalsf.com

jasmine.FakeTimer = function() {
  this.reset();

  var self = this;
  self.setTimeout = function(funcToCall, millis) {
    self.timeoutsMade++;
    self.scheduleFunction(self.timeoutsMade, funcToCall, millis, false);
    return self.timeoutsMade;
  };

  self.setInterval = function(funcToCall, millis) {
    self.timeoutsMade++;
    self.scheduleFunction(self.timeoutsMade, funcToCall, millis, true);
    return self.timeoutsMade;
  };

  self.clearTimeout = function(timeoutKey) {
    self.scheduledFunctions[timeoutKey] = undefined;
  };

  self.clearInterval = function(timeoutKey) {
    self.scheduledFunctions[timeoutKey] = undefined;
  };

};

jasmine.FakeTimer.prototype.reset = function() {
  this.timeoutsMade = 0;
  this.scheduledFunctions = {};
  this.nowMillis = 0;
};

jasmine.FakeTimer.prototype.tick = function(millis) {
  var oldMillis = this.nowMillis;
  var newMillis = oldMillis + millis;
  this.runFunctionsWithinRange(oldMillis, newMillis);
  this.nowMillis = newMillis;
};

jasmine.FakeTimer.prototype.runFunctionsWithinRange = function(oldMillis, nowMillis) {
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
        var funcToRun = funcsToRun[i];
        this.nowMillis = funcToRun.runAtMillis;
        funcToRun.funcToCall();
        if (funcToRun.recurring) {
          this.scheduleFunction(funcToRun.timeoutKey,
            funcToRun.funcToCall,
            funcToRun.millis,
            true);
        }
      } catch(e) {
      }
    }
    this.runFunctionsWithinRange(oldMillis, nowMillis);
  }
};

jasmine.FakeTimer.prototype.scheduleFunction = function(timeoutKey, funcToCall, millis, recurring) {
  this.scheduledFunctions[timeoutKey] = {
    runAtMillis: this.nowMillis + millis,
    funcToCall: funcToCall,
    recurring: recurring,
    timeoutKey: timeoutKey,
    millis: millis
  };
};


jasmine.Clock = {
  defaultFakeTimer: new jasmine.FakeTimer(),

  reset: function() {
    jasmine.Clock.assertInstalled();
    jasmine.Clock.defaultFakeTimer.reset();
  },

  tick: function(millis) {
    jasmine.Clock.assertInstalled();
    jasmine.Clock.defaultFakeTimer.tick(millis);
  },

  runFunctionsWithinRange: function(oldMillis, nowMillis) {
    jasmine.Clock.defaultFakeTimer.runFunctionsWithinRange(oldMillis, nowMillis);
  },

  scheduleFunction: function(timeoutKey, funcToCall, millis, recurring) {
    jasmine.Clock.defaultFakeTimer.scheduleFunction(timeoutKey, funcToCall, millis, recurring);
  },

  useMock: function() {
    var spec = jasmine.getEnv().currentSpec;
    spec.after(jasmine.Clock.uninstallMock);

    jasmine.Clock.installMock();
  },

  installMock: function() {
    jasmine.Clock.installed = jasmine.Clock.defaultFakeTimer;
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

  assertInstalled: function() {
    if (jasmine.Clock.installed != jasmine.Clock.defaultFakeTimer) {
      throw new Error("Mock clock is not installed, use jasmine.Clock.useMock()");
    }
  },

  installed: null
};
jasmine.Clock.installed = jasmine.Clock.real;

//else for IE support
window.setTimeout = function(funcToCall, millis) {
  if (jasmine.Clock.installed.setTimeout.apply) {
    return jasmine.Clock.installed.setTimeout.apply(this, arguments);
  } else {
    return jasmine.Clock.installed.setTimeout(funcToCall, millis);
  }
};

window.setInterval = function(funcToCall, millis) {
  if (jasmine.Clock.installed.setInterval.apply) {
    return jasmine.Clock.installed.setInterval.apply(this, arguments);
  } else {
    return jasmine.Clock.installed.setInterval(funcToCall, millis);
  }
};

window.clearTimeout = function(timeoutKey) {
  if (jasmine.Clock.installed.clearTimeout.apply) {
    return jasmine.Clock.installed.clearTimeout.apply(this, arguments);
  } else {
    return jasmine.Clock.installed.clearTimeout(timeoutKey);
  }
};

window.clearInterval = function(timeoutKey) {
  if (jasmine.Clock.installed.clearTimeout.apply) {
    return jasmine.Clock.installed.clearInterval.apply(this, arguments);
  } else {
  return jasmine.Clock.installed.clearInterval(timeoutKey);
  }
};

