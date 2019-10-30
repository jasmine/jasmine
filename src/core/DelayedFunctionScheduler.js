getJasmineRequireObj().DelayedFunctionScheduler = function(j$) {
  function DelayedFunctionScheduler(Promise, clearStack) {
    var self = this;
    var scheduledLookup = [];
    var scheduledFunctions = {};
    var currentTime = 0;
    var delayedFnCount = 0;
    var deletedKeys = [];

    self.tick = function(millis, tickDate) {
      runScheduledFunctions(millis, tickDate || noop, runImmediately, noop);
    };

    self.asyncTick = function(millis, tickDate) {
      return new Promise(function(resolve) {
        runScheduledFunctions(millis, tickDate || noop, clearStack, resolve);
      });
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

    function noop() {}

    function runImmediately(f) {
      f();
    }

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

    /**
     * Runs scheduled functions, possibly asynchronously.
     *
     * @param {number} millis
     * @param {function} tickDate A function that advances the date.
     * @param {function} maybeRunMicrotasks For .asyncTick() this function
     *     should empty the microtask queue, and then call its callback.
     *     For .tick() no microtasks are run, so this function should simply
     *     call its callback immediately.
     * @param {function} onFinish Function to call when we are finished running
     *     scheduled functions.
     */
    function runScheduledFunctions(
      millis,
      tickDate,
      maybeRunMicrotasks,
      onFinish
    ) {
      millis = millis || 0;
      var endTime = currentTime + millis;

      // Conceptually, this is a do-while loop, with a for loop inside. The
      // problem is that it needs to execute asynchronously. If this were ES6,
      // we would do this with async-await. But it's not. Instead this is
      // manually transpiled as a while loop with a switch statement. This gives
      // us something like goto in JS.

      // Variables in the for loop.
      var i;
      var funcsToRun;

      // Start the asynchronous loop.
      var nextLabel = 'start';
      return loop();

      function loop() {
        while (true) {
          switch (nextLabel) {
            case 'start':
              nextLabel = 'after-microtasks-1';
              return maybeRunMicrotasks(loop);

            case 'after-microtasks-1':
              if (
                scheduledLookup.length === 0 ||
                scheduledLookup[0] > endTime
              ) {
                tickDate(endTime - currentTime);
                currentTime = endTime;
                return onFinish();
              }

            // DO
            case 'do-body':
              deletedKeys = [];
              var newCurrentTime = scheduledLookup.shift();
              tickDate(newCurrentTime - currentTime);
              currentTime = newCurrentTime;

              funcsToRun = scheduledFunctions[currentTime];

              delete scheduledFunctions[currentTime];

              for (i = 0; i < funcsToRun.length; i++) {
                if (funcsToRun[i].recurring) {
                  reschedule(funcsToRun[i]);
                }
              }

              // FOR INITIALIZATION
              i = 0;
            case 'for-body':
              // FOR CONDITION
              if (!(i < funcsToRun.length)) {
                nextLabel = 'for-end';
                break;
              }

              var funcToRun = funcsToRun[i];
              if (j$.util.arrayContains(deletedKeys, funcToRun.timeoutKey)) {
                // skip a timeoutKey deleted whilst we were running
                // CONTINUE FOR
                nextLabel = 'for-increment';
                break;
              }

              funcToRun.funcToCall.apply(null, funcToRun.params || []);
              nextLabel = 'after-microtasks-2';
              return maybeRunMicrotasks(loop);

            case 'after-microtasks-2':

            case 'for-increment':
              // FOR INCREMENT
              i++;
              // END FOR
              nextLabel = 'for-body';
              break;

            case 'for-end':
              deletedKeys = [];

            case 'do-condition':
              // DO CONDITION
              if (
                scheduledLookup.length > 0 &&
                // checking first if we're out of time prevents setTimeout(0)
                // scheduled in a funcToRun from forcing an extra iteration
                currentTime !== endTime &&
                scheduledLookup[0] <= endTime
              ) {
                nextLabel = 'do-body';
                break;
              }

            case 'do-end':
              // END DO

              // ran out of functions to call, but still time left on the clock
              if (currentTime !== endTime) {
                tickDate(endTime - currentTime);
                currentTime = endTime;
              }
              return onFinish();

            default:
              throw new Error('IMPOSSIBLE');
          }
        }
      }
    }
  }

  return DelayedFunctionScheduler;
};
