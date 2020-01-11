(function(env) {
  var NODE_JS =
    typeof process !== 'undefined' &&
    process.versions &&
    typeof process.versions.node === 'string';

  env.requireFastCheck = function() {
    if (!NODE_JS) {
      env.pending(
        "Property tests don't run in the browser. Use `npm test` to run them."
      );
    }

    return require('fast-check');
  };
})(jasmine.getEnv());
