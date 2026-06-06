(function() {
  const path = require('path');
  const glob = require('glob');

  const jasmineUnderTestRequire = require(path.join(
    __dirname,
    '../../src/core/requireCore.js'
  ));

  // Individual source files call getJasmineRequireObj. It's normally defined
  // by requireCore.js which is concatenated into jasmine.js before other source
  // files. Since we're bypassing that mechanism, we need to provide our own.
  global.getJasmineRequireObj = function() {
    return jasmineUnderTestRequire;
  };

  const srcFiles = [
    ...glob.sync('../../src/core/**/*.js', {
      ignore: '../../src/core/requireSuffix.js',
      cwd: __dirname
    }),
    '../../src/version.js',
    '../../src/core/requireCore.js'
  ];

  for (const file of srcFiles) {
    require(file);
  }

  delete global.getJasmineRequireObj;

  const built = jasmineUnderTestRequire.core(jasmineUnderTestRequire);
  global.jasmineUnderTest = built.jasmine;
  global.privateUnderTest = built.private;
})();
