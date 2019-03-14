const path = require("path"),
      port = 3000,
      colors = {
        "passed" : "\x1B[32m",
        "failed": "\x1B[31m",
        "pending": "\x1B[33m",
        "none": "\x1B[0m"
      };
      symbols = {
        "passed" : ".",
        "failed": "F",
        "pending": "*",
        "none": ""
      },
      host = `http://localhost:${port}`,
      exitCode = 0;

(async () => {
  const html = await (() => {
    console.log("Generating index.html for express app...");
    const pug = require("pug"),
          fg = require("fast-glob"),
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
          files = fg.sync(patterns, {ignore});
      return Promise.resolve(pug.compileFile(path.resolve(__dirname, "index.pug"), { pretty: true })({files}));
  })();

  await (() => new Promise(resolve => {
    console.log("Creating an express app for browers to run the tests...")
    const express = require("express"),
          app = express();

    app.use(express.static(__dirname));
    app.get("/", (req, res) => res.send(html));
    app.listen(port, resolve);
  }))();

  const driver = await (() => new Promise(resolve => (async () => {
    console.log("Running the tests in browser...")
    const webdriver = require("selenium-webdriver"),
          driver = new webdriver.Builder()
                    .forBrowser(process.env["JASMINE_BROWSER"] || "firefox")
                    .build();

    await driver.get(`${host}/?throwFailures=false&failFast=false&random=true`)
    const intervalId = setInterval(async () => {
      const isFinished = await driver.executeScript("return jsApiReporter && jsApiReporter.finished")
      if (isFinished) {
        clearInterval(intervalId)
        resolve(driver)
      }
    }, 500)
  })()))();

  await (() => new Promise(resolve => (async () => {
    // output the summary
    (await driver.executeScript("return jsApiReporter && jsApiReporter.specs().map(spec => spec.status)"))
      .map(status => `${colors[status]}${symbols[status]}`).join("") + colors["none"];
    resolve();
  })()))();

  await (() => new Promise(resolve => (async () => {
    // output the pending and failure details
    const result = (await driver.executeScript("return jsApiReporter && jsApiReporter.specs().filter(spec => spec.status !== \"passed\")"))
      .reduce((result, spec) => {
        result[spec.status] = result[spec.status] || [];
        result[spec.status] = [...result[spec.status], spec];
        return result;
      }, {});
    
    if ((result["pending"] || []).length) { 
      console.log(`${colors["pending"]}Pending:`);
      result["pending"].forEach((spec, index) => {
        console.log(`${colors["none"]}${index}) ${spec.fullName}`)
        console.group();
          console.log(`${colors["pending"]}${spec.pendingReason || "no reason given"}`);
        console.groupEnd();
        console.log();
      });
    }

    if ((result["failed"] || []).length) {
      exitCode = 1
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
     
    resolve();
  })()))();

  await (() => new Promise(resolve => (async () => {
    const result = await driver.executeScript(`
      return {
        executionTime: jsApiReporter.executionTime(),
        random: jsApiReporter.runDetails.order.random,
        seed: jsApiReporter.runDetails.order.seed,
        specCount: jsApiReporter.specs().length,
        failureCount: jsApiReporter.specs().filter(spec => spec.status === \"failed\").length,
        pendingCount: jsApiReporter.specs().filter(spec => spec.status === \"pending\").length
      }`);
      
    if (result.specCount > 0) {
      console.log(`${colors["none"]}${result.specCount} spec(s), ${result.failureCount} failure(s), ${result.pendingCount} pending spec(s)`);
      console.log(`Finished in ${result.executionTime / 1000} second(s)`);
      console.log(`Randomized with seed ${result.seed} ( ${host}/?random=${result.random}&seed=${result.seed} )`);
    } else {
      console.log(`No specs found`)
    }

    resolve();
  })()))();

  await driver.close();
  process.exit(exitCode);
})()

