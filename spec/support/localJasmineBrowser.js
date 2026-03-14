const path = require('path');
const jasmineBrowser = require('jasmine-browser-runner');
const jasmineCore = require('../../lib/jasmine-core.js');

const configFile = process.argv[2] || 'jasmine-browser.js';

const config = require(path.resolve('spec/support', configFile));
config.jasmineCore = jasmineCore;
config.batchReporter = true;

jasmineBrowser.startServer(config);
