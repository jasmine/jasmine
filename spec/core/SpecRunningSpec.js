describe("jasmine spec running", function () {
  var env;
  var fakeTimer;

  beforeEach(function() {
    env = new jasmine.Env();
    env.updateInterval = 0;

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

      specWithMultipleExpectations = env.it('spec with multiple expectations').runs(function () {
        var foo = 'bar';
        var baz = 'quux';

        this.expect(foo).toEqual('bar');
        this.expect(baz).toEqual('quux');
      });
    });

    suite.execute();

    expect(specWithNoBody.description).toEqual('new spec');

    expect(specWithExpectation.results().getItems().length).toEqual(1); // "Results aren't there after a spec was executed"
    expect(specWithExpectation.results().getItems()[0].passed()).toEqual(true); // "Results has a result, but it's true"
    expect(specWithExpectation.results().description).toEqual('spec with an expectation'); // "Spec's results did not get the spec's description"

    expect(specWithFailingExpectations.results().getItems()[0].passed()).toEqual(false); // "Expectation that failed, passed"

    expect(specWithMultipleExpectations.results().getItems().length).toEqual(2); // "Spec doesn't support multiple expectations"
  });

  it("should work without a runs block", function() {
    var another_spec;
    env.describe('default current suite', function() {
      another_spec = env.it('spec with an expectation', function () {
        var foo = 'bar';
        this.expect(foo).toEqual('bar');
        this.expect(foo).toEqual('baz');
      });
    });

    another_spec.execute();
    another_spec.done = true;

    expect(another_spec.results().getItems().length).toEqual(2);
    expect(another_spec.results().getItems()[0].passed()).toEqual(true); // "In a spec without a run block, expected first expectation result to be true but was false"
    expect(another_spec.results().getItems()[1].passed()).toEqual(false); // "In a spec without a run block, expected second expectation result to be false but was true";
    expect(another_spec.results().description).toEqual('spec with an expectation'); // "In a spec without a run block, results did not include the spec's description";
  });

  it('should queue waits and runs that it encounters while executing specs', function() {
    var specWithRunsAndWaits;
    var foo = 0;
    env.describe('test async spec', function() {
      specWithRunsAndWaits = env.it('spec w/ queued statments', function () {
        this.runs(function () {
          foo++;
        });
        this.waits(500);
        this.runs(function () {
          foo++;
        });
        this.waits(500);
        this.runs(function () {
          foo++;
        });
      });
    });

    expect(foo).toEqual(0);
    specWithRunsAndWaits.execute();

    expect(foo).toEqual(1);
    fakeTimer.tick(500);
    expect(foo).toEqual(2);
    fakeTimer.tick(500);
    expect(foo).toEqual(3);
  });

  it("should run asynchronous tests", function () {
    var foo = 0;

    var a_spec;
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

    expect(a_spec.results().getItems().length).toEqual(1); // 'No call to waits(): Spec queue did not run all functions';
    expect(a_spec.results().getItems()[0].passed()).toEqual(true); // 'No call to waits(): Queued expectation failed';

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

    expect(a_spec.results().getItems().length).toEqual(0);

    fakeTimer.tick(500);
    expect(a_spec.results().getItems().length).toEqual(0);

    fakeTimer.tick(500);
    expect(a_spec.results().getItems().length).toEqual(1); // 'Calling waits(): Spec queue did not run all functions';

    expect(a_spec.results().getItems()[0].passed()).toEqual(true); // 'Calling waits(): Queued expectation failed';

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


    another_spec.execute();

    fakeTimer.tick(1000);

    expect(another_spec.results().getItems().length).toEqual(1);
    expect(another_spec.results().getItems()[0].passed()).toEqual(true);

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
    //tick twice so that second runs gets eval'd first: mockClock bug?
    fakeTimer.tick(100);
    fakeTimer.tick(150);


    expect(yet_another_spec.results().getItems().length).toEqual(1);
    expect(yet_another_spec.results().getItems()[0].passed()).toEqual(false);
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
    expect(another_spec.results().getItems().length).toEqual(1);
    expect(another_spec.results().getItems()[0].passed()).toEqual(true);
  });

  describe("waitsFor", function() {
    var latchFunction = function() {
      return true;
    };
    var spec;

    function makeWaitsForSpec() {
      var args = jasmine.util.argsToArray(arguments);
      env.describe('suite', function() {
        spec = env.it('spec', function() {
          this.waitsFor.apply(this, args);
        });
      });
      env.execute();
    }

    it("should accept args (latchFunction, timeoutMessage, timeout)", function() {
      makeWaitsForSpec(latchFunction, "message", 123);
      var block = spec.queue.blocks[1];
      expect(block.latchFunction).toBe(latchFunction);
      expect(block.timeout).toEqual(123);
      expect(block.message).toEqual('message');
    });

    it("should accept args (latchFunction, timeout)", function() {
      makeWaitsForSpec(latchFunction, 123);
      var block = spec.queue.blocks[1];
      expect(block.latchFunction).toBe(latchFunction);
      expect(block.timeout).toEqual(123);
      expect(block.message).toEqual(null);
    });

    it("should accept args (latchFunction, timeoutMessage)", function() {
      env.defaultTimeoutInterval = 4321;
      makeWaitsForSpec(latchFunction, "message");
      var block = spec.queue.blocks[1];
      expect(block.latchFunction).toBe(latchFunction);
      expect(block.timeout).toEqual(4321);
      expect(block.message).toEqual('message');
    });

    it("should accept args (latchFunction)", function() {
      env.defaultTimeoutInterval = 4321;
      makeWaitsForSpec(latchFunction);
      var block = spec.queue.blocks[1];
      expect(block.latchFunction).toBe(latchFunction);
      expect(block.timeout).toEqual(4321);
      expect(block.message).toEqual(null);
    });

    it("should accept deprecated args order (timeout, latchFunction, timeoutMessage)", function() {
      makeWaitsForSpec(123, latchFunction, "message");
      var block = spec.queue.blocks[1];
      expect(block.latchFunction).toBe(latchFunction);
      expect(block.timeout).toEqual(123);
      expect(block.message).toEqual('message');
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

    it("fails with message", function() {
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
      expect(spec.results().getItems()[0].message).toEqual('timeout: timed out after 500 msec waiting for my awesome condition');
    });

    it("fails and skips the rest of the spec if timeout is reached and the latch function hasn't returned true", function() {
      var runsBlockExecuted = false;
      var subsequentSpecRan = false;

      var timeoutSpec, subsequentSpec;
      var suite = env.describe('foo', function() {
        timeoutSpec = env.it('has a waits for', function() {
          this.runs(function() {
          });

          this.waitsFor(500, function() {
            return false;
          });

          this.runs(function() {
            runsBlockExecuted = true;
          });
        });

        subsequentSpec = env.it('then carries on to the next test', function() {
          subsequentSpecRan = true;
        });
      });

      env.execute();
      expect(runsBlockExecuted).toEqual(false);
      fakeTimer.tick(100);
      expect(runsBlockExecuted).toEqual(false);
      fakeTimer.tick(400);
      expect(runsBlockExecuted).toEqual(false);
      expect(timeoutSpec.results().getItems()[0].message).toEqual('timeout: timed out after 500 msec waiting for something to happen');
      expect(subsequentSpecRan).toEqual(true);
    });

    it("runs afterEach after timing out", function() {
      var afterEach = jasmine.createSpy('afterEach');

      env.describe('foo', function () {
        env.afterEach(afterEach);

        env.it('waitsFor', function () {
          this.waitsFor(100, function() {
            return false;
          });
        });
      }).execute();

      fakeTimer.tick(500);
      expect(afterEach).toHaveBeenCalled();
    });

    it("runs single-spec after functions after timing out", function() {
      var after = jasmine.createSpy('after');

      env.describe('foo', function () {
        env.it('waitsFor', function () {
          this.after(after);
          this.waitsFor(100, function() {
            return false;
          });
        });
      }).execute();

      fakeTimer.tick(500);
      expect(after).toHaveBeenCalled();
    });

    describe('with consecutive calls', function () {
      var foo;
      beforeEach(function () {
        foo = 0;
      });

      it('exits immediately (does not stack) if the latchFunction times out', function () {
        var reachedFirstWaitsFor = false;
        var reachedSecondWaitsFor = false;
        env.describe('suite that waits', function () {
          env.it('should stack timeouts', function() {
            this.waitsFor(500, function () {
              reachedFirstWaitsFor = true;
              return false;
            });
            this.waitsFor(500, function () {
              reachedSecondWaitsFor = true;
            });
            this.runs(function () {
              foo++;
            });
          });
        });

        expect(reachedFirstWaitsFor).toEqual(false);
        env.execute();

        expect(reachedFirstWaitsFor).toEqual(true);
        expect(foo).toEqual(0);
        expect(reachedSecondWaitsFor).toEqual(false);
        fakeTimer.tick(500);
        expect(reachedSecondWaitsFor).toEqual(false);
        expect(foo).toEqual(0);
        fakeTimer.tick(500);
        expect(reachedSecondWaitsFor).toEqual(false);
        expect(foo).toEqual(0);
      });

      it('stacks latchFunctions', function () {
        var firstWaitsResult = false;
        var secondWaitsResult = false;
        var waitsSuite = env.describe('suite that waits', function () {
          env.it('spec with waitsFors', function() {
            this.waitsFor(600, function () {
              fakeTimer.setTimeout(function () {
                firstWaitsResult = true;
              }, 300);
              return firstWaitsResult;
            });
            this.waitsFor(600, function () {
              fakeTimer.setTimeout(function () {
                secondWaitsResult = true;
              }, 300);
              return secondWaitsResult;
            });
            this.runs(function () {
              foo++;
            });
          });
        });

        expect(firstWaitsResult).toEqual(false);
        expect(secondWaitsResult).toEqual(false);
        waitsSuite.execute();

        expect(firstWaitsResult).toEqual(false);
        expect(secondWaitsResult).toEqual(false);
        expect(foo).toEqual(0);

        fakeTimer.tick(300);

        expect(firstWaitsResult).toEqual(true);
        expect(secondWaitsResult).toEqual(false);
        expect(foo).toEqual(0);

        fakeTimer.tick(300);

        expect(firstWaitsResult).toEqual(true);
        expect(secondWaitsResult).toEqual(true);
        expect(foo).toEqual(1);

      });
    });
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

    expect(log).toEqual("specafter2after1");
  });

  describe('test suite declaration', function() {
    var suite;
    var dummyFunction = function() {
    };

    it('should give the suite a description', function() {
      suite = env.describe('one suite description', dummyFunction);
      expect(suite.description).toEqual('one suite description');
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

      suite.execute();

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

    expect(suite.results().getItems()[0].passed()).toEqual(true); // "testBeforeAndAfterCallbacks: the first spec's foo should have been 2");
    expect(suite.results().getItems()[1].passed()).toEqual(true); // "testBeforeAndAfterCallbacks: the second spec's this.foo should have been 2");


    var foo = 1;
    var suiteWithAfter = env.describe('one suite with an after_each', function () {

      env.it('should be a spec with an after_each', function () {
        this.expect(foo).toEqual(1);
        foo++;
        this.expect(foo).toEqual(2);
      });

      env.it('should be another spec with an after_each', function () {
        this.expect(foo).toEqual(0);
        foo++;
        this.expect(foo).toEqual(1);
      });

      this.afterEach(function () {
        foo = 0;
      });
    });

    suiteWithAfter.execute();

    suite = suiteWithAfter;
    expect(suite.afterEach.length).toEqual(1);
    expect(suite.results().getItems()[0].passed()).toEqual(true);
    expect(suite.results().getItems()[1].passed()).toEqual(true);
    expect(foo).toEqual(0);

  });

  it('#waits should allow consecutive waits calls', function () {
    var foo = 0;
    var waitsSuite = env.describe('suite that waits', function () {
      env.it('should wait', function() {
        this.waits(500);
        this.waits(500);
        this.runs(function () {
          foo++;
        });
      });
    });

    waitsSuite.execute();
    expect(foo).toEqual(0);
    fakeTimer.tick(500);
    expect(foo).toEqual(0);
    fakeTimer.tick(500);

    expect(foo).toEqual(1);
  });

  it('nested suites', function () {

    var foo = 0;
    var bar = 0;
    var baz = 0;
    var quux = 0;
    var nested = env.describe('suite', function () {
      env.describe('nested', function () {
        env.it('should run nested suites', function () {
          foo++;
        });
        env.it('should run nested suites', function () {
          bar++;
        });
      });

      env.describe('nested 2', function () {
        env.it('should run suites following nested suites', function () {
          baz++;
        });
      });

      env.it('should run tests following nested suites', function () {
        quux++;
      });
    });

    expect(foo).toEqual(0);
    expect(bar).toEqual(0);
    expect(baz).toEqual(0);
    expect(quux).toEqual(0);
    nested.execute();

    expect(foo).toEqual(1);
    expect(bar).toEqual(1);
    expect(baz).toEqual(1);
    expect(quux).toEqual(1);
  });

  it("#beforeEach should be able to eval runs and waits blocks", function () {
    var foo = 0;
    var bar = 0;
    var suiteWithBefore = env.describe('one suite with a before', function () {
      this.beforeEach(function () {
        this.runs(function () {
          foo++;
        });
        this.waits(500);
        this.runs(function () {
          foo++;
        });
        this.waits(500);
      });

      env.it('should be a spec', function () {
        bar = 1;
        foo++;
      });

    });

    expect(foo).toEqual(0);
    expect(bar).toEqual(0);
    suiteWithBefore.execute();

    expect(bar).toEqual(0);
    expect(foo).toEqual(1);
    fakeTimer.tick(500);

    expect(bar).toEqual(0);
    expect(foo).toEqual(2);
    fakeTimer.tick(500);
    expect(bar).toEqual(1);
    expect(foo).toEqual(3);
  });

  it("#afterEach should be able to eval runs and waits blocks", function () {
    var foo = 0;
    var firstSpecHasRun = false;
    var secondSpecHasRun = false;
    var suiteWithAfter = env.describe('one suite with a before', function () {
      this.afterEach(function () {
        this.waits(500);
        this.runs(function () {
          foo++;
        });
        this.waits(500);
      });

      env.it('should be the first spec', function () {
        firstSpecHasRun = true;
      });

      env.it('should be a spec', function () {
        secondSpecHasRun = true;
        foo++;
      });

    });

    expect(firstSpecHasRun).toEqual(false);
    expect(secondSpecHasRun).toEqual(false);
    expect(foo).toEqual(0);

    suiteWithAfter.execute();


    expect(firstSpecHasRun).toEqual(true);
    expect(secondSpecHasRun).toEqual(false);
    expect(foo).toEqual(0);

    fakeTimer.tick(500);

    expect(foo).toEqual(1);
    expect(secondSpecHasRun).toEqual(false);
    fakeTimer.tick(500);

    expect(foo).toEqual(2);
    expect(secondSpecHasRun).toEqual(true);

  });

  it("Spec#after should be able to eval runs and waits blocks", function () {
    var runsBeforeAfter = false;
    var firstSpecHasRun = false;
    var secondSpecHasRun = false;
    var afterHasRun = false;
    var suiteWithAfter = env.describe('one suite with a before', function () {

      env.it('should be the first spec', function () {
        firstSpecHasRun = true;
        this.after(function () {
          this.waits(500);
          this.runs(function () {
            afterHasRun = true;
          });
          this.waits(500);
        }, true);
        this.waits(500);
        this.runs(function () {
          runsBeforeAfter = true;
        });
      });

      env.it('should be a spec', function () {
        secondSpecHasRun = true;
      });

    });

    expect(firstSpecHasRun).toEqual(false);
    expect(runsBeforeAfter).toEqual(false);
    expect(afterHasRun).toEqual(false);
    expect(secondSpecHasRun).toEqual(false);

    suiteWithAfter.execute();

    expect(firstSpecHasRun).toEqual(true);
    expect(runsBeforeAfter).toEqual(false);
    expect(afterHasRun).toEqual(false);
    expect(secondSpecHasRun).toEqual(false);

    fakeTimer.tick(500);

    expect(firstSpecHasRun).toEqual(true);
    expect(runsBeforeAfter).toEqual(true);
    expect(afterHasRun).toEqual(false);
    expect(secondSpecHasRun).toEqual(false);

    fakeTimer.tick(500);

    expect(firstSpecHasRun).toEqual(true);
    expect(runsBeforeAfter).toEqual(true);
    expect(afterHasRun).toEqual(true);
    expect(secondSpecHasRun).toEqual(false);

    fakeTimer.tick(500);

    expect(firstSpecHasRun).toEqual(true);
    expect(runsBeforeAfter).toEqual(true);
    expect(afterHasRun).toEqual(true);
    expect(secondSpecHasRun).toEqual(true);
  });

  it("handles waits", function () {
    var firstSpecHasRun = false;
    var secondSpecHasRun = false;
    var suiteWithAfter = env.describe('one suite with a before', function () {

      env.it('should be the first spec', function () {
        this.waits(500);
        this.runs(function () {
          firstSpecHasRun = true;
        });
      });

      env.it('should be a spec', function () {
        secondSpecHasRun = true;
      });

    });

    expect(firstSpecHasRun).toEqual(false);
    expect(secondSpecHasRun).toEqual(false);

    suiteWithAfter.execute();

    expect(firstSpecHasRun).toEqual(false);
    expect(secondSpecHasRun).toEqual(false);

    fakeTimer.tick(500);

    expect(firstSpecHasRun).toEqual(true);
    expect(secondSpecHasRun).toEqual(true);
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

    expect(report).toEqual("firstsecond");
    var suiteResults = suite.results();
    expect(suiteResults.getItems()[0].getItems()[0].passed()).toEqual(false);
    expect(suiteResults.getItems()[1].getItems()[0].passed()).toEqual(true);
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
    var suiteResults = suite.results();
    expect(suiteResults.getItems().length).toEqual(3, 'testAfterExecutesSafely should have results for three specs');

    expect(suiteResults.getItems()[0].getItems()[0].passed()).toEqual(true, "testAfterExecutesSafely 1st spec should pass");
    expect(suiteResults.getItems()[1].getItems()[0].passed()).toEqual(true, "testAfterExecutesSafely 2nd spec should pass");
    expect(suiteResults.getItems()[2].getItems()[0].passed()).toEqual(true, "testAfterExecutesSafely 3rd spec should pass");

    expect(suiteResults.getItems()[0].getItems()[0].passed()).toEqual(true, "testAfterExecutesSafely 1st result for 1st suite spec should pass");
    expect(suiteResults.getItems()[0].getItems()[1].passed()).toEqual(false, "testAfterExecutesSafely 2nd result for 1st suite spec should fail because afterEach failed");
    expect(suiteResults.getItems()[1].getItems()[0].passed()).toEqual(true, "testAfterExecutesSafely 2nd suite spec should pass");
    expect(suiteResults.getItems()[2].getItems()[0].passed()).toEqual(true, "testAfterExecutesSafely 3rd suite spec should pass");
  });

  it("should permit nested describes", function() {
    var actions = [];

    env.beforeEach(function () {
      actions.push('runner beforeEach');
    });

    env.afterEach(function () {
      actions.push('runner afterEach');
    });

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
      "runner beforeEach",
      "outer beforeEach",
      "outer it 1",
      "outer afterEach",
      "runner afterEach",

      "runner beforeEach",
      "outer beforeEach",
      "inner 1 beforeEach",
      "inner 1 it",
      "inner 1 afterEach",
      "outer afterEach",
      "runner afterEach",

      "runner beforeEach",
      "outer beforeEach",
      "outer it 2",
      "outer afterEach",
      "runner afterEach",

      "runner beforeEach",
      "outer beforeEach",
      "inner 2 beforeEach",
      "inner 2 it",
      "inner 2 afterEach",
      "outer afterEach",
      "runner afterEach"
    ];
    expect(actions).toEqual(expected);
  });

  it("should run multiple befores and afters in the order they are declared", function() {
    var actions = [];

    env.beforeEach(function () {
      actions.push('runner beforeEach1');
    });

    env.afterEach(function () {
      actions.push('runner afterEach1');
    });

    env.beforeEach(function () {
      actions.push('runner beforeEach2');
    });

    env.afterEach(function () {
      actions.push('runner afterEach2');
    });

    env.describe('Something', function() {
      env.beforeEach(function() {
        actions.push('beforeEach1');
      });

      env.afterEach(function() {
        actions.push('afterEach1');
      });

      env.beforeEach(function() {
        actions.push('beforeEach2');
      });

      env.afterEach(function() {
        actions.push('afterEach2');
      });

      env.it('does it 1', function() {
        actions.push('outer it 1');
      });
    });

    env.execute();

    var expected = [
      "runner beforeEach1",
      "runner beforeEach2",
      "beforeEach1",
      "beforeEach2",
      "outer it 1",
      "afterEach2",
      "afterEach1",
      "runner afterEach2",
      "runner afterEach1"
    ];
    expect(actions).toEqual(expected);
  });

  it("builds up nested names", function() {
    var nestedSpec;
    env.describe('Test Subject', function() {
      env.describe('when under circumstance A', function() {
        env.describe('and circumstance B', function() {
          nestedSpec = env.it('behaves thusly', function() {
          });
        });
      });
    });

    expect(nestedSpec.getFullName()).toEqual('Test Subject when under circumstance A and circumstance B behaves thusly.'); //, "Spec.fullName was incorrect: " + nestedSpec.getFullName());
  });

  it("should skip empty suites", function () {
    env.describe('NonEmptySuite1', function() {
      env.it('should pass', function() {
        this.expect(true).toEqual(true);
      });
      env.describe('NestedEmptySuite', function() {
      });
      env.it('should pass', function() {
        this.expect(true).toEqual(true);
      });
    });

    env.describe('EmptySuite', function() {
    });

    env.describe('NonEmptySuite2', function() {
      env.it('should pass', function() {
        this.expect(true).toEqual(true);
      });
    });

    env.execute();

    var runnerResults = env.currentRunner_.results();
    expect(runnerResults.totalCount).toEqual(3);
    expect(runnerResults.passedCount).toEqual(3);
    expect(runnerResults.failedCount).toEqual(0);
  });

  it("should bind 'this' to the running spec within the spec body", function() {
    var spec;
    var suite = env.describe('one suite description', function () {
      env.it('should be a test with queuedFunctions', function() {
        spec = this.runs(function() {
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
    expect(spec.foo).toEqual(2);
    var suiteResults = suite.results();
    expect(suiteResults.getItems()[0].getItems().length).toEqual(2);
    expect(suiteResults.getItems()[0].getItems()[0].passed()).toEqual(false);
    expect(suiteResults.getItems()[0].getItems()[1].passed()).toEqual(true);
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

    expect(spy).not.toHaveBeenCalled();
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

  it("should recover gracefully when there are errors in describe functions", function() {
    var specs = [];
    var superSimpleReporter = new jasmine.Reporter();
    superSimpleReporter.reportSpecResults = function(spec) {
      specs.push("Spec: " + spec.getFullName());
      var results = spec.results().getItems();
      for (var i = 0; i < results.length; i++) {
        var result = results[i];
        specs.push("Result: " + result);
      }
    };

    try {
      env.describe("outer1", function() {
        env.describe("inner1", function() {
          env.it("should thingy", function() {
            this.expect(true).toEqual(true);
          });

          throw new Error("fake error");
        });

        env.describe("inner2", function() {
          env.it("should other thingy", function() {
            this.expect(true).toEqual(true);
          });
        });

        throw new Error("fake error");

      });
    } catch(e) {
    }

    env.describe("outer2", function() {
      env.it("should xxx", function() {
        this.expect(true).toEqual(true);
      });
    });

    env.addReporter(superSimpleReporter);
    env.execute();

    expect(specs.join('')).toMatch(new RegExp(
      'Spec: outer1 inner1 should thingy.' +
        'Result: Passed.' +
        'Spec: outer1 inner1 encountered a declaration exception.' +
        'Result: Error: fake error.*' +
        'Spec: outer1 inner2 should other thingy.' +
        'Result: Passed.' +
        'Spec: outer1 encountered a declaration exception.' +
        'Result: Error: fake error.*' +
        'Spec: outer2 should xxx.' +
        'Result: Passed.'
      ));
  });

});
