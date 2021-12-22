(function() {
  var path = require('path'),
    glob = require('glob');

  var jasmineUnderTestRequire = require(path.join(
    __dirname,
    '../../src/core/requireCore.js'
  ));

  global.getJasmineRequireObj = function() {
    return jasmineUnderTestRequire;
  };

  function getSourceFiles() {
    var src_files = ['core/**/*.js', 'version.js'].map(function(file) {
      return path.join(__dirname, '../../', 'src/', file);
    });

    const files = src_files.flatMap(g => glob.sync(g));
    files.forEach(function(resolvedFile) {
      require(resolvedFile);
    });
  }

  getSourceFiles();
  global.jasmineUnderTest = jasmineUnderTestRequire.core(
    jasmineUnderTestRequire
  );
})();
