(function(env) {
  function hasFunctioningSets() {
    if (typeof Set === 'undefined') { return false; }

    try {
      var s = new Set([4]);
      if (s.size !== 1) { return false; }
      if (s.values().next().value !== 4) { return false; }
      return true;
    } catch(e) {
      return false;
    }
  }

  env.requireFunctioningSets = function() {
    if (!hasFunctioningSets()) {
      env.pending("Browser has incomplete or missing support for Sets");
    }
  };

})(jasmine.getEnv());
