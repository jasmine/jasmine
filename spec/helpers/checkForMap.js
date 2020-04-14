(function(env) {
  env.hasFunctioningMaps = function() {
    if (typeof Map === 'undefined') {
      return false;
    }

    try {
      var s = new Map();
      s.set('a', 1);
      s.set('b', 2);

      if (s.size !== 2) {
        return false;
      }
      if (s.has('a') !== true) {
        return false;
      }

      var iterations = 0;
      var ifForEachWorking = true;
      s.forEach(function(value, key, map) {
        ifForEachWorking = ifForEachWorking && map === s;
        if (key === 'a') {
          ifForEachWorking = ifForEachWorking && value === 1;
        }
        iterations++;
      });
      if (iterations !== 2) {
        return false;
      }
      if (ifForEachWorking !== true) {
        return false;
      }

      return true;
    } catch (e) {
      return false;
    }
  };

  env.requireFunctioningMaps = function() {
    if (!env.hasFunctioningMaps()) {
      env.pending('Browser has incomplete or missing support for Maps');
    }
  };

  env.requireWeakMaps = function() {
    if (typeof WeakMap === 'undefined') {
      env.pending('Browser does not have support for WeakMap');
    }
  };
})(jasmine.getEnv());
