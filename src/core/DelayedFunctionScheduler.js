getJasmineRequireObj().DelayedFunctionScheduler = function(j$) {
  function DelayedFunctionScheduler() {
    var self = this;
    var scheduledLookup = [];
    var scheduledFunctions = {};
    var currentTime = 0;
    var delayedFnCount = 0;
    var deletedKeys = [];

    self.tick = function(millis, tickDate) {
      millis = millis || 0;
      var endTime = currentTime + millis;

      runScheduledFunctions(endTime, tickDate);
    };

    self.scheduleFunction = function(
      funcToCall,
      millis,
      params,
      recurring,
      timeoutKey,
      runAtMillis
    ) {
      var f;
      if (typeof funcToCall === 'string') {
        /* jshint evil: true */
        f = function() {
          return eval(funcToCall);
        };
        /* jshint evil: false */
      } else {
        f = funcToCall;
      }

      millis = millis || 0;
      timeoutKey = timeoutKey || ++delayedFnCount;
      runAtMillis = runAtMillis || currentTime + millis;

      var funcToSchedule = {
        runAtMillis: runAtMillis,
        funcToCall: f,
        recurring: recurring,
        params: params,
        timeoutKey: timeoutKey,
        millis: millis
      };

      if (runAtMillis in scheduledFunctions) {
        scheduledFunctions[runAtMillis].push(funcToSchedule);
      } else {
        scheduledFunctions[runAtMillis] = [funcToSchedule];
        scheduledLookup.push(runAtMillis);
        scheduledLookup.sort(function(a, b) {
          return a - b;
        });
      }

      return timeoutKey;
    };

    self.removeFunctionWithId = function(timeoutKey) {
      deletedKeys.push(timeoutKey);

      for (var runAtMillis in scheduledFunctions) {
        var funcs = scheduledFunctions[runAtMillis];
        var i = indexOfFirstToPass(funcs, function(func) {
          return func.timeoutKey === timeoutKey;
        });

        if (i > -1) {
          if (funcs.length === 1) {
            delete scheduledFunctions[runAtMillis];
            deleteFromLookup(runAtMillis);
          } else {
            funcs.splice(i, 1);
          }

          // intervals get rescheduled when executed, so there's never more
          // than a single scheduled function with a given timeoutKey
          break;
        }
      }
    };

    return self;

    function indexOfFirstToPass(array, testFn) {
      var index = -1;

      for (var i = 0; i < array.length; ++i) {
        if (testFn(array[i])) {
          index = i;
          break;
        }
      }

      return index;
    }

    function deleteFromLookup(key) {
      var value = Number(key);
      var i = indexOfFirstToPass(scheduledLookup, function(millis) {
        return millis === value;
      });

      if (i > -1) {
        scheduledLookup.splice(i, 1);
      }
    }

    function reschedule(scheduledFn) {
      self.scheduleFunction(
        scheduledFn.funcToCall,
        scheduledFn.millis,
        scheduledFn.params,
        true,
        scheduledFn.timeoutKey,
        scheduledFn.runAtMillis + scheduledFn.millis
      );
    }

    function forEachFunction(funcsToRun, callback) {
      for (var i = 0; i < funcsToRun.length; ++i) {
        callback(funcsToRun[i]);
      }
    }

    function runScheduledFunctions(endTime, tickDate) {
      tickDate = tickDate || function() {};
      if (scheduledLookup.length === 0 || scheduledLookup[0] > endTime) {
        if (endTime >= currentTime) {
          tickDate(endTime - currentTime);
          currentTime = endTime;
        }
        return;
      }

      do {
        deletedKeys = [];
        var newCurrentTime = scheduledLookup.shift();
        if (newCurrentTime >= currentTime) {
          tickDate(newCurrentTime - currentTime);
          currentTime = newCurrentTime;
        }

        var funcsToRun = scheduledFunctions[currentTime];

        delete scheduledFunctions[currentTime];

        forEachFunction(funcsToRun, function(funcToRun) {
          if (funcToRun.recurring) {
            reschedule(funcToRun);
          }
        });

        forEachFunction(funcsToRun, function(funcToRun) {
          if (j$.util.arrayContains(deletedKeys, funcToRun.timeoutKey)) {
            // skip a timeoutKey deleted whilst we were running
            return;
          }
          funcToRun.funcToCall.apply(null, funcToRun.params || []);
        });
        deletedKeys = [];
      } while (
        scheduledLookup.length > 0 &&
        // checking first if we're out of time prevents setTimeout(0)
        // scheduled in a funcToRun from forcing an extra iteration
        currentTime !== endTime &&
        scheduledLookup[0] <= endTime
      );

      // ran out of functions to call, but still time left on the clock
      if (endTime >= currentTime) {
        tickDate(endTime - currentTime);
        currentTime = endTime;
      }
    }
  }

  return DelayedFunctionScheduler;
};
