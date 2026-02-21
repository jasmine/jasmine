/*
Copyright (c) 2008-2019 Pivotal Labs
Copyright (c) 2008-2026 The Jasmine developers

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
"Software"), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/

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
