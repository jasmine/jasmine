(function(env) {
  env.requirePromises = function() {
    if (typeof Promise !== 'function') {
      env.pending('Environment does not support promises');
    }
  };

  env.requireNoPromises = function() {
    if (typeof Promise === 'function') {
      env.pending('Environment supports promises');
    }
  };
})(jasmine.getEnv());
