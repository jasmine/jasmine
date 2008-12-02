// Bootstrap Test Reporter function
var reporter = function () {

  var total = 0;
  var passes = 0;
  var fails = 0;

  var that = {
    test: function (result, message) {
      total++;

      if (result) {
        passes++;
        iconElement = $('icons');
        iconElement.appendChild(new Element('img', {src: '../images/accept.png'}));
      }
      else {
        fails++;
        var fails_report = $('fails');
        fails_report.show();

        iconElement = $('icons');
        iconElement.appendChild(new Element('img', {src: '../images/exclamation.png'}));

        var failMessages = $('fail_messages');
        var newFail = new Element('p', {'class': 'fail'});
        newFail.innerHTML = message;
        failMessages.appendChild(newFail);
      }
    },

    summary: function () {
      summary = new Element('p', {'class': ((fails > 0) ? 'fail_in_summary' : '') });
      summary.innerHTML = total + ' tests, ' + passes + ' passing, ' + fails + ' failed.';

      var summaryElement = $('results_summary');
      summaryElement.appendChild(summary);
      summaryElement.show();
    }
  }
  return that;
}();

var testMatchersComparisons = function () {
  var expected = new Matchers(true);
  reporter.test(expected.should_equal(true),
      'expects_that(true).should_equal(true) returned false');

  expected = new Matchers(false);
  reporter.test(!(expected.should_equal(true)),
      'expects_that(true).should_equal(true) returned true');

  expected = new Matchers(true);
  reporter.test(expected.should_not_equal(false),
      'expects_that(true).should_not_equal(false) retruned false');

  expected = new Matchers(true);
  reporter.test(!(expected.should_not_equal(true)),
      'expects_that(true).should_not_equal(false) retruned true');
}

var testMatchersReporting = function () {

  var results = [];
  var expected = new Matchers(true, results);
  expected.should_equal(true);
  expected.should_equal(false);

  reporter.test((results.length == 2),
      "Results array doesn't have 2 results");

  reporter.test((results[0].passed == true),
      "First spec didn't pass");

  reporter.test((results[1].passed == false),
      "Second spec did pass");

  results = [];
  var expected = new Matchers(false, results);
  expected.should_equal(true);

  reporter.test((results[0].message == 'Expected true but got false.'),
      "Failed expectation didn't test the failure message");

  results = [];
  var expected = new Matchers(true, results);
  expected.should_equal(true);

  reporter.test((results[0].message == 'Passed.'),
      "Passing expectation didn't test the passing message");
}

var testSpecs = function () {
  var spec = it('new spec');
  reporter.test((spec.description == 'new spec'),
      "Spec did not have a description");

  var another_spec = it('spec with an expectation').runs(function () {
    var foo = 'bar';
    this.expects_that(foo).should_equal('bar');
  });
  another_spec.execute();
  another_spec.done = true;

  reporter.test((another_spec.results.length == 1),
      "Results aren't there after a spec was executed");
  reporter.test((another_spec.results[0].passed == true),
      "Results has a result, but it's true");

  var yet_another_spec = it('spec with failing expectation').runs(function () {
    var foo = 'bar';
    this.expects_that(foo).should_equal('baz');
  });
  yet_another_spec.execute();
  yet_another_spec.done = true;

  reporter.test((yet_another_spec.results[0].passed == false),
      "Expectation that failed, passed");

  var yet_yet_another_spec = it('spec with multiple assertions').runs(function () {
    var foo = 'bar';
    var baz = 'quux';

    this.expects_that(foo).should_equal('bar');
    this.expects_that(baz).should_equal('quux');
  });
  yet_yet_another_spec.execute();
  yet_yet_another_spec.done = true;

  reporter.test((yet_yet_another_spec.results.length == 2),
      "Spec doesn't support multiple expectations");
}

