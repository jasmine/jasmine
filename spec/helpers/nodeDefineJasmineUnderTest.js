(function() {
  var path = require('path'),
    fg = require('fast-glob');

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

    fg.sync(src_files).forEach(function(resolvedFile) {
      require(resolvedFile);
    });
  }

  getSourceFiles();
  global.jasmineUnderTest = jasmineUnderTestRequire.core(
    jasmineUnderTestRequire
  );
})();
