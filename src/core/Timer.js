getJasmineRequireObj().Timer = function() {
  function Timer(options) {
    options = options || {};

    var now = options.now || function() { return new Date().getTime(); },
        startTime;

    this.start = function() {
      startTime = now();
    };

    this.elapsed = function() {
      return now() - startTime;
    };
  }

  return Timer;
};
