getJasmineRequireObj().Clock = function() {
  /* global process */
  const NODE_JS =
    typeof process !== 'undefined' &&
    process.versions &&
    typeof process.versions.node === 'string';

  const IsMockClockTimingFn = Symbol('IsMockClockTimingFn');

  /**
   * @class Clock
   * @since 1.3.0
   * @classdesc Jasmine's mock clock is used when testing time dependent code.<br>
   * _Note:_ Do not construct this directly. You can get the current clock with
   * {@link jasmine.clock}.
   * @hideconstructor
   */
  function Clock(global, delayedFunctionSchedulerFactory, mockDate) {
    const realTimingFunctions = {
      setTimeout: global.setTimeout,
      clearTimeout: global.clearTimeout,
      setInterval: global.setInterval,
      clearInterval: global.clearInterval
    };
    const fakeTimingFunctions = {
      setTimeout: setTimeout,
      clearTimeout: clearTimeout,
      setInterval: setInterval,
      clearInterval: clearInterval
    };
    let installed = false;
    let delayedFunctionScheduler;
    let timer;
    // Tracks how the clock ticking behaves.
    // By default, the clock only ticks when the user manually calls a tick method.
    // There is also an 'auto' mode which will advance the clock automatically to
    // to the next task. Once enabled, there is currently no mechanism for users
    // to disable the auto ticking.
    let tickMode = {
      mode: 'manual',
      counter: 0
    };

    this.FakeTimeout = FakeTimeout;

    /**
     * Install the mock clock over the built-in methods.
     * @name Clock#install
     * @since 2.0.0
     * @function
     * @return {Clock}
     */
    this.install = function() {
      if (!originalTimingFunctionsIntact()) {
        throw new Error(
          'Jasmine Clock was unable to install over custom global timer functions. Is the clock already installed?'
        );
      }
      replace(global, fakeTimingFunctions);
      timer = fakeTimingFunctions;
      delayedFunctionScheduler = delayedFunctionSchedulerFactory();
      installed = true;

      return this;
    };

    /**
     * Uninstall the mock clock, returning the built-in methods to their places.
     * @name Clock#uninstall
     * @since 2.0.0
     * @function
     */
    this.uninstall = function() {
      // Ensure auto ticking loop is aborted when clock is uninstalled
      if (tickMode.mode === 'auto') {
        tickMode = { mode: 'manual', counter: tickMode.counter + 1 };
      }
      delayedFunctionScheduler = null;
      mockDate.uninstall();
      replace(global, realTimingFunctions);

      timer = realTimingFunctions;
      installed = false;
    };

    /**
     * Execute a function with a mocked Clock
     *
     * The clock will be {@link Clock#install|install}ed before the function is called and {@link Clock#uninstall|uninstall}ed in a `finally` after the function completes.
     * @name Clock#withMock
     * @since 2.3.0
     * @function
     * @param {Function} closure The function to be called.
     */
    this.withMock = function(closure) {
      this.install();
      try {
        closure();
      } finally {
        this.uninstall();
      }
    };

    /**
     * Instruct the installed Clock to also mock the date returned by `new Date()`
     * @name Clock#mockDate
     * @since 2.1.0
     * @function
     * @param {Date} [initialDate=now] The `Date` to provide.
     */
    this.mockDate = function(initialDate) {
      mockDate.install(initialDate);
    };

    this.setTimeout = function(fn, delay, params) {
      return Function.prototype.apply.apply(timer.setTimeout, [
        global,
        arguments
      ]);
    };

    this.setInterval = function(fn, delay, params) {
      return Function.prototype.apply.apply(timer.setInterval, [
        global,
        arguments
      ]);
    };

    this.clearTimeout = function(id) {
      return Function.prototype.call.apply(timer.clearTimeout, [global, id]);
    };

    this.clearInterval = function(id) {
      return Function.prototype.call.apply(timer.clearInterval, [global, id]);
    };

    /**
     * Tick the Clock forward, running any enqueued timeouts along the way
     * @name Clock#tick
     * @since 1.3.0
     * @function
     * @param {int} millis The number of milliseconds to tick.
     */
    this.tick = function(millis) {
      if (installed) {
        delayedFunctionScheduler.tick(millis, function(millis) {
          mockDate.tick(millis);
        });
      } else {
        throw new Error(
          'Mock clock is not installed, use jasmine.clock().install()'
        );
      }
    };

    /**
     * Updates the clock to automatically advance time.
     *
     * With this mode, the clock advances to the first scheduled timer and fires it, in a loop.
     * Between each timer, it will also break the event loop, allowing any scheduled promise
callbacks to execute _before_ running the next one.
     *
     * This mode allows tests to be authored in a way that does not need to be aware of the
     * mock clock. Consequently, tests which have been authored without a mock clock installed
     * can one with auto tick enabled without any other updates to the test logic.
     *
     * In many cases, this can greatly improve test execution speed because asynchronous tasks
     * will execute as quickly as possible rather than waiting real time to complete.
     *
     * Furthermore, tests can be authored in a consistent manner. They can always be written in an asynchronous style
     * rather than having `tick` sprinkled throughout the tests with mock time in order to manually
     * advance the clock.
     *
     * When auto tick is enabled, `tick` can still be used to synchronously advance the clock if necessary.
     * @name Clock#autoTick
     * @function
     * @since 5.7.0
     */
    this.autoTick = function() {
      if (tickMode.mode === 'auto') {
        return;
      }

      tickMode = { mode: 'auto', counter: tickMode.counter + 1 };
      advanceUntilModeChanges();
    };

    setTimeout[IsMockClockTimingFn] = true;
    clearTimeout[IsMockClockTimingFn] = true;
    setInterval[IsMockClockTimingFn] = true;
    clearInterval[IsMockClockTimingFn] = true;
    return this;

    // Advances the Clock's time until the mode changes.
    //
    // The time is advanced asynchronously, giving microtasks and events a chance
    // to run before each timer runs.
    //
    // @function
    // @return {!Promise<undefined>}
    async function advanceUntilModeChanges() {
      if (!installed) {
        throw new Error(
          'Mock clock is not installed, use jasmine.clock().install()'
        );
      }
      const { counter } = tickMode;

      while (true) {
        await newMacrotask();

        if (
          tickMode.counter !== counter ||
          !installed ||
          delayedFunctionScheduler === null
        ) {
          return;
        }

        if (!delayedFunctionScheduler.isEmpty()) {
          delayedFunctionScheduler.runNextQueuedFunction(function(millis) {
            mockDate.tick(millis);
          });
        }
      }
    }

    // Waits until a new macro task.
    //
    // Used with autoTick(), which is meant to act when the test is waiting, we need
    // to insert ourselves in the macro task queue.
    //
    // @return {!Promise<undefined>}
    async function newMacrotask() {
      if (NODE_JS) {
        // setImmediate is generally faster than setTimeout in Node
        // https://nodejs.org/en/learn/asynchronous-work/event-loop-timers-and-nexttick#setimmediate-vs-settimeout
        return new Promise(resolve => void setImmediate(resolve));
      }

      // MessageChannel ensures that setTimeout is not throttled to 4ms.
      // https://developer.mozilla.org/en-US/docs/Web/API/setTimeout#reasons_for_delays_longer_than_specified
      // https://stackblitz.com/edit/stackblitz-starters-qtlpcc
      // Note: This trick does not work in Safari, which will still throttle the setTimeout
      const channel = new MessageChannel();
      await new Promise(resolve => {
        channel.port1.onmessage = resolve;
        channel.port2.postMessage(undefined);
      });
      channel.port1.close();
      channel.port2.close();
      // setTimeout ensures that we interleave with other setTimeouts.
      await new Promise(resolve => {
        realTimingFunctions.setTimeout.call(global, resolve);
      });
    }

    function originalTimingFunctionsIntact() {
      return (
        global.setTimeout === realTimingFunctions.setTimeout &&
        global.clearTimeout === realTimingFunctions.clearTimeout &&
        global.setInterval === realTimingFunctions.setInterval &&
        global.clearInterval === realTimingFunctions.clearInterval
      );
    }

    function replace(dest, source) {
      for (const prop in source) {
        dest[prop] = source[prop];
      }
    }

    function setTimeout(fn, delay) {
      if (!NODE_JS) {
        return delayedFunctionScheduler.scheduleFunction(
          fn,
          delay,
          argSlice(arguments, 2)
        );
      }

      const timeout = new FakeTimeout();

      delayedFunctionScheduler.scheduleFunction(
        fn,
        delay,
        argSlice(arguments, 2),
        false,
        timeout
      );

      return timeout;
    }

    function clearTimeout(id) {
      return delayedFunctionScheduler.removeFunctionWithId(id);
    }

    function setInterval(fn, interval) {
      if (!NODE_JS) {
        return delayedFunctionScheduler.scheduleFunction(
          fn,
          interval,
          argSlice(arguments, 2),
          true
        );
      }

      const timeout = new FakeTimeout();

      delayedFunctionScheduler.scheduleFunction(
        fn,
        interval,
        argSlice(arguments, 2),
        true,
        timeout
      );

      return timeout;
    }

    function clearInterval(id) {
      return delayedFunctionScheduler.removeFunctionWithId(id);
    }

    function argSlice(argsObj, n) {
      return Array.prototype.slice.call(argsObj, n);
    }
  }

  /**
   * Mocks Node.js Timeout class
   */
  function FakeTimeout() {}

  FakeTimeout.prototype.ref = function() {
    return this;
  };

  FakeTimeout.prototype.unref = function() {
    return this;
  };

  Clock.IsMockClockTimingFn = IsMockClockTimingFn;
  return Clock;
};
