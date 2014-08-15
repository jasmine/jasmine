module.exports = function(jasmineRequire) {
  var jasmine = jasmineRequire.core(jasmineRequire);

  var consoleFns = require('../console/console.js');
  consoleFns.console(consoleFns, jasmine);

  var env = jasmine.getEnv();

  var jasmineInterface = jasmineRequire.interface(jasmine, env);

  extend(global, jasmineInterface);

  function extend(destination, source) {
    for (var property in source) destination[property] = source[property];
    return destination;
  }

  return jasmine;
};
