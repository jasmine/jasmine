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
describe("Env (integration)", function() {

  it("Suites execute as expected (no nesting)", function() {
    var env = new j$.Env(),
      calls = [];

    env.describe("A Suite", function() {
      env.it("with a spec", function() {
        calls.push("with a spec");
      });
      env.it("and another spec", function() {
        calls.push("and another spec");
      });
    });

    env.execute();

    expect(calls).toEqual([
      "with a spec",
      "and another spec"
    ]);
  });

  it("Nested Suites execute as expected", function() {
    var env = new j$.Env(),
      calls = [];

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

    expect(calls).toEqual([
      'an outer spec',
      'an inner spec',
      'another inner spec'
    ]);

  });

  it("Multiple top-level Suites execute as expected", function() {
    var env = new j$.Env(),
      calls = [];

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

    expect(calls).toEqual([
      'an outer spec',
      'an inner spec',
      'another inner spec',
      'a 2nd outer spec'
    ]);
  });

  it("Mock clock can be installed and used in tests", function() {
    var globalSetTimeout = jasmine.createSpy('globalSetTimeout'),
      delayedFunctionForGlobalClock = jasmine.createSpy('delayedFunctionForGlobalClock'),
      delayedFunctionForMockClock = jasmine.createSpy('delayedFunctionForMockClock'),
      env = new j$.Env({global: { setTimeout: globalSetTimeout }});

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

    expect(delayedFunctionForMockClock).toHaveBeenCalled();
    expect(globalSetTimeout).toHaveBeenCalledWith(delayedFunctionForGlobalClock, 100);
  });

  // TODO: something is wrong with this spec
  it("should report as expected", function() {
    var env = new j$.Env(),
      reporter = jasmine.createSpyObj('fakeReproter', [
        "jasmineStarted",
        "jasmineDone",
        "suiteStarted",
        "suiteDone",
        "specStarted",
        "specDone"
      ]);

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

    expect(reporter.jasmineStarted).toHaveBeenCalledWith({
      totalSpecsDefined: 3
    });
    var suiteResult = reporter.suiteStarted.calls[0].args[0];
    expect(suiteResult.description).toEqual("A Suite");
    expect(reporter.jasmineDone).toHaveBeenCalled();
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

  it("Custom equality testers should be per spec", function() {
    var env = new j$.Env({global: { setTimeout: setTimeout }}),
      reporter = jasmine.createSpyObj('fakeReproter', [
        "jasmineStarted",
        "jasmineDone",
        "suiteStarted",
        "suiteDone",
        "specStarted",
        "specDone"
      ]);

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

    var firstSpecResult = reporter.specDone.argsForCall[0][0],
      secondSpecResult = reporter.specDone.argsForCall[1][0];

    expect(firstSpecResult.status).toEqual("passed");
    expect(secondSpecResult.status).toEqual("failed");
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

  it("Custom equality testers for toContain should be per spec", function() {
    var env = new j$.Env({global: { setTimeout: setTimeout }}),
      reporter = jasmine.createSpyObj('fakeReproter', [
        "jasmineStarted",
        "jasmineDone",
        "suiteStarted",
        "suiteDone",
        "specStarted",
        "specDone"
      ]);

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

    var firstSpecResult = reporter.specDone.argsForCall[0][0],
      secondSpecResult = reporter.specDone.argsForCall[1][0];

    expect(firstSpecResult.status).toEqual("passed");
    expect(secondSpecResult.status).toEqual("failed");
  });
});
