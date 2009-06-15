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

var testFormatsExceptionMessages = function () {

  var sampleFirefoxException = {
    fileName: 'foo.js',
    line: '1978',
    message: 'you got your foo in my bar',
    name: 'A Classic Mistake'
  };

  var sampleWebkitException = {
    sourceURL: 'foo.js',
    lineNumber: '1978',
    message: 'you got your foo in my bar',
    name: 'A Classic Mistake'
  };

  var expected = 'A Classic Mistake: you got your foo in my bar in foo.js (line 1978)';

  reporter.test((jasmine.util.formatException(sampleFirefoxException) === expected),
      'Should have got ' + expected + ' but got: ' + jasmine.util.formatException(sampleFirefoxException));

  reporter.test((jasmine.util.formatException(sampleWebkitException) === expected),
      'Should have got ' + expected + ' but got: ' + jasmine.util.formatException(sampleWebkitException));
};

var testHandlesExceptions = function () {
  var env = newJasmineEnv();

  //we run two exception tests to make sure we continue after throwing an exception
  var suite = env.describe('Suite for handles exceptions', function () {
    env.it('should be a test that fails because it throws an exception', function() {
      this.runs(function () {
        throw new Error('fake error 1');
      });
    });

    env.it('should be another test that fails because it throws an exception', function() {
      this.runs(function () {
        throw new Error('fake error 2');
      });
      this.runs(function () {
        this.expect(true).toEqual(true);
      });
    });


    env.it('should be a passing test that runs after exceptions are thrown', function() {
      this.runs(function () {
        this.expect(true).toEqual(true);
      });
    });

    env.it('should be another test that fails because it throws an exception after a wait', function() {
      this.runs(function () {
        var foo = 'foo';
      });
      this.waits(250);
      this.runs(function () {
        throw new Error('fake error 3');
      });
    });

    env.it('should be a passing test that runs after exceptions are thrown from a async test', function() {
      this.runs(function () {
        this.expect(true).toEqual(true);
      });
    });
  });


  var runner = env.currentRunner;
  runner.execute();
  Clock.tick(400); //TODO: setting this to a large number causes failures, but shouldn't

  var resultsForSpec0 = suite.specs[0].getResults();
  var resultsForSpec1 = suite.specs[1].getResults();
  var resultsForSpec2 = suite.specs[2].getResults();
  var resultsForSpec3 = suite.specs[3].getResults();

  reporter.test((suite.getResults().totalCount == 6),
      'Should have found 5 spec results, got ' + suite.getResults().totalCount);

  reporter.test((resultsForSpec0.getItems()[0].passed === false),
      'Spec1 test, expectation 0 should have failed, got passed');

  reporter.test((resultsForSpec0.getItems()[0].message.match(/fake error 1/)),
      'Spec1 test, expectation 0 should have a message that contained /fake error 1/, got ' + resultsForSpec0.getItems()[0].message);

  reporter.test((resultsForSpec1.getItems()[0].passed === false),
      'Spec2 test, expectation 0 should have failed, got passed');

  reporter.test((resultsForSpec1.getItems()[0].message.match(/fake error 2/)),
      'Spec2 test, expectation 0 should have a message that contained /fake error 2/, got ' + resultsForSpec1.getItems()[0].message);

  reporter.test((resultsForSpec1.getItems()[1].passed === true),
      'Spec2 test should have had a passing 2nd expectation');

  reporter.test((resultsForSpec2.getItems()[0].passed === true),
      'Spec3 test should have passed, got failed');

  reporter.test((resultsForSpec3.getItems()[0].passed === false),
      'Spec3 test should have a failing first expectation, got passed');

  reporter.test((resultsForSpec3.getItems()[0].message.match(/fake error 3/)),
      'Spec3 test should have an error message that contained /fake error 3/, got ' + resultsForSpec3.getItems()[0].message);
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
  
  testRunnerFinishCallback();
  testFormatsExceptionMessages();
  testHandlesExceptions();
  testResultsAliasing();

  //   handle blank specs will work later.
  //      testHandlesBlankSpecs();

  reporter.summary();
  document.getElementById('spinner').style.display = "none";
};