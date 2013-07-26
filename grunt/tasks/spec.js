var shell = require('shelljs');
var grunt = require('grunt');

module.exports = {
  execSpecsInNode: function() {
    if (shell.exec("node spec/node_suite.js --color=true").code !== 0) {
      grunt.fail.fatal("Specs Failed");
    }
  }
};
