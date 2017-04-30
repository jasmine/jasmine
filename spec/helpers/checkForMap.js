(function(env) {
  function hasFunctioningMaps() {
    if (typeof Map === 'undefined') { return false; }

    try {
      var s = new Map([['a', 4]]);
      if (s.size !== 1) { return false; }
      if (s.keys().next().value !== 'a') { return false; }
      if (s.values().next().value !== 4) { return false; }
      return true;
    } catch(e) {
      return false;
    }
  }

  env.requireFunctioningMaps = function() {
    if (!hasFunctioningMaps()) {
      env.pending("Browser has incomplete or missing support for Maps");
    }
  };

})(jasmine.getEnv());
