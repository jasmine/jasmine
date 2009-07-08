describe("jasmine spec running", function () {
  var env;
  var fakeTimer;

  beforeEach(function() {
    env = new jasmine.Env();

    fakeTimer = new jasmine.FakeTimer();
    env.setTimeout = fakeTimer.setTimeout;
    env.clearTimeout = fakeTimer.clearTimeout;
    env.setInterval = fakeTimer.setInterval;
    env.clearInterval = fakeTimer.clearInterval;
  });

  it('should assign spec ids sequentially', function() {
    var it0, it1, it2, it3, it4;
    env.describe('test suite', function() {
      it0 = env.it('spec 0', function() {
      });
      it1 = env.it('spec 1', function() {
      });
      it2 = env.xit('spec 2', function() {
      });
      it3 = env.it('spec 3', function() {
      });
    });
    env.describe('test suite 2', function() {
      it4 = env.it('spec 4', function() {
      });
    });

    expect(it0.id).toEqual(0);
    expect(it1.id).toEqual(1);
    expect(it2.id).toEqual(2);
    expect(it3.id).toEqual(3);
    expect(it4.id).toEqual(4);
  });


  it("should build up some objects with results we can inspect", function() {
    var specWithNoBody, specWithExpectation, specWithFailingExpectations, specWithMultipleExpectations;

    var suite = env.describe('default current suite', function() {
      specWithNoBody = env.it('new spec');

      specWithExpectation = env.it('spec with an expectation').runs(function () {
        var foo = 'bar';
        this.expect(foo).toEqual('bar');
      });

      specWithFailingExpectations = env.it('spec with failing expectation').runs(function () {
        var foo = 'bar';
        this.expect(foo).toEqual('baz');
      });

      specWithMultipleExpectations = env.it('spec with multiple assertions').runs(function () {
        var foo = 'bar';
        var baz = 'quux';

        this.expect(foo).toEqual('bar');
        this.expect(baz).toEqual('quux');
      });
    });

    suite.execute();

    expect(specWithNoBody.description).toEqual('new spec');

    expect(specWithExpectation.results.getItems().length).toEqual(1); // "Results aren't there after a spec was executed"
    expect(specWithExpectation.results.getItems()[0].passed).toEqual(true); // "Results has a result, but it's true"
    expect(specWithExpectation.results.description).toEqual('spec with an expectation'); // "Spec's results did not get the spec's description"

    expect(specWithFailingExpectations.results.getItems()[0].passed).toEqual(false); // "Expectation that failed, passed"

    expect(specWithMultipleExpectations.results.getItems().length).toEqual(2); // "Spec doesn't support multiple expectations"
  });

  it("should work without a runs block", function() {
    var another_spec;
    var currentSuite = env.describe('default current suite', function() {
      another_spec = env.it('spec with an expectation', function () {
        var foo = 'bar';
        this.expect(foo).toEqual('bar');
        this.expect(foo).toEqual('baz');
      });
    });

    another_spec.execute();
    another_spec.done = true;

    expect(another_spec.results.getItems().length).toEqual(2);
    expect(another_spec.results.getItems()[0].passed).toEqual(true); // "In a spec without a run block, expected first expectation result to be true but was false"
    expect(another_spec.results.getItems()[1].passed).toEqual(false); // "In a spec without a run block, expected second expectation result to be false but was true";
    expect(another_spec.results.description).toEqual('spec with an expectation'); // "In a spec without a run block, results did not include the spec's description";
  });

  it("should run asynchronous tests", function () {
    var foo = 0;

    //set a bogus suite for the spec to attach to
    //    jasmine.getEnv().currentSuite = {specs: []};

    var a_spec;
    env.describe('test async spec', function() {
      a_spec = env.it('simple queue test', function () {
        this.runs(function () {
          foo++;
        });
        this.runs(function () {
          this.expect(foo).toEqual(1);
        });
      });
    });

    expect(a_spec.queue.length).toEqual(1,
      'Expected spec queue length to be 1, was ' + a_spec.queue.length);

    a_spec.execute();
    expect(a_spec.queue.length).toEqual(3,
      'Expected spec queue length to be 3, was ' + a_spec.queue.length);

    foo = 0;
    env.describe('test async spec', function() {
      a_spec = env.it('spec w/ queued statments', function () {
        this.runs(function () {
          foo++;
        });
        this.runs(function () {
          this.expect(foo).toEqual(1);
        });
      });
    });

    a_spec.execute();

    expect(a_spec.results.getItems().length).toEqual(1); // 'No call to waits(): Spec queue did not run all functions';
    expect(a_spec.results.getItems()[0].passed).toEqual(true); // 'No call to waits(): Queued expectation failed';

    foo = 0;
    env.describe('test async spec', function() {
      a_spec = env.it('spec w/ queued statments', function () {
        this.runs(function () {
          fakeTimer.setTimeout(function() {
            foo++;
          }, 500);
        });
        this.waits(1000);
        this.runs(function() {
          this.expect(foo).toEqual(1);
        });
      });
    });

    a_spec.execute();
    expect(a_spec.results.getItems().length).toEqual(0);

    fakeTimer.tick(500);
    expect(a_spec.results.getItems().length).toEqual(0);

    fakeTimer.tick(500);
    expect(a_spec.results.getItems().length).toEqual(1); // 'Calling waits(): Spec queue did not run all functions';

    expect(a_spec.results.getItems()[0].passed).toEqual(true); // 'Calling waits(): Queued expectation failed';

    var bar = 0;
    var another_spec;
    env.describe('test async spec', function() {
      another_spec = env.it('spec w/ queued statments', function () {
        this.runs(function () {
          fakeTimer.setTimeout(function() {
            bar++;
          }, 250);

        });
        this.waits(500);
        this.runs(function () {
          fakeTimer.setTimeout(function() {
            bar++;
          }, 250);
        });
        this.waits(500);
        this.runs(function () {
          this.expect(bar).toEqual(2);
        });
      });
    });

    expect(another_spec.queue.length).toEqual(1); // 'Calling 2 waits(): Expected queue length to be 1, got ' + another_spec.queue.length;

    another_spec.execute();

    fakeTimer.tick(1000);
    expect(another_spec.queue.length).toEqual(4); // 'Calling 2 waits(): Expected queue length to be 4, got ' + another_spec.queue.length;

    expect(another_spec.results.getItems().length).toEqual(1); // 'Calling 2 waits(): Spec queue did not run all functions';

    expect(another_spec.results.getItems()[0].passed).toEqual(true); // 'Calling 2 waits(): Queued expectation failed';

    var baz = 0;
    var yet_another_spec;
    env.describe('test async spec', function() {
      yet_another_spec = env.it('spec w/ async fail', function () {
        this.runs(function () {
          fakeTimer.setTimeout(function() {
            baz++;
          }, 250);
        });
        this.waits(100);
        this.runs(function() {
          this.expect(baz).toEqual(1);
        });
      });
    });


    yet_another_spec.execute();
    fakeTimer.tick(250);

    expect(yet_another_spec.queue.length).toEqual(3); // 'Calling 2 waits(): Expected queue length to be 3, got ' + another_spec.queue.length);
    expect(yet_another_spec.results.getItems().length).toEqual(1); // 'Calling 2 waits(): Spec queue did not run all functions');
    expect(yet_another_spec.results.getItems()[0].passed).toEqual(false); // 'Calling 2 waits(): Queued expectation failed');
  });

  it("testAsyncSpecsWithMockSuite", function () {
    var bar = 0;
    var another_spec;
    env.describe('test async spec', function() {
      another_spec = env.it('spec w/ queued statments', function () {
        this.runs(function () {
          fakeTimer.setTimeout(function() {
            bar++;
          }, 250);
        });
        this.waits(500);
        this.runs(function () {
          fakeTimer.setTimeout(function() {
            bar++;
          }, 250);
        });
        this.waits(1500);
        this.runs(function() {
          this.expect(bar).toEqual(2);
        });
      });
    });

    another_spec.execute();
    fakeTimer.tick(2000);
    expect(another_spec.queue.length).toEqual(4); // 'Calling 2 waits(): Expected queue length to be 4, got ' + another_spec.queue.length);
    expect(another_spec.results.getItems().length).toEqual(1); // 'Calling 2 waits(): Spec queue did not run all functions');
    expect(another_spec.results.getItems()[0].passed).toEqual(true); // 'Calling 2 waits(): Queued expectation failed');
  });

  it("testWaitsFor", function() {
    var doneWaiting = false;
    var runsBlockExecuted = false;

    var spec;
    env.describe('foo', function() {
      spec = env.it('has a waits for', function() {
        this.runs(function() {
        });

        this.waitsFor(500, function() {
          return doneWaiting;
        });

        this.runs(function() {
          runsBlockExecuted = true;
        });
      });
    });

    spec.execute();
    expect(runsBlockExecuted).toEqual(false); //, 'should not have executed runs block yet');
    fakeTimer.tick(100);
    doneWaiting = true;
    fakeTimer.tick(100);
    expect(runsBlockExecuted).toEqual(true); //, 'should have executed runs block');
  });

  it("testWaitsForFailsWithMessage", function() {
    var spec;
    env.describe('foo', function() {
      spec = env.it('has a waits for', function() {
        this.runs(function() {
        });

        this.waitsFor(500, function() {
          return false; // force a timeout
        }, 'my awesome condition');

        this.runs(function() {
        });
      });
    });

    spec.execute();
    fakeTimer.tick(1000);
    var actual = spec.results.getItems()[0].message;
    var expected = 'timeout: timed out after 500 msec waiting for my awesome condition';
    expect(actual).toEqual(expected);
  });

  it("testWaitsForFailsIfTimeout", function() {
    var runsBlockExecuted = false;

    var spec;
    env.describe('foo', function() {
      spec = env.it('has a waits for', function() {
        this.runs(function() {
        });

        this.waitsFor(500, function() {
          return false; // force a timeout
        });

        this.runs(function() {
          runsBlockExecuted = true;
        });
      });
    });

    spec.execute();
    expect(runsBlockExecuted).toEqual(false, 'should not have executed runs block yet');
    fakeTimer.tick(100);
    expect(runsBlockExecuted).toEqual(false, 'should not have executed runs block yet');
    fakeTimer.tick(400);
    expect(runsBlockExecuted).toEqual(false, 'should have timed out, so the second runs block should not have been called');
    var actual = spec.results.getItems()[0].message;
    var expected = 'timeout: timed out after 500 msec waiting for something to happen';
    expect(actual).toEqual(expected,
        'expected "' + expected + '" but found "' + actual + '"');
  });

  it("testSpecAfter", function() {
    var log = "";
    var spec;
    var suite = env.describe("has after", function() {
      spec = env.it('spec with after', function() {
        this.runs(function() {
          log += "spec";
        });
      });
    });
    spec.after(function() {
      log += "after1";
    });
    spec.after(function() {
      log += "after2";
    });

    suite.execute();
    expect(log).toEqual("specafter2after1"); // "after function should be executed in reverse order after spec runs");
  });

  describe('test suite declaration', function() {
    var suite;
    var dummyFunction = function() {};

    it('should give the suite a description', function() {
      suite = env.describe('one suite description', dummyFunction);
      expect(suite.description).toEqual('one suite description'); // 'Suite did not get a description');
    });

    it('should add tests to suites declared by the passed function', function() {
      suite = env.describe('one suite description', function () {
        env.it('should be a test');
      });

      expect(suite.specs.length).toEqual(1); // 'Suite did not get a spec pushed');
      expect(suite.specs[0].queue.length).toEqual(0); // "Suite's Spec should not have queuedFunctions");
    });

    it('should enqueue functions for multipart tests', function() {
      suite = env.describe('one suite description', function () {
        env.it('should be a test with queuedFunctions', function() {
          this.runs(function() {
            var foo = 0;
            foo++;
          });
        });
      });

      expect(suite.specs[0].queue.length).toEqual(1); // "Suite's spec did not get a function pushed");
    });

    it('should enqueue functions for multipart tests and support waits, and run any ready runs() blocks', function() {
      var foo = 0;
      var bar = 0;

      suite = env.describe('one suite description', function () {
        env.it('should be a test with queuedFunctions', function() {
          this.runs(function() {
            foo++;
          });
          this.waits(100);
          this.runs(function() {
            bar++;
          });
        });
      });

      expect(suite.specs[0].queue.length).toEqual(1); // "Suite's spec length should have been 1, was " + suite.specs[0].queue.length);
      suite.execute();
      expect(suite.specs[0].queue.length).toEqual(3); // "Suite's spec length should have been 3, was " + suite.specs[0].queue.length);
      expect(foo).toEqual(1);
      expect(bar).toEqual(0);

      fakeTimer.tick(100);
      expect(bar).toEqual(1);
    });

  });

  it("testBeforeAndAfterCallbacks", function () {

    var suiteWithBefore = env.describe('one suite with a before', function () {

      this.beforeEach(function () {
        this.foo = 1;
      });

      env.it('should be a spec', function () {
        this.runs(function() {
          this.foo++;
          this.expect(this.foo).toEqual(2);
        });
      });

      env.it('should be another spec', function () {
        this.runs(function() {
          this.foo++;
          this.expect(this.foo).toEqual(2);
        });
      });
    });

    suiteWithBefore.execute();
    var suite = suiteWithBefore;
    expect(suite.beforeEachFunction); // "testBeforeAndAfterCallbacks: Suite's beforeEach was not defined");
    expect(suite.specs[0].results.getItems()[0].passed).toEqual(true); // "testBeforeAndAfterCallbacks: the first spec's foo should have been 2");
    expect(suite.specs[1].results.getItems()[0].passed).toEqual(true); // "testBeforeAndAfterCallbacks: the second spec's this.foo should have been 2");

    var suiteWithAfter = env.describe('one suite with an after_each', function () {

      env.it('should be a spec with an after_each', function () {
        this.runs(function() {
          this.foo = 0;
          this.foo++;
          this.expect(this.foo).toEqual(1);
        });
      });

      env.it('should be another spec with an after_each', function () {
        this.runs(function() {
          this.foo = 0;
          this.foo++;
          this.expect(this.foo).toEqual(1);
        });
      });

      this.afterEach(function () {
        this.foo = 0;
      });
    });

    suiteWithAfter.execute();
    var suite = suiteWithAfter;
    expect(suite.afterEachFunction); // "testBeforeAndAfterCallbacks: Suite's afterEach was not defined");
    expect(suite.specs[0].results.getItems()[0].passed).toEqual(true); // "testBeforeAndAfterCallbacks: afterEach failure: " + suite.results.getItems()[0].results[0].message);
    expect(suite.specs[0].foo).toEqual(0); // "testBeforeAndAfterCallbacks: afterEach failure: foo was not reset to 0");
    expect(suite.specs[1].results.getItems()[0].passed).toEqual(true); // "testBeforeAndAfterCallbacks: afterEach failure: " + suite.results.getItems()[0].results[0].message);
    expect(suite.specs[1].foo).toEqual(0); // "testBeforeAndAfterCallbacks: afterEach failure: foo was not reset to 0");

  });

  it("testBeforeExecutesSafely", function() {
    var report = "";
    var suite = env.describe('before fails on first test, passes on second', function() {
      var counter = 0;
      this.beforeEach(function() {
        counter++;
        if (counter == 1) {
          throw "before failure";
        }
      });
      env.it("first should not run because before fails", function() {
        this.runs(function() {
          report += "first";
          this.expect(true).toEqual(true);
        });
      });
      env.it("second should run and pass because before passes", function() {
        this.runs(function() {
          report += "second";
          this.expect(true).toEqual(true);
        });
      });
    });

    suite.execute();

    expect(report).toEqual("firstsecond"); // "both tests should run");
    expect(suite.specs[0].results.getItems()[0].passed).toEqual(false); // "1st spec should fail");
    expect(suite.specs[1].results.getItems()[0].passed).toEqual(true); // "2nd spec should pass");

    expect(suite.specs[0].results.getItems()[0].passed).toEqual(false); // "1st spec should fail");
    expect(suite.specs[1].results.getItems()[0].passed).toEqual(true); // "2nd spec should pass");
  });

  it("testAfterExecutesSafely", function() {
    var report = "";
    var suite = env.describe('after fails on first test, then passes', function() {
      var counter = 0;
      this.afterEach(function() {
        counter++;
        if (counter == 1) {
          throw "after failure";
        }
      });
      env.it("first should run, expectation passes, but spec fails because after fails", function() {
        this.runs(function() {
          report += "first";
          this.expect(true).toEqual(true);
        });
      });
      env.it("second should run and pass because after passes", function() {
        this.runs(function() {
          report += "second";
          this.expect(true).toEqual(true);
        });
      });
      env.it("third should run and pass because after passes", function() {
        this.runs(function() {
          report += "third";
          this.expect(true).toEqual(true);
        });
      });
    });

    suite.execute();

    expect(report).toEqual("firstsecondthird"); // "all tests should run");
    //After each errors should not go in spec results because it confuses the count.
    expect(suite.specs.length).toEqual(3, 'testAfterExecutesSafely should have results for three specs');
    expect(suite.specs[0].results.getItems()[0].passed).toEqual(true, "testAfterExecutesSafely 1st spec should pass");
    expect(suite.specs[1].results.getItems()[0].passed).toEqual(true, "testAfterExecutesSafely 2nd spec should pass");
    expect(suite.specs[2].results.getItems()[0].passed).toEqual(true, "testAfterExecutesSafely 3rd spec should pass");

    expect(suite.specs[0].results.getItems()[0].passed).toEqual(true, "testAfterExecutesSafely 1st result for 1st suite spec should pass");
    expect(suite.specs[0].results.getItems()[1].passed).toEqual(false, "testAfterExecutesSafely 2nd result for 1st suite spec should fail because afterEach failed");
    expect(suite.specs[1].results.getItems()[0].passed).toEqual(true, "testAfterExecutesSafely 2nd suite spec should pass");
    expect(suite.specs[2].results.getItems()[0].passed).toEqual(true, "testAfterExecutesSafely 3rd suite spec should pass");
  });

  it("testNestedDescribes", function() {
    var actions = [];

    env.describe('Something', function() {
      env.beforeEach(function() {
        actions.push('outer beforeEach');
      });

      env.afterEach(function() {
        actions.push('outer afterEach');
      });

      env.it('does it 1', function() {
        actions.push('outer it 1');
      });

      env.describe('Inner 1', function() {
        env.beforeEach(function() {
          actions.push('inner 1 beforeEach');
        });

        env.afterEach(function() {
          actions.push('inner 1 afterEach');
        });

        env.it('does it 2', function() {
          actions.push('inner 1 it');
        });
      });

      env.it('does it 3', function() {
        actions.push('outer it 2');
      });

      env.describe('Inner 2', function() {
        env.beforeEach(function() {
          actions.push('inner 2 beforeEach');
        });

        env.afterEach(function() {
          actions.push('inner 2 afterEach');
        });

        env.it('does it 2', function() {
          actions.push('inner 2 it');
        });
      });
    });

    env.execute();

    var expected = [
      "outer beforeEach",
      "outer it 1",
      "outer afterEach",

      "outer beforeEach",
      "inner 1 beforeEach",
      "inner 1 it",
      "inner 1 afterEach",
      "outer afterEach",

      "outer beforeEach",
      "outer it 2",
      "outer afterEach",

      "outer beforeEach",
      "inner 2 beforeEach",
      "inner 2 it",
      "inner 2 afterEach",
      "outer afterEach"
    ];
    expect(env.equals_(actions, expected)).toEqual(true); // "nested describes order failed: <blockquote>" + jasmine.pp(actions) + "</blockquote> wanted <blockquote>" + jasmine.pp(expected) + "</blockquote");
  });

  it("builds up nested names", function() {
    var nestedSpec;
    env.describe('Test Subject', function() {
      env.describe('when under circumstance A', function() {
        env.describe('and circumstance B', function() {
          nestedSpec = env.it('behaves thusly', function() {});
        });
      });
    });

    expect(nestedSpec.getFullName()).toEqual('Test Subject when under circumstance A and circumstance B behaves thusly.'); //, "Spec.fullName was incorrect: " + nestedSpec.getFullName());
  });

  it("should bind 'this' to the running spec within the spec body", function() {
    var suite = env.describe('one suite description', function () {
      env.it('should be a test with queuedFunctions', function() {
        this.runs(function() {
          this.foo = 0;
          this.foo++;
        });

        this.runs(function() {
          var that = this;
          fakeTimer.setTimeout(function() {
            that.foo++;
          }, 250);
        });

        this.runs(function() {
          this.expect(this.foo).toEqual(2);
        });

        this.waits(300);

        this.runs(function() {
          this.expect(this.foo).toEqual(2);
        });
      });

    });

    suite.execute();
    fakeTimer.tick(600);

    expect(suite.specs[0].foo).toEqual(2); // "Spec does not maintain scope in between functions");
    expect(suite.specs[0].results.getItems().length).toEqual(2); // "Spec did not get results for all expectations");
    expect(suite.specs[0].results.getItems()[0].passed).toEqual(false); // "Spec did not return false for a failed expectation");
    expect(suite.specs[0].results.getItems()[1].passed).toEqual(true); // "Spec did not return true for a passing expectation");
  });

  it("shouldn't run disabled tests", function() {
    var xitSpecWasRun = false;
    var suite = env.describe('default current suite', function() {
      env.xit('disabled spec').runs(function () {
        xitSpecWasRun = true;
      });

      env.it('enabled spec').runs(function () {
        var foo = 'bar';
        expect(foo).toEqual('bar');
      });
    });

    suite.execute();
    expect(suite.specs.length).toEqual(1);
    expect(xitSpecWasRun).toEqual(false);
  });

  it('shouldn\'t execute specs in disabled suites', function() {
    var spy = jasmine.createSpy();
    var disabledSuite = env.xdescribe('a disabled suite', function() {
      env.it('enabled spec, but should not be run', function() {
        spy();
      });
    });

    disabledSuite.execute();

    expect(spy).wasNotCalled();
  });

  it('#explodes should throw an exception when it is called inside a spec', function() {
    var exceptionMessage = false;
    var anotherSuite = env.describe('Spec', function () {
      env.it('plodes', function() {
        try {
          this.explodes();
        }
        catch (e) {
          exceptionMessage = e;
        }
        expect(exceptionMessage).toNotEqual(false);
      });
    });

    anotherSuite.execute();

    expect(exceptionMessage).toEqual('explodes function should not have been called');
  });

  it("should be easy to add more matchers local to a spec, suite, etc.", function() {
    var spec1, spec2, spec1Matcher, spec2Matcher;

    var suite = env.describe('some suite', function() {
      env.beforeEach(function() {
        this.addMatchers({ matcherForSuite: function(expected) {
          return "matcherForSuite: actual: " + this.actual + "; expected: " + expected;
        } });
      });

      spec1 = env.it('spec with an expectation').runs(function () {
        this.addMatchers( { matcherForSpec: function(expected) {
          return "matcherForSpec: actual: " + this.actual + "; expected: " + expected;
        } });
        spec1Matcher = this.expect("xxx");
      });

      spec2 = env.it('spec with failing expectation').runs(function () {
        spec2Matcher = this.expect("yyy");
      });
    });

    suite.execute();

    expect(spec1Matcher.matcherForSuite("expected")).toEqual("matcherForSuite: actual: xxx; expected: expected");
    expect(spec1Matcher.matcherForSpec("expected")).toEqual("matcherForSpec: actual: xxx; expected: expected");

    expect(spec2Matcher.matcherForSuite("expected")).toEqual("matcherForSuite: actual: yyy; expected: expected");
    expect(spec2Matcher.matcherForSpec).toBe(undefined);
  });

});
