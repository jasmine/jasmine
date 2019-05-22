(function(env) {
  function getAsyncCtor() {
    try {
      eval('var func = async function(){};');
    } catch (e) {
      return null;
    }

    return Object.getPrototypeOf(func).constructor;
  }

  function hasAsyncAwaitSupport() {
    return getAsyncCtor() !== null;
  }

  env.makeAsyncAwaitFunction = function() {
    var AsyncFunction = getAsyncCtor();
    return new AsyncFunction('');
  };

  env.requireAsyncAwait = function() {
    if (!hasAsyncAwaitSupport()) {
      env.pending('Environment does not support async/await functions');
    }
  };
})(jasmine.getEnv());
