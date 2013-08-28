getJasmineRequireObj().Clock = function() {
  function Clock(global, delayedFunctionScheduler) {
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
      installed = false;

    self.install = function() {
      replace(global, fakeTimingFunctions);
      timer = fakeTimingFunctions;
      installed = true;
    };

    self.uninstall = function() {
      delayedFunctionScheduler.reset();
      replace(global, realTimingFunctions);
      timer = realTimingFunctions;
      installed = false;
    };

    self.setTimeout = function(fn, delay, params) {
      if (legacyIE()) {
        if (arguments.length > 2) {
          throw new Error("IE < 9 cannot support extra params to setTimeout without a polyfill");
        }
        return timer.setTimeout(fn, delay);
      }
      return Function.prototype.apply.apply(timer.setTimeout, [global, arguments]);
    };

    self.setInterval = function(fn, delay, params) {
      if (legacyIE()) {
        if (arguments.length > 2) {
          throw new Error("IE < 9 cannot support extra params to setInterval without a polyfill");
        }
        return timer.setInterval(fn, delay);
      }
      return Function.prototype.apply.apply(timer.setInterval, [global, arguments]);
    };

    self.clearTimeout = function(id) {
      return Function.prototype.call.apply(timer.clearTimeout, [global, id]);
    };

    self.clearInterval = function(id) {
      return Function.prototype.call.apply(timer.clearInterval, [global, id]);
    };

    self.tick = function(millis) {
      if (installed) {
        delayedFunctionScheduler.tick(millis);
      } else {
        throw new Error("Mock clock is not installed, use jasmine.getEnv().clock.install()");
      }
    };

    return self;

    function legacyIE() {
      //if these methods are polyfilled, apply will be present
      //TODO: it may be difficult to load the polyfill before jasmine loads
      //(env should be new-ed inside of onload)
      return !(realTimingFunctions.setTimeout || realTimingFunctions.setInterval).apply;
    }

    function replace(dest, source) {
      for (var prop in source) {
        dest[prop] = source[prop];
      }
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
  }

  return Clock;
};
