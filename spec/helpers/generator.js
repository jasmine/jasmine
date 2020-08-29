(function(env) {
  function getGeneratorFuncCtor() {
    try {
      eval('var func = function*() {}');
    } catch (e) {
      return null;
    }

    return Object.getPrototypeOf(func).constructor;
  }

  env.makeGeneratorFunction = function(text) {
    var GeneratorFunction = getGeneratorFuncCtor();
    return new GeneratorFunction(text || '');
  };

  env.requireGeneratorFunctions = function() {
    if (!getGeneratorFuncCtor()) {
      env.pending('Environment does not support generator functions');
    }
  };
})(jasmine.getEnv());
