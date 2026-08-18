(function() {
  'use strict';

  const isNode = typeof module !== 'undefined' && module.exports;
  const jasmineRequire = getJasmineRequireObj();

  function bootJasmine(options) {
    const core = jasmineRequire.core(jasmineRequire);
    const jasmine = core.jasmine;
    const private$ = core.private;
    const globals = {
      jasmine,
      ...jasmineRequire.interface(jasmine, jasmine.getEnv(options))
    };
    const installedDestinations = new Set();

    function installGlobals(dest) {
      dest = dest ?? globalThis;
      installedDestinations.add(dest);

      for (const [k, v] of Object.entries(globals)) {
        dest[k] = v;
      }
    }

    function reset() {
      private$.currentEnv_ = null;
      const env = jasmine.getEnv({ suppressLoadErrors: true });
      const jasmineInterface = jasmineRequire.interface(jasmine, env);

      for (const key of Object.keys(globals)) {
        if (key !== 'jasmine') {
          delete globals[key];
        }
      }
      Object.assign(globals, { jasmine, ...jasmineInterface });

      for (const dest of installedDestinations) {
        installGlobals(dest);
      }
    }

    return {
      jasmine,
      globals,
      version: jasmineRequire.version,
      installGlobals,
      reset
    };
  }

  if (isNode) {
    module.exports = bootJasmine({ suppressLoadErrors: true });
  } else {
    // Browser
    bootJasmine().installGlobals();
  }
})();
