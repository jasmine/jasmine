(function(env) {
  function hasFunctioningTypedArrays() {
    if (typeof Uint32Array === 'undefined') { return false; }

    try {
      var a = new Uint32Array([1, 2, 3]);
      return a.length === 3;

    } catch(e) {
      return false;
    }
  }

  env.requireFunctioningTypedArrays = function() {
    if (!hasFunctioningTypedArrays()) {
      env.pending("Browser has incomplete or missing support for typed arrays");
    }
  };
  
})(jasmine.getEnv());
