getJasmineRequireObj().Timer = function() {
  const defaultNow = (function(Date) {
    return function() {
      return new Date().getTime();
    };
  })(Date);

  function Timer(options) {
    options = options || {};

    const now = options.now || defaultNow;
    let startTime;

    this.start = function() {
      startTime = now();
    };

    this.elapsed = function() {
      return now() - startTime;
    };
  }

  return Timer;
};
