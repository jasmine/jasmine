/* eslint-disable compat/compat */
(function(env) {
  env.requireWeakSets = function() {
    if (typeof WeakSet === 'undefined') {
      env.pending('Browser does not have support for WeakSet');
    }
  };
})(jasmine.getEnv());
