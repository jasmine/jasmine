const path = require("path"),
      fs = require('fs'),
      util = require('util'),
      jasmineBrowser = require('jasmine-browser-runner'),
      ConsoleReporter = require('jasmine').ConsoleReporter,
      jasmineCore = require('../../lib/jasmine-core'),
      useSauce = process.env.USE_SAUCE === 'true';

var config = require(path.resolve('spec/support/jasmine-browser.json'));
config.jasmineCore = jasmineCore;

function buildWebdriver() {
  const webdriver = require("selenium-webdriver"),
    Capability = webdriver.Capability;
  if (useSauce) {
    const username = process.env['SAUCE_USERNAME'],
      accessKey = process.env['SAUCE_ACCESS_KEY'];
    return new webdriver.Builder()
      .withCapabilities({
        name: `jasmine-core ${new Date().toISOString()}`,
        [Capability.PLATFORM]: process.env['SAUCE_OS'],
        [Capability.BROWSER_NAME]: process.env['JASMINE_BROWSER'],
        [Capability.VERSION]: process.env['SAUCE_BROWSER_VERSION'],
        build: `Core ${process.env['TRAVIS_BUILD_NUMBER'] || 'Ran locally'}`,
        tags: ['Jasmine-Core'],
        "tunnel-identifier": process.env['TRAVIS_JOB_NUMBER'] ? process.env['TRAVIS_JOB_NUMBER'].toString() : null
      })
      .usingServer(`http://${username}:${accessKey}@localhost:4445/wd/hub`)
      .build();
  } else {
    return new webdriver.Builder()
      .forBrowser(process.env["JASMINE_BROWSER"] || "firefox")
      .build();
  }
}

const driver = buildWebdriver();
jasmineBrowser.runSpecs(config, driver).then(function(runDetails) {
  process.exitCode = runDetails.overallStatus === 'passed' ? 0 : 1;

  if (useSauce) {
    driver.executeScript(`sauce:job-result=${process.exitCode === 0}`);
  }
}).catch(error => {
  console.error(error);
}).then(function () {
  return driver ? driver.close() : true;
});
