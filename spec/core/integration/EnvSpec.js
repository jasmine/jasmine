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
        calls.push('an outer spec');
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

  it("calls associated beforeAlls/afterAlls only once per suite", function(done) {
    var env = new j$.Env(),
        before = jasmine.createSpy('beforeAll'),
        after = jasmine.createSpy('afterAll');

    env.addReporter({
      jasmineDone: function() {
        expect(after).toHaveBeenCalled();
        expect(after.calls.count()).toBe(1);
        expect(before.calls.count()).toBe(1);
        done();
      }
    });

    env.describe("with beforeAll and afterAll", function() {
      env.it("spec", function() {
        expect(before).toHaveBeenCalled();
        expect(after).not.toHaveBeenCalled();
      });

      env.it("another spec", function() {
        expect(before).toHaveBeenCalled();
        expect(after).not.toHaveBeenCalled();
      });

      env.beforeAll(before);
      env.afterAll(after);
    });

    env.execute();
  });

  it("calls associated beforeAlls/afterAlls only once per suite for async", function(done) {
    var env = new j$.Env(),
        before = jasmine.createSpy('beforeAll'),
        after = jasmine.createSpy('afterAll');

    env.addReporter({
      jasmineDone: function() {
        expect(after).toHaveBeenCalled();
        expect(after.calls.count()).toBe(1);
        expect(before.calls.count()).toBe(1);
        done();
      }
    });

    env.describe("with beforeAll and afterAll", function() {
      env.it("spec", function() {
        expect(before).toHaveBeenCalled();
        expect(after).not.toHaveBeenCalled();
      });

      env.it("another spec", function() {
        expect(before).toHaveBeenCalled();
        expect(after).not.toHaveBeenCalled();
      });

      env.beforeAll(function(beforeCallbackUnderTest) {
        before();
        beforeCallbackUnderTest();
      });

      env.afterAll(function(afterCallbackUnderTest) {
        after();
        afterCallbackUnderTest();
      });
    });

    env.execute();
  });

  it("calls associated beforeAlls/afterAlls with the cascaded 'this'", function(done) {
    var env = new j$.Env();

    env.addReporter({jasmineDone: done});

    env.describe("with beforeAll and afterAll", function() {
      env.beforeAll(function() {
        this.x = 1;
      });

      env.it("has an x at the root", function() {
        expect(this.x).toBe(1);
      });

      env.describe("child that deletes", function() {
        env.beforeAll(function() {
          expect(this.x).toBe(1);
          delete this.x;
        });

        env.it("has no x", function() {
          expect(this.x).not.toBeDefined();
        });
      });

      env.describe("child should still have x", function() {
        env.beforeAll(function(innerDone) {
          expect(this.x).toBe(1);
          innerDone();
        });

        env.it("has an x", function() {
          expect(this.x).toBe(1);
          delete this.x;
        });

        env.it("still has an x", function() {
          expect(this.x).toBe(1);
        });

        env.it("adds a y", function() {
          this.y = 2;
          expect(this.y).toBe(2);
        });

        env.it("doesn't have y that was added in sibling", function() {
          expect(this.y).not.toBeDefined();
        });
      });
    });

    env.execute();
  });

  it("fails all underlying specs when the beforeAll fails", function (done) {
    var env = new j$.Env(),
      reporter = jasmine.createSpyObj('fakeReporter', [ "specDone", "jasmineDone" ]);

    reporter.jasmineDone.and.callFake(function() {
      expect(reporter.specDone.calls.count()).toEqual(2);

      expect(reporter.specDone.calls.argsFor(0)[0])
        .toEqual(jasmine.objectContaining({status: 'failed'}));
      expect(reporter.specDone.calls.argsFor(0)[0].failedExpectations[0].message)
        .toEqual("Expected 1 to be 2.");

      expect(reporter.specDone.calls.argsFor(1)[0])
        .toEqual(jasmine.objectContaining({status: 'failed'}));
      expect(reporter.specDone.calls.argsFor(1)[0].failedExpectations[0].message)
        .toEqual("Expected 1 to be 2.");
      done();
    });

    env.addReporter(reporter);

    env.describe('A suite', function(){
      env.beforeAll(function() {
        env.expect(1).toBe(2);
      });

      env.it("spec that will be failed", function() {
      });

      env.describe("nesting", function() {
        env.it("another spec to fail", function() {
        });
      });
    });

    env.execute();
  });

  it("reports when an afterAll fails an expectation", function(done) {
    var env = new j$.Env(),
      reporter = jasmine.createSpyObj('fakeReport', ['jasmineDone','afterAllEvent']);

    reporter.jasmineDone.and.callFake(function() {
      expect(reporter.afterAllEvent).toHaveBeenCalledWith('Expectation failed: Expected 1 to equal 2.');
      expect(reporter.afterAllEvent).toHaveBeenCalledWith('Expectation failed: Expected 2 to equal 3.');
      done();
    });

    env.addReporter(reporter);

    env.describe('my suite', function() {
      env.it('my spec', function() {
      });

      env.afterAll(function() {
        env.expect(1).toEqual(2);
        env.expect(2).toEqual(3);
      });
    });

    env.execute();
  });


  it("only reports afterAll expectation failures once, regardless of suite children", function(done) {
    var env = new j$.Env(),
      reporter = jasmine.createSpyObj('fakeReport', ['jasmineDone','afterAllEvent']);

    reporter.jasmineDone.and.callFake(function() {
      expect(reporter.afterAllEvent.calls.count()).toEqual(1);
      expect(reporter.afterAllEvent).toHaveBeenCalledWith('Expectation failed: Expected 1 to equal 2.');
      done();
    });

    env.addReporter(reporter);

    env.describe('my suite', function() {
      env.it('my spec', function() {
      });

      env.it('my spec2', function() {
      });

      env.describe('nested suite', function(){
        env.it('my spec3', function() {
        });
      });

      env.afterAll(function() {
        env.expect(1).toEqual(2);
      });
    });

    env.execute();
  });

  it("reports when afterAll throws an exception", function(done) {
    var env = new j$.Env(),
      error = new Error('After All Exception'),
      reporter = jasmine.createSpyObj('fakeReport', ['jasmineDone','afterAllEvent']);

    reporter.jasmineDone.and.callFake(function() {
      expect(reporter.afterAllEvent.calls.count()).toEqual(1);
      expect(reporter.afterAllEvent).toHaveBeenCalledWith('Error thrown: After All Exception');
      done();
    });

    env.addReporter(reporter);

    env.describe('my suite', function() {
      env.it('my spec', function() {
      });

      env.afterAll(function() {
        throw error;
      });
    });

    env.execute();
  });

  it("reports when an async afterAll fails an expectation", function(done) {
    var env = new j$.Env(),
      reporter = jasmine.createSpyObj('fakeReport', ['jasmineDone','afterAllEvent']);

    reporter.jasmineDone.and.callFake(function() {
      expect(reporter.afterAllEvent).toHaveBeenCalledWith('Expectation failed: Expected 1 to equal 2.');
      done();
    });

    env.addReporter(reporter);

    env.describe('my suite', function() {
      env.it('my spec', function() {
      });

      env.afterAll(function(afterAllDone) {
        env.expect(1).toEqual(2);
        afterAllDone();
      });
    });

    env.execute();
  });

  it("reports when an async afterAll throws an exception", function(done) {
    var env = new j$.Env(),
      error = new Error('After All Exception'),
      reporter = jasmine.createSpyObj('fakeReport', ['jasmineDone','afterAllEvent']);


    reporter.jasmineDone.and.callFake(function() {
      expect(reporter.afterAllEvent).toHaveBeenCalled();
      done();
    });

    env.addReporter(reporter);

    env.describe('my suite', function() {
      env.it('my spec', function() {
      });

      env.afterAll(function(afterAllDone) {
        throw error;
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

  it('runs before and after all functions for focused specs', function(done) {
    var env = new j$.Env(),
      calls = [],
      first_spec,
      second_spec;

    var assertions = function() {
      expect(calls).toEqual([
        "before",
        "first spec",
        "after",
        "before",
        "second spec",
        "after"
      ]);
      done();
    };

    env.addReporter({jasmineDone: assertions});

    env.describe("first suite", function() {
      env.beforeAll(function() {
        calls.push("before");
      });
      env.afterAll(function() {
        calls.push("after")
      });
      first_spec = env.it("spec", function() {
        calls.push('first spec');
      });
      second_spec = env.it("spec 2", function() {
        calls.push("second spec");
      });
    });

    env.execute([first_spec.id, second_spec.id]);
  });

  it("Functions can be spied on and have their calls tracked", function (done) {
      var env = new j$.Env();

      var originalFunctionWasCalled = false;
      var subject = { spiedFunc: function() { originalFunctionWasCalled = true; } };

      env.addReporter({jasmineDone: done});

      env.it("works with spies", function() {
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

      env.execute();
  });

  it('removes all spies added in a spec after the spec is complete', function(done) {
    var env = new j$.Env(),
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

  it('removes all spies added in a suite after the suite is complete', function(done) {
    var env = new j$.Env(),
      originalFoo = function() {},
      testObj = {
        foo: originalFoo
      };

      env.describe('test suite', function() {
        env.beforeAll(function() { env.spyOn(testObj, 'foo');})

        env.it('spec 0', function() {
          expect(j$.isSpy(testObj.foo)).toBe(true);
        });

        env.it('spec 1', function() {
          expect(j$.isSpy(testObj.foo)).toBe(true);
        });
      });

      env.describe('another suite', function() {
        env.it('spec 2', function() {
          expect(j$.isSpy(testObj.foo)).toBe(false);
        });
      });

    env.addReporter({ jasmineDone: done });

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
      jasmine.clock().install();
    });

    afterEach(function() {
      jasmine.clock().uninstall();
      j$.DEFAULT_TIMEOUT_INTERVAL = originalTimeout;
    });

    it("should wait a specified interval before failing specs haven't called done yet", function(done) {
      var env = new j$.Env(),
          reporter = jasmine.createSpyObj('fakeReporter', [ "specDone", "jasmineDone" ]);

      reporter.specDone.and.callFake(function() {
        expect(reporter.specDone).toHaveBeenCalledWith(jasmine.objectContaining({status: 'failed'}));
      });

      reporter.jasmineDone.and.callFake(function() {
        expect(reporter.jasmineDone.calls.count()).toEqual(1);
        done();
      });

      env.addReporter(reporter);
      j$.DEFAULT_TIMEOUT_INTERVAL = 8414;

      env.it("async spec that doesn't call done", function(underTestCallback) {
        env.expect(true).toBeTruthy();
        jasmine.clock().tick(8416);
      });

      env.execute();
    });

    it("should wait a specified interval before failing beforeAll's and their associated specs that haven't called done", function(done) {
      var env = new j$.Env(),
        reporter = jasmine.createSpyObj('fakeReporter', [ "specDone", "jasmineDone" ]);

      reporter.jasmineDone.and.callFake(function() {
        expect(reporter.specDone.calls.count()).toEqual(2);
        expect(reporter.specDone.calls.argsFor(0)[0]).toEqual(jasmine.objectContaining({status: 'failed'}));
        expect(reporter.specDone.calls.argsFor(1)[0]).toEqual(jasmine.objectContaining({status: 'failed'}));
        done();
      });

      env.addReporter(reporter);
      j$.DEFAULT_TIMEOUT_INTERVAL = 1290;

      env.beforeAll(function(done) {
        jasmine.clock().tick(1290);
      });

      env.it("spec that will be failed", function() {
      });

      env.describe("nesting", function() {
        env.it("another spec to fail", function() {
        });
      });

      env.execute();
    });

    it("should wait the specified interval before reporting an afterAll that fails to call done", function(done) {
      var env = new j$.Env(),
      reporter = jasmine.createSpyObj('fakeReport', ['jasmineDone','afterAllEvent']);

      reporter.jasmineDone.and.callFake(function() {
        expect(reporter.afterAllEvent).toHaveBeenCalledWith(jasmine.any(String));
        done();
      });

      env.addReporter(reporter);
      j$.DEFAULT_TIMEOUT_INTERVAL = 3000;

      env.describe('my suite', function() {
        env.it('my spec', function() {
        });

        env.afterAll(function(innerDone) {
          jasmine.clock().tick(3001);
          innerDone();
        });
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
          "jasmineDone",
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

  it("Custom equality testers should be per suite", function(done) {
    var env = new j$.Env({global: { setTimeout: setTimeout }}),
        reporter = jasmine.createSpyObj('fakeReporter', [
          "jasmineDone",
          "specDone"
        ]);

    reporter.jasmineDone.and.callFake(function() {
      var firstSpecResult = reporter.specDone.calls.first().args[0],
          secondSpecResult = reporter.specDone.calls.argsFor(0)[0],
          thirdSpecResult = reporter.specDone.calls.mostRecent().args[0];

      expect(firstSpecResult.status).toEqual("passed");
      expect(secondSpecResult.status).toEqual("passed");
      expect(thirdSpecResult.status).toEqual("failed");

      done();
    });

    env.addReporter(reporter);

    env.describe("testing custom equality testers", function() {
      env.beforeAll(function() { env.addCustomEqualityTester(function(a, b) { return true; }); });

      env.it("with a custom tester", function() {
        env.expect("a").toEqual("b");
      });

      env.it("with the same custom tester", function() {
        env.expect("a").toEqual("b");
      });
    });

    env.describe("another suite", function() {
      env.it("without the custom tester", function(){
        env.expect("a").toEqual("b");
      });
    });

    env.execute();
  });

  it("Custom equality testers for toContain should be per spec", function(done) {
    var env = new j$.Env({global: { setTimeout: setTimeout }}),
        reporter = jasmine.createSpyObj('fakeReporter', [
          "jasmineDone",
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
        env.expect(["a"]).toContain("b");
      });
    });

    env.execute();
  });

  it("Custom equality testers for toContain should be per suite", function(done) {
    var env = new j$.Env({global: { setTimeout: setTimeout }}),
        reporter = jasmine.createSpyObj('fakeReporter', [
          "jasmineDone",
          "specDone"
        ]);

    reporter.jasmineDone.and.callFake(function() {
      var firstSpecResult = reporter.specDone.calls.first().args[0],
          secondSpecResult = reporter.specDone.calls.argsFor(1)[0],
          thirdSpecResult = reporter.specDone.calls.mostRecent().args[0];

      expect(firstSpecResult.status).toEqual("passed");
      expect(secondSpecResult.status).toEqual("passed");
      expect(thirdSpecResult.status).toEqual("failed");

      done();
    });

    env.addReporter(reporter);

    env.describe("testing custom equality testers", function() {
      env.beforeAll(function() { env.addCustomEqualityTester(function(a, b) { return true; })});

      env.it("with a custom tester", function() {
        env.expect(["a"]).toContain("b");
      });

      env.it("also with the custom tester", function() {
        env.expect(["a"]).toContain("b");
      });
    });

    env.describe("another suite", function() {
      env.it("without the custom tester", function() {
        env.expect(["a"]).toContain("b");
      });
    });

    env.execute();
  });

  it("Custom matchers should be per spec", function(done) {
    var env = new j$.Env({global: { setTimeout: setTimeout }}),
        matchers = {
          toFoo: function() {}
        };

    env.describe("testing custom matchers", function() {
      env.it("with a custom matcher", function() {
        env.addMatchers(matchers);
        expect(env.expect().toFoo).toBeDefined();
      });

      env.it("without a custom matcher", function() {
        expect(env.expect().toFoo).toBeUndefined();
      });
    });

    env.addReporter({jasmineDone: done});

    env.execute();
  });

  it("Custom matchers should be per suite", function(done) {
    var env = new j$.Env({global: { setTimeout: setTimeout }}),
        matchers = {
          toFoo: function() {}
        };

    env.describe("testing custom matchers", function() {
      env.beforeAll(function() { env.addMatchers(matchers); });

      env.it("with a custom matcher", function() {
        expect(env.expect().toFoo).toBeDefined();
      });

      env.it("with the same custom matcher", function() {
        expect(env.expect().toFoo).toBeDefined();
      });
    });

    env.describe("another suite", function() {
      env.it("no longer has the custom matcher", function() {
        expect(env.expect().toFoo).not.toBeDefined();
      });
    });

    env.addReporter({jasmineDone: done});

    env.execute();
  });

  it('throws an exception if you try to create a spy outside of a runnable', function (done) {
    var env = new j$.Env(),
      obj = {fn: function () {}},
      exception;

    env.describe("a suite", function () {
      try {
        env.spyOn(obj, 'fn');
      } catch(e) {
        exception = e;
      }
    });

    var assertions = function() {
      expect(exception.message).toBe('Spies must be created in a before function or a spec');
      done();
    };

    env.addReporter({jasmineDone: assertions});

    env.execute();
  });

  it('throws an exception if you try to add a matcher outside of a runnable', function (done) {
    var env = new j$.Env(),
      obj = {fn: function () {}},
      exception;

    env.describe("a suite", function () {
      try {
        env.addMatchers({myMatcher: function(actual,expected){return false;}});
      } catch(e) {
        exception = e;
      }
    });

    var assertions = function() {
      expect(exception.message).toBe('Matchers must be added in a before function or a spec');
      done();
    };

    env.addReporter({jasmineDone: assertions});

    env.execute();
  });

  it('throws an exception if you try to add a custom equality outside of a runnable', function (done) {
    var env = new j$.Env(),
      obj = {fn: function () {}},
      exception;

    env.describe("a suite", function () {
      try {
        env.addCustomEqualityTester(function(first, second) {return true;});
      } catch(e) {
        exception = e;
      }
    });

    var assertions = function() {
      expect(exception.message).toBe('Custom Equalities must be added in a before function or a spec');
      done();
    };

    env.addReporter({jasmineDone: assertions});

    env.execute();
  });
});
