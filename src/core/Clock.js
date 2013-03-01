jasmine.Clock = function(global, delayedFunctionScheduler) {
  var self = this,
    realTimingFunctions = {
      setTimeout: global.setTimeout,
      clearTimeout: global.clearTimeout,
      setInterval: global.setInterval,
      clearInterval: global.clearInterval
    },
    fakeTimingFunctions = {
      setTimeout: setTimeout,
      clearTimeout: clearTimeout,
      setInterval: setInterval,
      clearInterval: clearInterval
    },
    timer = realTimingFunctions,
    installed = false;

  self.install = function() {
    installed = true;
    timer = fakeTimingFunctions;
  };

  self.uninstall = function() {
    delayedFunctionScheduler.reset();
    installed = false;
    timer = realTimingFunctions;
  };

  self.setTimeout = function(fn, delay, params) {
    if (legacyIE()) {
      if (arguments.length > 2) {
        throw new Error("IE < 9 cannot support extra params to setTimeout without a polyfill");
      }
      return timer.setTimeout(fn, delay);
    }
    return timer.setTimeout.apply(null, arguments);
  };

  self.setInterval = function(fn, delay, params) {
    if (legacyIE()) {
      if (arguments.length > 2) {
        throw new Error("IE < 9 cannot support extra params to setInterval without a polyfill");
      }
      return timer.setInterval(fn, delay);
    }
    return timer.setInterval.apply(null, arguments);
  };

  self.clearTimeout = function(id) {
    return timer.clearTimeout(id);
  };

  self.clearInterval = function(id) {
    return timer.clearInterval(id);
  };

  self.tick = function(millis) {
    if (installed) {
      delayedFunctionScheduler.tick(millis);
    } else {
      throw new Error("Mock clock is not installed, use jasmine.Clock.useMock()");
    }
  };

  return self;

  function legacyIE() {
    //if these methods are polyfilled, apply will be present
    //TODO: it may be difficult to load the polyfill before jasmine loads
    //(env should be new-ed inside of onload)
    return !(global.setTimeout || global.setInterval).apply;
  }

  function setTimeout(fn, delay) {
    return delayedFunctionScheduler.scheduleFunction(fn, delay, argSlice(arguments, 2));
  }

  function clearTimeout(id) {
    return delayedFunctionScheduler.removeFunctionWithId(id);
  }

  function setInterval(fn, interval) {
    return delayedFunctionScheduler.scheduleFunction(fn, interval, argSlice(arguments, 2), true);
  }

  function clearInterval(id) {
    return delayedFunctionScheduler.removeFunctionWithId(id);
  }

  function argSlice(argsObj, n) {
    return Array.prototype.slice.call(argsObj, 2);
  }
};