var testAsyncSpecs = function () {
  var foo = 0;

  var a_spec = it('simple queue test').
      runs(function () {
    foo++;
  }).then(function() {
    this.expects_that(foo).should_equal(1)
  });

  reporter.test(a_spec.queue.length === 2,
      'Spec queue length is not 2');

  foo = 0;
  a_spec = it('spec w/ queued statments').
      runs(function () {
    foo++;
  }).then(function() {
    this.expects_that(foo).should_equal(1);
  });

  a_spec.execute();

  reporter.test((a_spec.results.length === 1),
      'No call to waits(): Spec queue did not run all functions');
  reporter.test((a_spec.results[0].passed === true),
      'No call to waits(): Queued expectation failed');

  foo = 0;
  a_spec = it('spec w/ queued statments').
      runs(function () {
    setTimeout(function() {
      foo++
    }, 500);
  }).waits(1000).
      then(function() {
    this.expects_that(foo).should_equal(1);
  });

  var mockSuite = {
    next: function() {
      reporter.test((a_spec.results.length === 1),
          'Calling waits(): Spec queue did not run all functions');

      reporter.test((a_spec.results[0].passed === true),
          'Calling waits(): Queued expectation failed');
    }
  };
  a_spec.execute();
  waitForDone(a_spec, mockSuite);

  var bar = 0;
  var another_spec = it('spec w/ queued statments').
      runs(function () {
    setTimeout(function() {
      bar++;
    }, 250);
  }).
      waits(500).
      then(function () {
    setTimeout(function() {
      bar++;
    }, 250);
  }).
      waits(1500).
      then(function() {
    this.expects_that(bar).should_equal(2);
  });
  mockSuite = {
    next: function() {
      reporter.test((another_spec.queue.length === 3),
          'Calling 2 waits(): Spec queue was less than expected length');
      reporter.test((another_spec.results.length === 1),
          'Calling 2 waits(): Spec queue did not run all functions');
      reporter.test((another_spec.results[0].passed === true),
          'Calling 2 waits(): Queued expectation failed');
    }
  };
  another_spec.execute();
  waitForDone(another_spec, mockSuite);

  var baz = 0;
  var yet_another_spec = it('spec w/ async fail').
      runs(function () {
    setTimeout(function() {
      baz++;
    }, 250);
  }).
      waits(100).
      then(function() {
    this.expects_that(baz).should_equal(1);
  });

  mockSuite = {
    next: function() {

      reporter.test((yet_another_spec.queue.length === 2),
          'Calling 2 waits(): Spec queue was less than expected length');
      reporter.test((yet_another_spec.results.length === 1),
          'Calling 2 waits(): Spec queue did not run all functions');
      reporter.test((yet_another_spec.results[0].passed === false),
          'Calling 2 waits(): Queued expectation failed');
    }
  };

  yet_another_spec.execute();
  waitForDone(yet_another_spec, mockSuite);
}

var testAsyncSpecsWithMockSuite = function () {
  var bar = 0;
  var another_spec = it('spec w/ queued statments').
      runs(function () {
    setTimeout(function() {
      bar++;
    }, 250);
  }).
      waits(500).
      then(function () {
    setTimeout(function() {
      bar++;
    }, 250);
  }).
      waits(1500).
      then(function() {
    this.expects_that(bar).should_equal(2);
  });

  var mockSuite = {
    next: function () {
      reporter.test((another_spec.queue.length === 3),
          'Calling 2 waits(): Spec queue was less than expected length');
      reporter.test((another_spec.results.length === 1),
          'Calling 2 waits(): Spec queue did not run all functions');
      reporter.test((another_spec.results[0].passed === true),
          'Calling 2 waits(): Queued expectation failed');
    }
  };
  another_spec.execute();
  waitForDone(another_spec, mockSuite);
}

var waitForDone = function(spec, mockSuite) {
  var id = setInterval(function () {
    if (spec.finished) {
      clearInterval(id);
      mockSuite.next();
    }
  }, 150);
}

