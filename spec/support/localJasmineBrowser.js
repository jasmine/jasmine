var path = require('path'),
  jasmineBrowser = require('jasmine-browser-runner'),
  jasmineCore = require('../../lib/jasmine-core.js');

var configFile = process.argv[2] || 'jasmine-browser.json';

var config = require(path.resolve('spec/support', configFile));
config.jasmineCore = jasmineCore;
config.batchReporter = true;

jasmineBrowser.startServer(config);
