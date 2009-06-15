var createElement = function(tag, attrs) {
  var element = document.createElement(tag);
  for (var attr in attrs) {
    element[attr] = attrs[attr];
  }
  return element;
};

// Bootstrap Test Reporter function
var Reporter = function () {
  this.total = 0;
  this.passes = 0;
  this.fails = 0;
  this.start = new Date();
};

Reporter.prototype.toJSON = function(object) {
  return JSON.stringify(object);
};

Reporter.prototype.test = function (result, message) {
  this.total++;

  if (result) {
    this.passes++;
    iconElement = document.getElementById('icons');
    iconElement.appendChild(createElement('img', {src: '../images/go-16.png'}));
  }
  else {
    this.fails++;
    var fails_report = document.getElementById('fails');
    fails_report.style.display = "";

    var iconElement = document.getElementById('icons');
    iconElement.appendChild(createElement('img', {src: '../images/fail-16.png'}));

    var failMessages = document.getElementById('fail_messages');
    var newFail = createElement('p', {'class': 'fail'});
    newFail.innerHTML = message;
    failMessages.appendChild(newFail);
  }
};

Reporter.prototype.summary = function () {
  var el = createElement('p', {'class': ((this.fails > 0) ? 'fail_in_summary' : '') });
  el.innerHTML = this.total + ' expectations, ' + this.passes + ' passing, ' + this.fails + ' failed in ' + (new Date().getTime() - this.start.getTime()) + "ms.";

  var summaryElement = document.getElementById('results_summary');
  summaryElement.appendChild(el);
  summaryElement.style.display = "";
};


var reporter = new Reporter();

function runSuite(filename) {
  var suite = jasmine.include(filename);
  suite.execute();
  emitSuiteResults(filename, suite);
}

function emitSpecResults(testName, spec) {
  var results = spec.results.getItems();
  reporter.test(results.length > 0, testName + ": should have results, got " + results.length);

  for (var i = 0; i < results.length; i++) {
    reporter.test(results[i].passed === true, testName + ':' + spec.getFullName() + ": expectation number " + i + " failed: " + results[i].message);
  }
}

function emitSuiteResults(testName, suite) {
  for (var j = 0; j < suite.specs.length; j++) {
    var specOrSuite = suite.specs[j];

    if (specOrSuite instanceof jasmine.Suite) {
      emitSuiteResults(testName, specOrSuite);
    } else {
      emitSpecResults(testName, specOrSuite);
    }
  }
}

var testExplodes = function () {
  var suite = describe('exploding', function () {
    it('should throw an exception when this.explodes is called inside a spec', function() {
      var exceptionMessage = false;

      try {
        this.explodes();
      }
      catch (e) {
        exceptionMessage = e;
      }
      expect(exceptionMessage).toEqual('explodes function should not have been called');
    });

  });
  suite.execute();

  emitSuiteResults('testExplodes', suite);
};

function newJasmineEnv() {
  return new jasmine.Env();
}

var testRunner = function() {
};

var testRunnerFinishCallback = function () {
  var env = newJasmineEnv();
  var foo = 0;

  env.currentRunner.finish();

  reporter.test((env.currentRunner.finished === true),
      "Runner finished flag was not set.");

  env.currentRunner.finishCallback = function () {
    foo++;
  };

  env.currentRunner.finish();

  reporter.test((env.currentRunner.finished === true),
      "Runner finished flag was not set.");
  reporter.test((foo === 1),
      "Runner finish callback was not called");
};

var testHandlesBlankSpecs = function () {
  var env = newJasmineEnv();
  env.describe('Suite for handles blank specs', function () {
    env.it('should be a test with a blank runs block', function() {
      this.runs(function () {
      });
    });
    env.it('should be a blank (empty function) test', function() {
    });

  });
  var runner = env.currentRunner;
  runner.execute();

  reporter.test((runner.suites[0].results.getItems().length === 2),
      'Should have found 2 spec results, got ' + runner.suites[0].results.getItems().length);
  reporter.test((runner.suites[0].results.passedCount === 2),
      'Should have found 2 passing specs, got ' + runner.suites[0].results.passedCount);
};

var testResultsAliasing = function () {
  var env = newJasmineEnv();

  env.describe('Suite for result aliasing test', function () {

    env.it('should be a test', function() {
      this.runs(function () {
        this.expect(true).toEqual(true);
      });
    });

  });

};


var runTests = function () {
  document.getElementById('spinner').style.display = "";

  runSuite('PrettyPrintTest.js');
  runSuite('MatchersTest.js');
  runSuite('SpecRunningTest.js');
  runSuite('NestedResultsTest.js');
  runSuite('ReporterTest.js');
  runSuite('RunnerTest.js');
  runSuite('JsonReporterTest.js');
  runSuite('SpyTest.js');
  runSuite('ExceptionsTest.js');

//  testResultsAliasing();  // this appears to do nothing.

  //   handle blank specs will work later.
  //      testHandlesBlankSpecs();

  reporter.summary();
  document.getElementById('spinner').style.display = "none";
};