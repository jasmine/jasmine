getJasmineRequireObj().Timer = function() {
  var defaultNow = (function(Date) {
    return function() { return new Date().getTime(); };
  })(Date);

  function Timer(options) {
    options = options || {};

    var now = options.now || defaultNow,
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
