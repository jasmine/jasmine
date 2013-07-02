getJasmineRequireObj().SpyRegistry = function() {

  function SpyRegistry() {
    var registry = {};

    this.register = function(standin, delegate) {
      registry[standin] = delegate;
    };

    this.lookup = function(standin) {
      return registry[standin];
    };

    this.reset = function() {
      registry = {};
    };
  }

  return SpyRegistry;
};