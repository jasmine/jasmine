const path = require("path"),
      fs = require('fs'),
      port = 5555,
      colors = {
        "passed" : "\x1B[32m",
        "failed": "\x1B[31m",
        "pending": "\x1B[33m",
        "excluded": "\x1B[0m",
        "none": "\x1B[0m"
      },
      symbols = {
        "passed" : ".",
        "failed": "F",
        "pending": "*",
        "excluded": "",
        "none": ""
      },
      host = `http://localhost:${port}`,
      useSauce = process.env.USE_SAUCE === 'true';
let driver, server;

function pageGenerator() {
  const ejs = require("ejs"),
    fg = require("fast-glob"),
    templatePath = path.resolve(__dirname, 'spec/support/index.html.ejs'),
    template = ejs.compile(fs.readFileSync(templatePath).toString()),
    patterns = [
      "lib/jasmine-core/jasmine.js",
      "lib/jasmine-core/json2.js",
      "lib/jasmine-core/jasmine-html.js",
      "lib/jasmine-core/boot.js",
      "src/core/requireCore.js",
      "src/core/base.js",
      "src/core/util.js",
      "src/core/Spec.js",
      "src/core/Env.js",
      "src/**/*.js",
      "spec/helpers/*.js",
      "spec/**/*[Ss]pec.js"
    ],
    ignore = [
      "spec/helpers/nodeDefineJasmineUnderTest.js",
      "spec/npmPackage/**/*",
      "lib/jasmine-core/node_boot.js"
    ];

  return function toHtml() {
    const files = fg.sync(patterns, {ignore});
    return template({files});
  }
}

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

async function resultsWithoutCircularReferences(driver, resultType, index, batchSize) {
  return await driver.executeScript(
    `var results = jsApiReporter.${resultType}Results(${index}, ${batchSize});\n` +
    'for (var i = 0; i < results.length; i++) {\n' +
      'var expectations = results[i].failedExpectations;\n' +
      'if (results[i].passedExpectations) {\n' +
        'expectations = expectations.concat(results[i].passedExpectations);\n' +
      '}\n' +
      'for (var j = 0; j < expectations.length; j++) {\n' +
        'var expectation = expectations[j];\n' +
        "try { JSON.stringify(expectation.expected); } catch (e) { expectation.expected = '<circular expected>'; }\n" +
        "try { JSON.stringify(expectation.actual); } catch (e) { expectation.actual = '<circular actual>'; }\n" +
      '}\n' +
    '}\n' +
    'return results;'
  );
}

function flatten(arr) {
  return Array.prototype.concat.apply([], arr);
}

async function getResults(driver) {
  const batchSize = 50,
    specResults = [],
    failedSuiteResults = [];
  let index = 0,
    slice = [];

  do {
    slice = await resultsWithoutCircularReferences(driver, 'spec', index, batchSize);
    specResults.push(slice);
    index += batchSize;
  } while (slice.length === batchSize);

  index = 0;
  do {
    slice = await resultsWithoutCircularReferences(driver, 'suite', index, batchSize);
    failedSuiteResults.push(slice.filter(function(suite) { return suite.status === 'failed' }));
    index += batchSize;
  } while (slice.length === batchSize);

  return {specResults: flatten(specResults), failedSuiteResults: flatten(failedSuiteResults)};
}

(async function () {
  await new Promise(resolve => {
    console.log("Creating an express app for browers to run the tests...")
    const express = require("express"),
          app = express(),
          html = pageGenerator();

    app.use(express.static(__dirname));
    app.get("/", (req, res) => res.send(html()));
    server = app.listen(port, resolve);
  });


  console.log("Running the tests in browser...")
  driver = buildWebdriver();
  await driver.get(`${host}/?throwFailures=false&failFast=false&random=true`)
  await new Promise(resolve => {
    const intervalId = setInterval(async () => {
      const isFinished = await driver.executeScript("return jsApiReporter && jsApiReporter.finished")
      if (isFinished) {
        clearInterval(intervalId)
        resolve();
      }
    }, 500)
  });

  const {specResults, failedSuiteResults} = await getResults(driver);
  console.log(specResults.map(spec => `${colors[spec.status]}${symbols[spec.status]}`).join("") + colors["none"]);

  const result = specResults.reduce((result, spec) => {
    result[spec.status] = [...result[spec.status], spec];
    return result;
  }, {pending: [], failed: [], passed: [], excluded: []});

  if (result.pending.length) {
    console.log(`${colors["pending"]}Pending:`);
    result.pending.forEach((spec, index) => {
      console.log(`${colors["none"]}${index}) ${spec.fullName}`)
      console.group();
      console.log(`${colors["pending"]}${spec.pendingReason || "no reason given"}`);
      console.groupEnd();
      console.log();
    });
  }

  if (result.failed.length) {
    console.log(`${colors["failed"]}Failed:`);
    result["failed"].forEach((spec, index) => {
      console.log(`${colors["none"]}${index}) ${spec.fullName}`)
      console.group();
      spec.failedExpectations.forEach((expect) => {
        console.log(`${colors["none"]}Message:`);
        console.group();
        console.log(`${colors["failed"]}${expect.message}`);
        console.groupEnd();
        console.log(`${colors["none"]}Stack:`);
        console.group();
        console.log(`${colors["failed"]}${expect.stack}`);
        console.groupEnd();
        console.groupEnd();
      })
      console.groupEnd();
      console.log();
    });
  }

  const details = await driver.executeScript(`
      return {
        overallStatus: jsApiReporter.runDetails.overallStatus,
        executionTime: jsApiReporter.executionTime(),
        random: jsApiReporter.runDetails.order.random,
        seed: jsApiReporter.runDetails.order.seed
      }`);

  console.log(`${colors["none"]}${specResults.length} spec(s), ${result.failed.length} failure(s), ${result.pending.length} pending spec(s)`);
  console.log(`Finished in ${details.executionTime / 1000} second(s)`);
  console.log(`Randomized with seed ${details.seed} ( ${host}/?random=${details.random}&seed=${details.seed} )`);
  process.exitCode = details.overallStatus === 'passed' ? 0 : 1;

  if (useSauce) {
    driver.executeScript(`sauce:job-result=${process.exitCode === 0}`);
  }
})().finally(() => {
  return Promise.all([driver.close(), new Promise(resolve => server.close(resolve))]);
});

