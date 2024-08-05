(function() {
  const path = require('path'),
    glob = require('glob');

  const jasmineUnderTestRequire = require(path.join(
    __dirname,
    '../../src/core/requireCore.js'
  ));

  global.getJasmineRequireObj = function() {
    return jasmineUnderTestRequire;
  };

  function getSourceFiles() {
    const globs = ['../../src/core/**/*.js', '../../src/version.js'];
    const srcFiles = globs.flatMap(g => glob.sync(g, { cwd: __dirname }));

    for (const file of srcFiles) {
      require(file);
    }
  }

  getSourceFiles();
  global.jasmineUnderTest = jasmineUnderTestRequire.core(
    jasmineUnderTestRequire
  );
})();
