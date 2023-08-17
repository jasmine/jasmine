// Warning: don't add "use strict" to this file. Doing so potentially changes
// the behavior of user code that does things like setTimeout("var x = 1;")
// while the mock clock is installed.
getJasmineRequireObj().DelayedFunctionScheduler = function(j$) {
  function DelayedFunctionScheduler() {
    this.scheduledLookup_ = [];
    this.scheduledFunctions_ = {};
    this.currentTime_ = 0;
    this.delayedFnCount_ = 0;
    this.deletedKeys_ = [];

    this.tick = function(millis, tickDate) {
      millis = millis || 0;
      const endTime = this.currentTime_ + millis;

      this.runScheduledFunctions_(endTime, tickDate);
    };

    this.scheduleFunction = function(
      funcToCall,
      millis,
      params,
      recurring,
      timeoutKey,
      runAtMillis
    ) {
      let f;
      if (typeof funcToCall === 'string') {
        // setTimeout("some code") and setInterval("some code") are legal, if
        // not recommended. We don't do that ourselves, but user code might.
        // This allows such code to work when the mock clock is installed.
        f = function() {
          // eslint-disable-next-line no-eval
          return eval(funcToCall);
        };
      } else {
        f = funcToCall;
      }

      millis = millis || 0;
      timeoutKey = timeoutKey || ++this.delayedFnCount_;
      runAtMillis = runAtMillis || this.currentTime_ + millis;

      const funcToSchedule = {
        runAtMillis: runAtMillis,
        funcToCall: f,
        recurring: recurring,
        params: params,
        timeoutKey: timeoutKey,
        millis: millis
      };

      if (runAtMillis in this.scheduledFunctions_) {
        this.scheduledFunctions_[runAtMillis].push(funcToSchedule);
      } else {
        this.scheduledFunctions_[runAtMillis] = [funcToSchedule];
        this.scheduledLookup_.push(runAtMillis);
        this.scheduledLookup_.sort(function(a, b) {
          return a - b;
        });
      }

      return timeoutKey;
    };

    this.removeFunctionWithId = function(timeoutKey) {
      this.deletedKeys_.push(timeoutKey);

      for (const runAtMillis in this.scheduledFunctions_) {
        const funcs = this.scheduledFunctions_[runAtMillis];
        const i = indexOfFirstToPass(funcs, function(func) {
          return func.timeoutKey === timeoutKey;
        });

        if (i > -1) {
          if (funcs.length === 1) {
            delete this.scheduledFunctions_[runAtMillis];
            this.deleteFromLookup_(runAtMillis);
          } else {
            funcs.splice(i, 1);
          }

          // intervals get rescheduled when executed, so there's never more
          // than a single scheduled function with a given timeoutKey
          break;
        }
      }
    };

    return this;
  }

  DelayedFunctionScheduler.prototype.runScheduledFunctions_ = function(
    endTime,
    tickDate
  ) {
    tickDate = tickDate || function() {};
    if (
      this.scheduledLookup_.length === 0 ||
      this.scheduledLookup_[0] > endTime
    ) {
      if (endTime >= this.currentTime_) {
        tickDate(endTime - this.currentTime_);
        this.currentTime_ = endTime;
      }
      return;
    }

    do {
      this.deletedKeys_ = [];
      const newCurrentTime = this.scheduledLookup_.shift();
      if (newCurrentTime >= this.currentTime_) {
        tickDate(newCurrentTime - this.currentTime_);
        this.currentTime_ = newCurrentTime;
      }

      const funcsToRun = this.scheduledFunctions_[this.currentTime_];

      delete this.scheduledFunctions_[this.currentTime_];

      for (const fn of funcsToRun) {
        if (fn.recurring) {
          this.reschedule_(fn);
        }
      }

      for (const fn of funcsToRun) {
        if (this.deletedKeys_.includes(fn.timeoutKey)) {
          // skip a timeoutKey deleted whilst we were running
          return;
        }
        fn.funcToCall.apply(null, fn.params || []);
      }
      this.deletedKeys_ = [];
    } while (
      this.scheduledLookup_.length > 0 &&
      // checking first if we're out of time prevents setTimeout(0)
      // scheduled in a funcToRun from forcing an extra iteration
      this.currentTime_ !== endTime &&
      this.scheduledLookup_[0] <= endTime
    );

    // ran out of functions to call, but still time left on the clock
    if (endTime >= this.currentTime_) {
      tickDate(endTime - this.currentTime_);
      this.currentTime_ = endTime;
    }
  };

  DelayedFunctionScheduler.prototype.reschedule_ = function(scheduledFn) {
    this.scheduleFunction(
      scheduledFn.funcToCall,
      scheduledFn.millis,
      scheduledFn.params,
      true,
      scheduledFn.timeoutKey,
      scheduledFn.runAtMillis + scheduledFn.millis
    );
  };

  DelayedFunctionScheduler.prototype.deleteFromLookup_ = function(key) {
    const value = Number(key);
    const i = indexOfFirstToPass(this.scheduledLookup_, function(millis) {
      return millis === value;
    });

    if (i > -1) {
      this.scheduledLookup_.splice(i, 1);
    }
  };

  function indexOfFirstToPass(array, testFn) {
    let index = -1;

    for (let i = 0; i < array.length; ++i) {
      if (testFn(array[i])) {
        index = i;
        break;
      }
    }

    return index;
  }

  return DelayedFunctionScheduler;
};
