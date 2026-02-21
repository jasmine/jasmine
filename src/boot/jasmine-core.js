'use strict';

const path = require('path');
const fs = require('fs');
const {
  globals,
  installGlobals,
  version,
  private$
} = require('./jasmine-core/jasmine.js');

function reset() {
  private$.currentEnv_ = null;
  const env = jasmine.getEnv({ suppressLoadErrors: true });
  rebindInterface(env);
}

const rootPath = path.join(__dirname, 'jasmine-core'),
  bootFiles = ['boot.js'],
  cssFiles = [],
  jsFiles = [],
  jsFilesToSkip = ['jasmine.js'].concat(bootFiles);

fs.readdirSync(rootPath).forEach(function(file) {
  if (fs.statSync(path.join(rootPath, file)).isFile()) {
    switch (path.extname(file)) {
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

/**
 * Note: Only available on Node.
 *
 * In addition to the members documented here, this module's exports include all
 * {@link globals}.
 * @module jasmine-core
 */
module.exports = {
  ...globals,
  /**
   * Copies Jasmine globals (jasmine, describe, it, etc) to the specified
   * object or to globalThis.
   * @function
   * @param {object} [dest] - The object to copy globals to.
   */
  installGlobals,
  /**
   * Returns the jasmine-core version.
   * @function
   */
  version,
  /**
   * Resets all of jasmine-core's state, including removing specs, suites, and
   * reporters, and resetting configuration to the default.
   * @function
   */
  reset,
  files: {
    self: __filename,
    path: rootPath,
    bootDir: rootPath,
    bootFiles: bootFiles,
    cssFiles: cssFiles,
    jsFiles: ['jasmine.js'].concat(jsFiles),
    imagesDir: path.join(__dirname, '../images')
  }
};
