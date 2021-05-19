(function(env) {
  env.skipBrowserFlake = function() {
    pending(
      'Skipping specs that are known to be flaky in browsers in this run'
    );
  };
})(jasmine.getEnv());
