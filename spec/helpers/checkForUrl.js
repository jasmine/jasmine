/* eslint-disable compat/compat */
(function(env) {
  function hasUrlConstructor() {
    try {
      new URL('http://localhost/');
      return true;
    } catch (e) {
      return false;
    }
  }

  env.requireUrls = function() {
    if (!hasUrlConstructor()) {
      env.pending('Environment does not support URLs');
    }
  };
})(jasmine.getEnv());
