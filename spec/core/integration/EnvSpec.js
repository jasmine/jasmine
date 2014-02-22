describe("Env integration", function() {

  it("Suites execute as expected (no nesting)", function(done) {
    var env = new j$.Env(),
        calls = [];

    var assertions = function() {
      expect(calls).toEqual([
        "with a spec",
        "and another spec"
      ]);

      done();
    };

    env.addReporter({ jasmineDone: assertions});

    env.describe("A Suite", function() {
      env.it("with a spec", function() {
        calls.push("with a spec");
      });
      env.it("and another spec", function() {
        calls.push("and another spec");
      });
    });

    env.execute();
  });

  it("Nested Suites execute as expected", function(done) {
    var env = new j$.Env(),
        calls = [];

    var assertions = function() {
      expect(calls).toEqual([
        'an outer spec',
        'an inner spec',
        'another inner spec'
      ]);

      done();
    };

    env.addReporter({ jasmineDone: assertions });

    env.describe("Outer suite", function() {
      env.it("an outer spec", function() {
        calls.push('an outer spec')
      });
      env.describe("Inner suite", function() {
        env.it("an inner spec", function() {
          calls.push('an inner spec');
        });
        env.it("another inner spec", function() {
          calls.push('another inner spec');
        });
      });
    });

    env.execute();
  });

  it("Multiple top-level Suites execute as expected", function(done) {
    var env = new j$.Env(),
        calls = [];

    var assertions = function() {
      expect(calls).toEqual([
        'an outer spec',
        'an inner spec',
        'another inner spec',
        'a 2nd outer spec'
      ]);

      done();
    };

    env.addReporter({ jasmineDone: assertions });


    env.describe("Outer suite", function() {
      env.it("an outer spec", function() {
        calls.push('an outer spec')
      });
      env.describe("Inner suite", function() {
        env.it("an inner spec", function() {
          calls.push('an inner spec');
        });
        env.it("another inner spec", function() {
          calls.push('another inner spec');
        });
      });
    });

    env.describe("Another outer suite", function() {
      env.it("a 2nd outer spec", function() {
        calls.push('a 2nd outer spec')
      });
    });

    env.execute();
  });

  it("calls associated befores/specs/afters with the same 'this'", function(done) {
    var env = new j$.Env();

    env.addReporter({jasmineDone: done});

    env.describe("tests", function() {
      var firstTimeThrough = true, firstSpecContext, secondSpecContext;

      env.beforeEach(function() {
        if (firstTimeThrough) {
          firstSpecContext = this;
        } else {
          secondSpecContext = this;
        }
        expect(this).toEqual({});
      });

      env.it("sync spec", function() {
        expect(this).toBe(firstSpecContext);
      });

      env.it("another sync spec", function() {
        expect(this).toBe(secondSpecContext);
      });

      env.afterEach(function() {
        if (firstTimeThrough) {
          expect(this).toBe(firstSpecContext);
          firstTimeThrough = false;
        } else {
          expect(this).toBe(secondSpecContext);
        }
      });
    });

    env.execute();
  });

  it("calls associated befores/its/afters with the same 'this' for an async spec", function(done) {
    var env = new j$.Env();

    env.addReporter({jasmineDone: done});

    env.describe("with an async spec", function() {
      var specContext;

      env.beforeEach(function() {
        specContext = this;
        expect(this).toEqual({});
      });

      env.it("sync spec", function(underTestCallback) {
        expect(this).toBe(specContext);
        underTestCallback();
      });

      env.afterEach(function() {
        expect(this).toBe(specContext);
      });
    });

    env.execute();
  });

  it("Allows specifying which specs and suites to run", function(done) {
    var env = new j$.Env(),
        calls = [],
        suiteCallback = jasmine.createSpy('suite callback'),
        firstSpec,
        secondSuite;

    var assertions = function() {
      expect(calls).toEqual([
        'third spec',
        'first spec'
      ]);
      expect(suiteCallback).toHaveBeenCalled();
      done();
    };

    env.addReporter({jasmineDone: assertions, suiteDone: suiteCallback});

    env.describe("first suite", function() {
      firstSpec = env.it("first spec", function() {
        calls.push('first spec');
      });
      env.it("second spec", function() {
        calls.push('second spec');
      });
    });

    secondSuite = env.describe("second suite", function() {
      env.it("third spec", function() {
        calls.push('third spec');
      });
    });

    env.execute([secondSuite.id, firstSpec.id]);
  });

  describe("data driven testing", function() {

    it("Allows single arguments", function(done) {
      var env = new j$.Env(),
          calls = [],
          suiteCallback = jasmine.createSpy('suite callback'),
          specs, suite;

      var assertions = function() {
        expect(calls).toEqual([1, 2, 3]);
        expect(suiteCallback).toHaveBeenCalled();
        done();
      };

      env.addReporter({jasmineDone: assertions, suiteDone: suiteCallback});

      suite = env.describe("data-driven testing", function() {
        specs = env.all("data-driven tests work", [1,2,3], function(x) {
          calls.push(x);
        });
      });

      expect(specs.length).toBe(3);
      expect(specs[0].description).toBe("data-driven tests work (Variant #0 <1>)");
      expect(specs[1].description).toBe("data-driven tests work (Variant #1 <2>)");
      expect(specs[2].description).toBe("data-driven tests work (Variant #2 <3>)");

      env.execute([suite.id]);
    });

    it("Allows multiple arguments", function(done) {
      var env = new j$.Env(),
          a = [],
          b = [],
          suiteCallback = jasmine.createSpy('suite callback'),
          specs, suite;

      var assertions = function() {
        expect(a).toEqual([1, 2, 3]);
        expect(b).toEqual([-6, 3, 4]);
        expect(suiteCallback).toHaveBeenCalled();
        done();
      };

      env.addReporter({jasmineDone: assertions, suiteDone: suiteCallback});

      suite = env.describe("data-driven testing", function() {
        specs = env.all("data-driven tests can have multiple arguments", [
          [1,-6],
          [2, 3],
          [3, 4]
        ], function(x, y) {
          a.push(x);
          b.push(y);
        });
      });

      expect(specs.length).toBe(3);
      expect(specs[0].description).toBe("data-driven tests can have multiple arguments (Variant #0 <1, -6>)");
      expect(specs[1].description).toBe("data-driven tests can have multiple arguments (Variant #1 <2, 3>)");
      expect(specs[2].description).toBe("data-driven tests can have multiple arguments (Variant #2 <3, 4>)");

      env.execute();
    });

    it("maintains the reference to 'this'", function(done) {
      var env = new j$.Env(),
          calls = 0;

      var assertions = function() {
        expect(calls).toBe(2);
        done();
      };

      env.addReporter({jasmineDone: assertions});

      env.beforeEach(function() {
        this.x = 12;
      });

      env.all("data-driven tests", [2, 3], function(a) {
        expect(this.x).toBe(12);
        calls++;
      });

      env.execute();
    });

    describe("Does not create specs when", function() {

      it("One of the argument groups in the dataset does not have enough values", function() {
        var env = new j$.Env(),
            expectedError = new Error("Expected 2 argument(s). Found 1 at index 1 (data-driven test fail)");

        expectedError.name = "Jasmine.ArgumentCountMismatchError";

        expect(function() {
          env.all("data-driven test fail", [ [1,2], [1] ], function(x, y) { });
        }).toThrow(expectedError);
      });

      it("The (fn argument count) > (dataset argument count + 1)", function() {
        var env = new j$.Env(),
            expectedError = new Error("Expecting data driven spec to accept 2 arguments, but 4 arguments are specified in the dataset at index 0 (data-driven test fail)");

        expectedError.name = "Jasmine.ArgumentCountMismatchError";

        expect(function() {
          env.all("data-driven test fail", [ [1,2], [4,6] ], function(a, b, c, d) { });
        }).toThrow(expectedError);
      });

      it("The (fn argument count) < (dataset argument count)", function() {
        var env = new j$.Env(),
            expectedError = new Error("Expecting data driven spec to accept 2 arguments, but 1 argument is specified in the dataset at index 0 (data-driven test fail)");

        expectedError.name = "Jasmine.ArgumentCountMismatchError";

        expect(function() {
          env.all("data-driven test fail", [ [1,2], [4,7] ], function(x) { });
        }).toThrow(expectedError);
      });

    });

    it("Creates asynchronous specs when the (fn argument count) == (dataset argument count + 1)", function(done) {
      var env = new j$.Env(),
          mutatedVar,
          a = [],
          b = [];

      var assertions = function() {
        if (a.length < 2) return;

        expect(a).toEqual([1, -3]);
        expect(b).toEqual([2, 4]);
        expect(mutatedVar).toBe(3);
        done();
      };

      env.describe("tests", function() {
        env.beforeEach(function() {
          mutatedVar = 2;
        });

        env.all("async spec",
          [
            [ 1, 2],
            [-3, 4]
          ],
          function(x, y, underTestCallback) {
            setTimeout(function() {
              expect(mutatedVar).toEqual(2);
              a.push(x);
              b.push(y);
              underTestCallback();
              assertions();
            }, 0);
          }
        );

        env.it("after async spec", function() {
          mutatedVar = 3;
        });
      });

      env.execute();
    });

    all("Data driven test definitions throw errors with invalid datasets",
      [ null, undefined, NaN, false, true, "", [[]], {} ],
      function(values) {
        var env = new j$.Env(),
            expectedError = new Error("No arguments for a data-driven test were provided (epic failures)");

        expectedError.name = "Jasmine.ArgumentsMissingError";

        expect(function() {
          env.all("epic failures", values, function(x) { });
        }).toThrow(expectedError);
      }
    );

    it("Allows specifying which variant should be run", function(done) {
      var env = new j$.Env(),
          calls = [],
          suiteCallback = jasmine.createSpy('suite callback'),
          specs, suite;

      // TODO: Is this correct?
      var assertions = function() {
        expect(calls).toEqual([ 2 ]);
        expect(suiteCallback).not.toHaveBeenCalled();
        done();
      };

      env.addReporter({jasmineDone: assertions, suiteDone: suiteCallback});

      suite = env.describe("tests", function() {
        specs = env.all("specify variant", [1, 2], function(x) {
          calls.push(x);
        });
      });

      env.execute([ specs[1].id ]);
    });

    it("Should return a variant specific full name", function() {
      var env = new j$.Env({global: { setTimeout: setTimeout }}),
        topLevelSpecs, nestedSpecs, doublyNestedSpecs;

      env.describe("my tests", function() {
        topLevelSpecs = env.all("are top level", [1, 2], function(x) {});

        env.describe("are sometimes", function() {
          nestedSpecs = env.all("singly nested", [1, 2], function(x) {});

          env.describe("even", function() {
            doublyNestedSpecs = env.all("doubly nested", [1, 2], function(x) {});
          });
        });
      });

      expect(topLevelSpecs[0].getFullName())
        .toBe("my tests are top level (Variant #0 <1>)");
      expect(topLevelSpecs[1].getFullName())
        .toBe("my tests are top level (Variant #1 <2>)");

      expect(nestedSpecs[0].getFullName())
        .toBe("my tests are sometimes singly nested (Variant #0 <1>)");
      expect(nestedSpecs[1].getFullName())
        .toBe("my tests are sometimes singly nested (Variant #1 <2>)");

      expect(doublyNestedSpecs[0].getFullName())
        .toBe("my tests are sometimes even doubly nested (Variant #0 <1>)");
      expect(doublyNestedSpecs[1].getFullName())
        .toBe("my tests are sometimes even doubly nested (Variant #1 <2>)");
    });

  });

  it("Functions can be spied on and have their calls tracked", function () {
      var env = new j$.Env();

      var originalFunctionWasCalled = false;
      var subject = { spiedFunc: function() { originalFunctionWasCalled = true; } };

      var spy = env.spyOn(subject, 'spiedFunc');

      expect(subject.spiedFunc).toEqual(spy);

      expect(subject.spiedFunc.calls.any()).toEqual(false);
      expect(subject.spiedFunc.calls.count()).toEqual(0);

      subject.spiedFunc('foo');

      expect(subject.spiedFunc.calls.any()).toEqual(true);
      expect(subject.spiedFunc.calls.count()).toEqual(1);
      expect(subject.spiedFunc.calls.mostRecent().args).toEqual(['foo']);
      expect(subject.spiedFunc.calls.mostRecent().object).toEqual(subject);
      expect(originalFunctionWasCalled).toEqual(false);

      subject.spiedFunc('bar');
      expect(subject.spiedFunc.calls.count()).toEqual(2);
      expect(subject.spiedFunc.calls.mostRecent().args).toEqual(['bar']);
  });

  it("Mock clock can be installed and used in tests", function(done) {
    var globalSetTimeout = jasmine.createSpy('globalSetTimeout'),
        delayedFunctionForGlobalClock = jasmine.createSpy('delayedFunctionForGlobalClock'),
        delayedFunctionForMockClock = jasmine.createSpy('delayedFunctionForMockClock'),
        env = new j$.Env({global: { setTimeout: globalSetTimeout }});

    var assertions = function() {
      expect(delayedFunctionForMockClock).toHaveBeenCalled();
      expect(globalSetTimeout).toHaveBeenCalledWith(delayedFunctionForGlobalClock, 100);

      done();
    };

    env.addReporter({ jasmineDone: assertions });

    env.describe("tests", function() {
      env.it("test with mock clock", function() {
        env.clock.install();
        env.clock.setTimeout(delayedFunctionForMockClock, 100);
        env.clock.tick(100);
        env.clock.uninstall();
      });
      env.it("test without mock clock", function() {
        env.clock.setTimeout(delayedFunctionForGlobalClock, 100);
      });
    });

    expect(globalSetTimeout).not.toHaveBeenCalled();
    expect(delayedFunctionForMockClock).not.toHaveBeenCalled();

    env.execute();
  });

  it("should run async specs in order, waiting for them to complete", function(done) {
    var env = new j$.Env(), mutatedVar;

    env.describe("tests", function() {
      env.beforeEach(function() {
        mutatedVar = 2;
      });

      env.it("async spec", function(underTestCallback) {
        setTimeout(function() {
          expect(mutatedVar).toEqual(2);
          underTestCallback();
          done();
        }, 0);
      });

      env.it("after async spec", function() {
        mutatedVar = 3;
      });
    });

    env.execute();
  });

  describe("with a mock clock", function() {
    var originalTimeout;

    beforeEach(function() {
      originalTimeout = j$.DEFAULT_TIMEOUT_INTERVAL;
      jasmine.getEnv().clock.install();
    });

    afterEach(function() {
      jasmine.getEnv().clock.uninstall();
      j$.DEFAULT_TIMEOUT_INTERVAL = originalTimeout;
    });

    it("should wait a specified interval before failing specs haven't called done yet", function(done) {
      var env = new j$.Env(),
          reporter = jasmine.createSpyObj('fakeReporter', [ "specDone" ]);

      reporter.specDone.and.callFake(function() {
        expect(reporter.specDone).toHaveBeenCalledWith(jasmine.objectContaining({status: 'failed'}));
        done();
      });

      env.addReporter(reporter);
      j$.DEFAULT_TIMEOUT_INTERVAL = 8414;

      env.it("async spec that doesn't call done", function(underTestCallback) {
        env.expect(true).toBeTruthy();
        jasmine.getEnv().clock.tick(8415);
      });

      env.execute();
    });
  });

  // TODO: something is wrong with this spec
  it("should report as expected", function(done) {
    var env = new j$.Env(),
        reporter = jasmine.createSpyObj('fakeReporter', [
          "jasmineStarted",
          "jasmineDone",
          "suiteStarted",
          "suiteDone",
          "specStarted",
          "specDone"
        ]);

    reporter.jasmineDone.and.callFake(function() {
      expect(reporter.jasmineStarted).toHaveBeenCalledWith({
        totalSpecsDefined: 3
      });
      var suiteResult = reporter.suiteStarted.calls.first().args[0];
      expect(suiteResult.description).toEqual("A Suite");

      done();
    });

    env.addReporter(reporter);

    env.describe("A Suite", function() {
      env.it("with a top level spec", function() {
        env.expect(true).toBe(true);
      });
      env.describe("with a nested suite", function() {
        env.xit("with a pending spec", function() {
          env.expect(true).toBe(true);
        });
        env.it("with a spec", function() {
          env.expect(true).toBe(false);
        });
      });
    });

    env.execute();
  });

  it("should be possible to get full name from a spec", function() {
    var env = new j$.Env({global: { setTimeout: setTimeout }}),
        topLevelSpec, nestedSpec, doublyNestedSpec;

    env.describe("my tests", function() {
      topLevelSpec = env.it("are sometimes top level", function() {
      });
      env.describe("are sometimes", function() {
        nestedSpec = env.it("singly nested", function() {
        });
        env.describe("even", function() {
          doublyNestedSpec = env.it("doubly nested", function() {
          });
        });
      });
    });

    expect(topLevelSpec.getFullName()).toBe("my tests are sometimes top level");
    expect(nestedSpec.getFullName()).toBe("my tests are sometimes singly nested");
    expect(doublyNestedSpec.getFullName()).toBe("my tests are sometimes even doubly nested");
  });

  it("Custom equality testers should be per spec", function(done) {
    var env = new j$.Env({global: { setTimeout: setTimeout }}),
        reporter = jasmine.createSpyObj('fakeReporter', [
          "jasmineStarted",
          "jasmineDone",
          "suiteStarted",
          "suiteDone",
          "specStarted",
          "specDone"
        ]);

    reporter.jasmineDone.and.callFake(function() {
      var firstSpecResult = reporter.specDone.calls.first().args[0],
          secondSpecResult = reporter.specDone.calls.mostRecent().args[0];

      expect(firstSpecResult.status).toEqual("passed");
      expect(secondSpecResult.status).toEqual("failed");

      done();
    });

    env.addReporter(reporter);

    env.describe("testing custom equality testers", function() {
      env.it("with a custom tester", function() {
        env.addCustomEqualityTester(function(a, b) { return true; });
        env.expect("a").toEqual("b");
      });

      env.it("without a custom tester", function() {
        env.expect("a").toEqual("b");
      });
    });

    env.execute();
  });

  it("Custom matchers should be per spec", function() {
    var env = new j$.Env({global: { setTimeout: setTimeout }}),
        matchers = {
          toFoo: function() {}
        },
        reporter = jasmine.createSpyObj('fakeReporter', [
          "jasmineStarted",
          "jasmineDone",
          "suiteStarted",
          "suiteDone",
          "specStarted",
          "specDone"
        ]);

    env.addReporter(reporter);

    env.describe("testing custom matchers", function() {
      env.it("with a custom matcher", function() {
        env.addMatchers(matchers);
        expect(env.expect().toFoo).toBeDefined();
      });

      env.it("without a custom matcher", function() {
        expect(env.expect().toFoo).toBeUndefined();
      });
    });

    env.execute();
  });

  it("Custom equality testers for toContain should be per spec", function(done) {
    var env = new j$.Env({global: { setTimeout: setTimeout }}),
        reporter = jasmine.createSpyObj('fakeReporter', [
          "jasmineStarted",
          "jasmineDone",
          "suiteStarted",
          "suiteDone",
          "specStarted",
          "specDone"
        ]);

    reporter.jasmineDone.and.callFake(function() {
      var firstSpecResult = reporter.specDone.calls.first().args[0],
          secondSpecResult = reporter.specDone.calls.mostRecent().args[0];

      expect(firstSpecResult.status).toEqual("passed");
      expect(secondSpecResult.status).toEqual("failed");

      done();
    });

    env.addReporter(reporter);

    env.describe("testing custom equality testers", function() {
      env.it("with a custom tester", function() {
        env.addCustomEqualityTester(function(a, b) { return true; });
        env.expect(["a"]).toContain("b");
      });

      env.it("without a custom tester", function() {
        env.expect("a").toContain("b");
      });
    });

    env.execute();
  });
});

