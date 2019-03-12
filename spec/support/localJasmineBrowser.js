var path = require('path'),
  jasmineBrowser = require('jasmine-browser-runner'),
  jasmineCore = require('../../lib/jasmine-core.js');

var config = require(path.resolve('spec/support/jasmine-browser.json'));
config.jasmineCore = jasmineCore;

jasmineBrowser.startServer(config);
