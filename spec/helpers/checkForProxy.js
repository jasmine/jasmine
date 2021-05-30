/* eslint-disable compat/compat */
(function(env) {
  function hasProxyConstructor() {
    try {
      new Proxy({}, {});
      return true;
    } catch (e) {
      return false;
    }
  }

  env.requireProxy = function() {
    if (!hasProxyConstructor()) {
      env.pending('Environment does not support Proxy');
    }
  };
})(jasmine.getEnv());
