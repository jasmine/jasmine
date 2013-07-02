getJasmineRequireObj().SpyRegistry = function() {

  function SpyRegistry() {
    var registry = {};

    this.register = function(standin, options) {
      registry[standin] = options;
    };

    this.lookupDelegate = function(standin) {
      return (registry[standin] || {}).delegate;
    };

    this.lookupBaseObj = function(standin) {
      return (registry[standin] || {}).baseObj;
    };

    this.reset = function() {
      registry = {};
    };
  }

  return SpyRegistry;
};