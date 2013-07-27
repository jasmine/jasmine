var shell = require('shelljs');
var grunt = require('grunt');

module.exports = {
  execSpecsInNode: function() {
    var exit_code = shell.exec("node spec/node_suite.js --color=true").code;
    if (exit_code !== 0) {
      grunt.fail.fatal("Specs Failed", exit_code);
    }
  }
};
