const path = require('path');
const jasmineBrowser = require('jasmine-browser-runner');
const jasmineCore = require('../../lib/jasmine-core');

const config = require(path.resolve('spec/support/jasmine-browser.js'));
config.clearReporters = true;
config.jasmineCore = jasmineCore;

jasmineBrowser.runSpecs(config).catch(function(error) {
  // eslint-disable-next-line no-console
  console.error(error);
  process.exit(1);
});
