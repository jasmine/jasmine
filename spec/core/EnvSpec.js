// TODO: Fix these unit tests!
describe("Env", function() {
  var env;
  beforeEach(function() {
    env = new j$.Env();
    env.updateInterval = 0;
  });

  describe('ids', function() {
    it('nextSpecId should return consecutive integers, starting at 0', function() {
      expect(env.nextSpecId()).toEqual(0);
      expect(env.nextSpecId()).toEqual(1);
      expect(env.nextSpecId()).toEqual(2);
    });
  });

  describe("reporting", function() {
    var fakeReporter;

    beforeEach(function() {
      fakeReporter = jasmine.createSpyObj("fakeReporter", ["jasmineStarted"]);
    });

    it("should allow reporters to be registered", function() {
      env.addReporter(fakeReporter);
      env.reporter.jasmineStarted();
      expect(fakeReporter.jasmineStarted).toHaveBeenCalled();
    });
  });
  
  it('removes all spies when env is executed', function(done) {
    originalFoo = function() {},
    testObj = {
      foo: originalFoo
    },
    firstSpec = jasmine.createSpy('firstSpec').and.callFake(function() {
      env.spyOn(testObj, 'foo');
    }),
    secondSpec = jasmine.createSpy('secondSpec').and.callFake(function() {
      expect(testObj.foo).toBe(originalFoo);
    });
    env.describe('test suite', function() {
      env.it('spec 0', firstSpec);
      env.it('spec 1', secondSpec);
    });

    var assertions = function() {
      expect(firstSpec).toHaveBeenCalled();
      expect(secondSpec).toHaveBeenCalled();
      done();
    };

    env.addReporter({ jasmineDone: assertions });

    env.execute();
  });

  describe("#spyOn", function() {
    it("checks for the existance of the object", function() {
      expect(function() {
        env.spyOn(void 0, 'pants');
      }).toThrowError(/could not find an object/);
    });

    it("checks for the existance of the method", function() {
      var subject = {};

      expect(function() {
        env.spyOn(subject, 'pants');
      }).toThrowError(/method does not exist/);
    });

    it("checks if it has already been spied upon", function() {
      var subject = { spiedFunc: function() {} };

      env.spyOn(subject, 'spiedFunc');

      expect(function() {
        env.spyOn(subject, 'spiedFunc');
      }).toThrowError(/has already been spied upon/);
    });

    it("overrides the method on the object and returns the spy", function() {
      var originalFunctionWasCalled = false;
      var subject = { spiedFunc: function() { originalFunctionWasCalled = true; } };

      originalFunc = subject.spiedFunc;
      
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
  });

  describe("#catchException", function() {
    it("returns true if the exception is a pending spec exception", function() {
      env.catchExceptions(false);

      expect(env.catchException(new Error(j$.Spec.pendingSpecExceptionMessage))).toBe(true);
    });

    it("returns false if the exception is not a pending spec exception and not catching exceptions", function() {
      env.catchExceptions(false);

      expect(env.catchException(new Error("external error"))).toBe(false);
      expect(env.catchException(new Error(j$.Spec.pendingSpecExceptionMessage))).toBe(true);
    });
  });

  describe("#pending", function() {
    it("throws the Pending Spec exception", function() {
      expect(function() {
        env.pending();
      }).toThrow(j$.Spec.pendingSpecExceptionMessage);
    });
  });

});

// TODO: move these into a separate file
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
        jasmine.getEnv().clock.tick(8414);
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
      expect(reporter.jasmineDone).toHaveBeenCalled();

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

    expect(topLevelSpec.getFullName()).toBe("my tests are sometimes top level.");
    expect(nestedSpec.getFullName()).toBe("my tests are sometimes singly nested.");
    expect(doublyNestedSpec.getFullName()).toBe("my tests are sometimes even doubly nested.");
  });

  it("Custom equality testers should be per spec", function(done) {
    var env = new j$.Env({global: { setTimeout: setTimeout }}),
        reporter = jasmine.createSpyObj('fakeReproter', [
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
        reporter = jasmine.createSpyObj('fakeReproter', [
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
        reporter = jasmine.createSpyObj('fakeReproter', [
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
