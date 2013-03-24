var shell = require('shelljs');

module.exports = {
  execSpecsInNode: function() {
    shell.exec("node spec/node_suite.js --color=true")
  }
};