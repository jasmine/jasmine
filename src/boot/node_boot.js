module.exports = function(jasmineRequire) {
  const jasmine = jasmineRequire.core(jasmineRequire);

  const env = jasmine.getEnv({ suppressLoadErrors: true });

  const jasmineInterface = jasmineRequire.interface(jasmine, env);

  extend(global, jasmineInterface);

  function extend(destination, source) {
    for (const property in source) destination[property] = source[property];
    return destination;
  }

  return jasmine;
};
