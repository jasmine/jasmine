module.exports = require("./jasmine-core/jasmine.js");
module.exports.boot = require('./jasmine-core/node_boot.js');

module.exports.files = (function() {
  var path = require('path'),
      fs = require('fs'),
      glob = require('glob');

  var rootPath = path.join(__dirname, "jasmine-core"),
      bootFiles = ['boot.js'],
      nodeBootFiles = ['node_boot.js'];

  var cssFiles = glob.sync(path.join(rootPath, '*.css')).map(path.basename);
  var jsFiles = glob.sync(path.join(rootPath, '*.js')).map(path.basename);

  ['jasmine.js'].concat(bootFiles, nodeBootFiles).forEach(function(file) {
    jsFiles.splice(jsFiles.indexOf(file), 1);
  });

  return {
    path: rootPath,
    bootDir: rootPath,
    bootFiles: bootFiles,
    nodeBootFiles: nodeBootFiles,
    cssFiles: cssFiles,
    jsFiles: ['jasmine.js'].concat(jsFiles),
    imagesDir: path.join(__dirname, '../images')
  };
}());
