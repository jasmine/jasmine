var grunt = require("grunt");

function gemLib(path) { return './lib/jasmine-core/' + path; }
function nodeToRuby(version) { return version.replace('-', '.'); }

module.exports = {
  copyToGem: function() {
    var versionRb = grunt.template.process(
      grunt.file.read("grunt/templates/version.rb.jst"),
      { data: { jasmineVersion: nodeToRuby(global.jasmineVersion) }});

    grunt.file.write(gemLib("version.rb"), versionRb);
  }
};
