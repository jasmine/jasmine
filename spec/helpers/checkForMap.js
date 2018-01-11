(function(env) {
  function hasFunctioningMaps() {
    if (typeof Map === 'undefined') { return false; }

    try {
			var s = new Map();
			s.set('a',1);
			s.set('b',2);

			// Check for `size`
			if (s.size !== 2) { return false; }
			
			// Check for `has`
			if (s.has('a') !== true) { return false; }

			// Check for `delete`
			if (s.delete('b') !== true) { return false; }

			// Check for `forEach`
			var iterations = 0;
			var ifForEachWorking = true;
			s.forEach( function( value, key, map ) {
				ifForEachWorking = ifForEachWorking && map === s;
				if( key==='a') {
					ifForEachWorking = ifForEachWorking && value===1;
				}
				iterations++;
			} );
			if (iterations !== 1) { return false; }
			if (ifForEachWorking !== true) { return false; }

			// Check for `clear`
			s.clear()
			if (s.size !== 0) { return false; }

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
