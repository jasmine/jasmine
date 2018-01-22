(function(env) {
  function hasFunctioningSymbols() {
    if (typeof Symbol === 'undefined') {
      return false;
    }

    try {
      var s1 = Symbol();
      var s2 = Symbol();
      if (typeof s1 !== 'symbol') {
        return false;
      }
      if (s1 === s2) {
        return false;
      }
      return true;
    } catch (e) {
      return false;
    }
  }

  env.requireFunctioningSymbols = function() {
    if (!hasFunctioningSymbols()) {
      env.pending("Browser has incomplete or missing support for Symbols");
    }
  };

})(jasmine.getEnv());
