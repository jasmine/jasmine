(function(env) {
  env.requirePromises = function() {
    if (typeof Promise !== 'function') {
      env.pending('Environment does not support promises');
    }
  };
})(jasmine.getEnv());
