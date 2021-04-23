/* eslint-disable compat/compat */
(function(env) {
  env.requireWeakMaps = function() {
    if (typeof WeakMap === 'undefined') {
      env.pending('Browser does not have support for WeakMap');
    }
  };
})(jasmine.getEnv());
