getJasmineRequireObj().SpyStrategy = function() {

  function SpyStrategy(options) {
    options = options || {};

    var identity = options.name || 'unknown',
        originalFn = options.fn || function() {},
        getSpy = options.getSpy || function() {},
        plan = function() {};

    this.identity = function() {
      return identity;
    };

    this.exec = function() {
      return plan.apply(this, arguments);
    };

    this.callThrough = function() {
      plan = originalFn;
      return getSpy();
    };

    this.returnValue = function(value) {
      plan = function() {
        return value;
      };
      return getSpy();
    };

    this.returnValues = function() {
      var values = Array.prototype.slice.call(arguments);
      plan = function () {
        return values.shift();
      };
      return getSpy();
    };

    this.throwError = function(something) {
      var error = (something instanceof Error) ? something : new Error(something);
      plan = function() {
        throw error;
      };
      return getSpy();
    };

    this.callFake = function(fn) {
      plan = fn;
      return getSpy();
    };

    this.stub = function(fn) {
      plan = function() {};
      return getSpy();
    };
  }

  return SpyStrategy;
};
