/* eslint-env node, es6 */
const path = require('path'),
  jasmineBrowser = require('jasmine-browser-runner'),
  jasmineCore = require('../../lib/jasmine-core');

var config = require(path.resolve('spec/support/jasmine-browser.js'));
config.clearReporters = true;
config.jasmineCore = jasmineCore;

jasmineBrowser.runSpecs(config);
