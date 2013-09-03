getJasmineRequireObj().DelayedFunctionScheduler = function() {
  function DelayedFunctionScheduler() {
    var self = this;
    var scheduledFunctions = {};
    var currentTime = 0;
    var delayedFnCount = 0;

    self.tick = function(millis) {
      millis = millis || 0;
      currentTime = currentTime + millis;
      runFunctionsWithinRange(currentTime - millis, currentTime);
    };

    self.scheduleFunction = function(funcToCall, millis, params, recurring, timeoutKey, runAtMillis) {
      var f;
      if (typeof(funcToCall) === 'string') {
        /* jshint evil: true */
        f = function() { return eval(funcToCall); };
        /* jshint evil: false */
      } else {
        f = funcToCall;
      }

      millis = millis || 0;
      timeoutKey = timeoutKey || ++delayedFnCount;
      runAtMillis = runAtMillis || (currentTime + millis);
      scheduledFunctions[timeoutKey] = {
        runAtMillis: runAtMillis,
        funcToCall: f,
        recurring: recurring,
        params: params,
        timeoutKey: timeoutKey,
        millis: millis
      };
      return timeoutKey;
    };

    self.removeFunctionWithId = function(timeoutKey) {
      delete scheduledFunctions[timeoutKey];
    };

    self.reset = function() {
      currentTime = 0;
      scheduledFunctions = {};
      delayedFnCount = 0;
    };

    return self;

    // finds/dupes functions within range and removes them.
    function functionsWithinRange(startMillis, endMillis) {
      var fnsToRun = [];
      for (var timeoutKey in scheduledFunctions) {
        var scheduledFunc = scheduledFunctions[timeoutKey];
        if (scheduledFunc &&
          scheduledFunc.runAtMillis >= startMillis &&
          scheduledFunc.runAtMillis <= endMillis) {

          // remove fn -- we'll reschedule later if it is recurring.
          self.removeFunctionWithId(timeoutKey);
          if (!scheduledFunc.recurring) {
            fnsToRun.push(scheduledFunc); // schedules each function only once
          } else {
            fnsToRun.push(buildNthInstanceOf(scheduledFunc, 0));
            var additionalTimesFnRunsInRange =
              Math.floor((endMillis - scheduledFunc.runAtMillis) / scheduledFunc.millis);
            for (var i = 0; i < additionalTimesFnRunsInRange; i++) {
              fnsToRun.push(buildNthInstanceOf(scheduledFunc, i + 1));
            }
            reschedule(buildNthInstanceOf(scheduledFunc, additionalTimesFnRunsInRange));
          }
        }
      }

      return fnsToRun;
    }

    function buildNthInstanceOf(scheduledFunc, n) {
      return {
        runAtMillis: scheduledFunc.runAtMillis + (scheduledFunc.millis * n),
        funcToCall: scheduledFunc.funcToCall,
        params: scheduledFunc.params,
        millis: scheduledFunc.millis,
        recurring: scheduledFunc.recurring,
        timeoutKey: scheduledFunc.timeoutKey
      };
    }

    function reschedule(scheduledFn) {
      self.scheduleFunction(scheduledFn.funcToCall,
        scheduledFn.millis,
        scheduledFn.params,
        true,
        scheduledFn.timeoutKey,
        scheduledFn.runAtMillis + scheduledFn.millis);
    }


    function runFunctionsWithinRange(startMillis, endMillis) {
      var funcsToRun = functionsWithinRange(startMillis, endMillis);
      if (funcsToRun.length === 0) {
        return;
      }

      funcsToRun.sort(function(a, b) {
        return a.runAtMillis - b.runAtMillis;
      });

      for (var i = 0; i < funcsToRun.length; ++i) {
        var funcToRun = funcsToRun[i];
        funcToRun.funcToCall.apply(null, funcToRun.params || []);
      }
    }
  }

  return DelayedFunctionScheduler;
};
