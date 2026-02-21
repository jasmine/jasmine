(function() {
  'use strict';

  const isNode = typeof module !== 'undefined' && module.exports;
  const jasmineRequire = getJasmineRequireObj();

  function bootJasmine(options) {
    const jasmine = jasmineRequire.core(jasmineRequire).jasmine;
    const env = jasmine.getEnv(options);
    const jasmineInterface = jasmineRequire.interface(jasmine, env);
    const globals = {
      jasmine,
      ...jasmineInterface
    };

    return {
      jasmine,
      globals,
      version: jasmineRequire.version,
      installGlobals(dest) {
        dest = dest ?? globalThis;

        for (const [k, v] of Object.entries(globals)) {
          dest[k] = v;
        }
      }
    };
  }

  if (isNode) {
    module.exports = bootJasmine({ suppressLoadErrors: true });
  } else {
    // Browser
    bootJasmine().installGlobals();
  }
})();
