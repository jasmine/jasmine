getJasmineRequireObj().Timer = function() {
  const defaultNow = (function(Date) {
    return function() {
      return new Date().getTime();
    };
  })(Date);

  /**
   * @class Timer
   * @classdesc Tracks elapsed time
   * @example
   * const timer = new jasmine.Timer();
   * timer.start();
   * const elapsed = timer.elapsed()
   */
  function Timer(options) {
    options = options || {};

    const now = options.now || defaultNow;
    let startTime;

    /**
     * Starts the timer.
     * @function
     * @name Timer#start
     */
    this.start = function() {
      startTime = now();
    };

    /**
     * Determines the time since the timer was started.
     * @function
     * @name Timer#elapsed
     * @returns {number} Elapsed time in milliseconds, or NaN if the timer has not been started
     */
    this.elapsed = function() {
      return now() - startTime;
    };
  }

  return Timer;
};
