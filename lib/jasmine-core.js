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

/**
 * Note: Only available on Node.
 * @module jasmine-core
 */

const jasmineRequire = require('./jasmine-core/jasmine.js');
module.exports = jasmineRequire;

const bootWithoutGlobals = (function() {
  let jasmine, jasmineInterface;

  return function bootWithoutGlobals(reinitialize) {
    if (!jasmineInterface || reinitialize === true) {
      jasmine = jasmineRequire.core(jasmineRequire);
      const env = jasmine.getEnv({ suppressLoadErrors: true });
      jasmineInterface = jasmineRequire.interface(jasmine, env);
    }

    return { jasmine, jasmineInterface };
  };
})();

/**
 * Boots a copy of Jasmine and returns an object as described in {@link jasmine}.
 * @param {boolean} [reinitialize=true] Whether to create a new copy of Jasmine if one already exists
 * @type {function}
 * @return {jasmine}
 */
module.exports.boot = function(reinitialize) {
  if (reinitialize === undefined) {
    reinitialize = true;
  }

  const { jasmine, jasmineInterface } = bootWithoutGlobals(reinitialize);

  for (const k in jasmineInterface) {
    global[k] = jasmineInterface[k];
  }

  return jasmine;
};

/**
 * Boots a copy of Jasmine and returns an object containing the properties
 * that would normally be added to the global object. If noGlobals is called
 * multiple times, the same object is returned every time.
 *
 * @example
 * const {describe, beforeEach, it, expect, jasmine} = require('jasmine-core').noGlobals();
 */
module.exports.noGlobals = function() {
  const { jasmineInterface } = bootWithoutGlobals(false);
  return jasmineInterface;
};

const path = require('path'),
  fs = require('fs');

const rootPath = path.join(__dirname, 'jasmine-core'),
  bootFiles = ['boot0.js', 'boot1.js'],
  legacyBootFiles = ['boot.js'],
  cssFiles = [],
  jsFiles = [],
  jsFilesToSkip = ['jasmine.js'].concat(bootFiles, legacyBootFiles);

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

module.exports.files = {
  self: __filename,
  path: rootPath,
  bootDir: rootPath,
  bootFiles: bootFiles,
  cssFiles: cssFiles,
  jsFiles: ['jasmine.js'].concat(jsFiles),
  imagesDir: path.join(__dirname, '../images')
};
