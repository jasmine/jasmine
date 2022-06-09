/**
 * Note: Only available on Node.
 * @module jasmine-core
 */

const jasmineRequire = require('./jasmine-core/jasmine.js');
module.exports = jasmineRequire;

/**
 * Boots a copy of Jasmine and returns an object as described in {@link jasmine}.
 * @type {function}
 * @return {jasmine}
 */
module.exports.boot = require('./jasmine-core/node_boot.js');

/**
 * Boots a copy of Jasmine and returns an object containing the properties
 * that would normally be added to the global object. If noGlobals is called
 * multiple times, the same object is returned every time.
 *
 * Do not call boot() if you also call noGlobals().
 *
 * @example
 * const {describe, beforeEach, it, expect, jasmine} = require('jasmine-core').noGlobals();
 */
module.exports.noGlobals = (function() {
  let jasmineInterface;

  return function bootWithoutGlobals() {
    if (!jasmineInterface) {
      const jasmine = jasmineRequire.core(jasmineRequire);
      const env = jasmine.getEnv({ suppressLoadErrors: true });
      jasmineInterface = jasmineRequire.interface(jasmine, env);
    }

    return jasmineInterface;
  };
}());

const path = require('path'),
  fs = require('fs');

const rootPath = path.join(__dirname, 'jasmine-core'),
  bootFiles = ['boot0.js', 'boot1.js'],
  legacyBootFiles = ['boot.js'],
  nodeBootFiles = ['node_boot.js'],
  cssFiles = [],
  jsFiles = [],
  jsFilesToSkip = ['jasmine.js'].concat(bootFiles, legacyBootFiles, nodeBootFiles);

fs.readdirSync(rootPath).forEach(function(file) {
  if(fs.statSync(path.join(rootPath, file)).isFile()) {
    switch(path.extname(file)) {
      case '.css':
        cssFiles.push(file);
      break;
      case '.js':
        if (jsFilesToSkip.indexOf(file) < 0) {
        jsFiles.push(file);
      }
      break;
    }
  }
});

module.exports.files = {
  path: rootPath,
  bootDir: rootPath,
  bootFiles: bootFiles,
  nodeBootFiles: nodeBootFiles,
  cssFiles: cssFiles,
  jsFiles: ['jasmine.js'].concat(jsFiles),
  imagesDir: path.join(__dirname, '../images')
};