var testSuites = function () {

  // suite has a description
  var suite = describe('one suite description', function() {
  });
  reporter.test((suite.description == 'one suite description'),
      'Suite did not get a description');

  // suite can have a test
  suite = describe('one suite description', function () {
    it('should be a test');
  });

  reporter.test((suite.specs.length === 1),
      'Suite did not get a spec pushed');
  reporter.test((suite.specs[0].queue.length === 0),
      "Suite's Spec should not have queuedFunctions");

  suite = describe('one suite description', function () {
    it('should be a test with queuedFunctions', function() {
      runs(function() {
        var foo = 0;
        foo++;
      });
    });
  });

  reporter.test((suite.specs[0].queue.length === 1),
      "Suite's spec did not get a function pushed");

  suite = describe('one suite description', function () {
    it('should be a test with queuedFunctions', function() {
      runs(function() {
        var foo = 0;
        foo++;
      });
      waits(100);
      runs(function() {
        var bar = 0;
        bar++;
      });

    });
  });

  reporter.test((suite.specs[0].queue.length === 2),
      "Suite's spec did not get 2 functions pushed");


  var foo = 0;
  suite = describe('one suite description', function () {
    it('should be a test with queuedFunctions', function() {
      runs(function() {
        foo++;
      });
    });

    it('should be a another spec with queuedFunctions', function() {
      runs(function() {
        foo++;
      });
    });
  });

  suite.execute();

  setTimeout(function () {
    reporter.test((suite.specs.length === 2),
        "Suite doesn't have two specs");
    reporter.test((foo === 2),
        "Suite didn't execute both specs");
  }, 500);
}

var testSpecScope = function () {

  suite = describe('one suite description', function () {
    it('should be a test with queuedFunctions', function() {
      runs(function() {
        this.foo = 0;
        this.foo++;
      });

      runs(function() {
        var that = this;
        setTimeout(function() {
          that.foo++;
        }, 250);
      });

      runs(function() {
        this.expects_that(this.foo).should_equal(2);
      });

      waits(300);

      runs(function() {
        this.expects_that(this.foo).should_equal(2);
      });
    });

  });

  suite.execute();

  setTimeout(function () {
    reporter.test((suite.specs[0].foo === 2),
        "Spec does not maintain scope in between functions");
    reporter.test((suite.specs[0].results.length === 2),
        "Spec did not get results for all expectations");
    reporter.test((suite.specs[0].results[0].passed === false),
        "Spec did not return false for a failed expectation");
    reporter.test((suite.specs[0].results[1].passed === true),
        "Spec did not return true for a passing expectation");
  }, 1000);
}


var testRunner = function() {

  var runner = Jasmine();
  describe('one suite description', function () {
    it('should be a test');
  });
  reporter.test((runner.suites.length === 1),
      "Runner expected one suite");

  runner = Jasmine();
  describe('one suite description', function () {
    it('should be a test');
  });
  describe('another suite description', function () {
    it('should be a test');
  });
  reporter.test((runner.suites.length === 2),
      "Runner expected two suites");

  runner = Jasmine();
  describe('one suite description', function () {
    it('should be a test', function() {
      runs(function () {
        this.expects_that(true).should_equal(true);
      });
    });
  });

  describe('another suite description', function () {
    it('should be another test', function() {
      runs(function () {
        this.expects_that(true).should_equal(false);
      });
    });
  });

  runner.execute();

  setTimeout(function () {
    reporter.test((runner.suites.length === 2),
        "Runner expected two suites");
    reporter.test((runner.suites[0].specs[0].results[0].passed === true),
        "Runner should have run specs in first suite");
    reporter.test((runner.suites[1].specs[0].results[0].passed === false),
        "Runner should have run specs in second suite");
  }, 1000);
}

var runTests = function () {
  $('spinner').show();

  testMatchersComparisons();
    testMatchersReporting();
    testSpecs();
    testAsyncSpecs();
    testAsyncSpecsWithMockSuite();
    testSuites();
    testSpecScope();
  testRunner();

  setTimeout(function() {
    $('spinner').hide();
    reporter.summary();
  }, 10000);
}


