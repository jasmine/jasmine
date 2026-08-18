(function() {
  'use strict';

  const isNode = typeof module !== 'undefined' && module.exports;
  const jasmineRequire = getJasmineRequireObj();

  function bootJasmine(options) {
    const { jasmine, private: private$ } = jasmineRequire.core(jasmineRequire);
    const env = jasmine.getEnv(options);
    const jasmineInterface = jasmineRequire.interface(jasmine, env);
    const globals = {
      jasmine,
      ...jasmineInterface.members
    };

    function reset() {
      private$.currentEnv_ = null;
      jasmine.getEnv({ suppressLoadErrors: true });
      jasmineInterface.rebindEnv(private$.currentEnv_);
    }

    return {
      jasmine,
      globals,
      version: jasmineRequire.version,
      installGlobals(dest) {
        dest = dest ?? globalThis;

        for (const [k, v] of Object.entries(globals)) {
          dest[k] = v;
        }
      },
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
