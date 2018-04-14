describe("Env integration", function() {
  beforeEach(function() {
    jasmine.getEnv().registerIntegrationMatchers();
  });

  it("Suites execute as expected (no nesting)", function(done) {
    var env = new jasmineUnderTest.Env(),
        calls = [];

    var assertions = function() {
      expect(calls).toEqual([
        "with a spec",
        "and another spec"
      ]);

      done();
    };

    env.addReporter({ jasmineDone: assertions});
    env.randomizeTests(false);

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
    var env = new jasmineUnderTest.Env(),
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
    env.randomizeTests(false);

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
    var env = new jasmineUnderTest.Env(),
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
    env.randomizeTests(false);


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

  it('explicitly fails a spec', function(done) {
    var env = new jasmineUnderTest.Env(),
        specDone = jasmine.createSpy('specDone');

    env.addReporter({
      specDone: specDone,
      jasmineDone: function() {
        expect(specDone).toHaveBeenCalledWith(jasmine.objectContaining({
          description: 'has a default message',
          failedExpectations: [jasmine.objectContaining({
            message: 'Failed'
          })]
        }));
        expect(specDone).toHaveBeenCalledWith(jasmine.objectContaining({
          description: 'specifies a message',
          failedExpectations: [jasmine.objectContaining({
            message: 'Failed: messy message'
          })]
        }));
        expect(specDone).toHaveBeenCalledWith(jasmine.objectContaining({
          description: 'has a message and stack trace from an Error',
          failedExpectations: [jasmine.objectContaining({
            message: 'Failed: error message',
            stack: {
              asymmetricMatch: function(other) {
                if (!other) {
                  // IE doesn't give us a stacktrace so just ignore it.
                  return true;
                }
                var split = other.split('\n'),
                    firstLine = split[0];
                if (firstLine.indexOf('error message') >= 0) {
                  // Chrome inserts the message and a newline before the first stacktrace line.
                  firstLine = split[1];
                }
                return firstLine.indexOf('EnvSpec') >= 0;
              }
            }
          })]
        }));
        expect(specDone).toHaveBeenCalledWith(jasmine.objectContaining({
          description: 'pretty prints objects',
          failedExpectations: [jasmine.objectContaining({
            message: 'Failed: Object({ prop: \'value\', arr: [ \'works\', true ] })'
          })]
        }));
        done();
      }
    });

    env.describe('failing', function() {
      env.it('has a default message', function() {
        env.fail();
      });

      env.it('specifies a message', function() {
        env.fail('messy message');
      });

      env.it('has a message and stack trace from an Error', function() {
        env.fail(new Error('error message'));
      });

      env.it('pretty prints objects', function() {
        env.fail({prop: 'value', arr: ['works', true]});
      })
    });

    env.execute();
  });

  it("produces an understandable error message when 'fail' is used outside of a current spec", function(done) {
    var env = new jasmineUnderTest.Env(),
        reporter = jasmine.createSpyObj('fakeReporter', ['jasmineDone']);

    reporter.jasmineDone.and.callFake(done);
    env.addReporter(reporter);

    env.describe("A Suite", function() {
      env.it("an async spec that is actually synchronous", function(underTestCallback) {
        underTestCallback();
      });
      expect(function() { env.fail(); }).toThrowError(/'fail' was used when there was no current spec/);
    });

    env.execute();
  });


  it("calls associated befores/specs/afters with the same 'this'", function(done) {
    var env = new jasmineUnderTest.Env();

    env.addReporter({jasmineDone: done});
    env.randomizeTests(false);
    env.describe("tests", function() {
      var firstTimeThrough = true, firstSpecContext, secondSpecContext;

      env.beforeEach(function() {
        if (firstTimeThrough) {
          firstSpecContext = this;
        } else {
          secondSpecContext = this;
        }
        expect(this).toEqual(new jasmineUnderTest.UserContext());
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
    var env = new jasmineUnderTest.Env();

    env.addReporter({jasmineDone: done});

    env.describe("with an async spec", function() {
      var specContext;

      env.beforeEach(function() {
        specContext = this;
        expect(this).toEqual(new jasmineUnderTest.UserContext());
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
    var env = new jasmineUnderTest.Env(),
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
    var env = new jasmineUnderTest.Env(),
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
    var env = new jasmineUnderTest.Env();

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

  it("tags top-level afterAll failures with a type", function(done) {
    var env = new jasmineUnderTest.Env();

    env.addReporter({jasmineDone: function(result) {
      expect(result.failedExpectations[0].globalErrorType).toEqual('afterAll');
      done();
    }});

    env.it('has a spec', function() {});

    env.afterAll(function() {
      throw 'nope';
    });

    env.execute();
  });

  it("does not tag suite afterAll failures with a type", function(done) {
    var env = new jasmineUnderTest.Env(),
      reporter = {
        jasmineDone: function() {
          expect(reporter.suiteDone).toHaveBeenCalled();
          done();
        },
        suiteDone: jasmine.createSpy('suiteDone').and.callFake(function(result) {
          expect(result.failedExpectations[0].globalErrorType).toBeFalsy();
        })
      };

    env.addReporter(reporter);

    env.describe('a suite', function() {
      env.it('has a spec', function() {});

      env.afterAll(function() {
        throw 'nope';
      });
    });

    env.execute();
  });

  it("when the beforeAll fails, error at suite level", function (done) {
    var env = new jasmineUnderTest.Env(),
      reporter = jasmine.createSpyObj('fakeReporter', [ "specDone", "suiteDone", "jasmineDone" ]);

    reporter.jasmineDone.and.callFake(function() {
      expect(reporter.specDone.calls.count()).toEqual(2);
      expect(reporter.specDone).toHaveFailedExpectationsForRunnable('A suite spec that will pass', []);
      expect(reporter.specDone).toHaveFailedExpectationsForRunnable('A suite nesting another spec to pass', []);
      expect(reporter.suiteDone).toHaveFailedExpectationsForRunnable('A suite', ['Expected 1 to be 2.']);

      done();
    });

    env.addReporter(reporter);

    env.describe('A suite', function(){
      env.beforeAll(function() {
        env.expect(1).toBe(2);
      });

      env.it("spec that will pass", function() {
      });

      env.describe("nesting", function() {
        env.it("another spec to pass", function() {
        });
      });
    });

    env.execute();
  });

  it("copes with async failures after done has been called", function(done) {
    var global = {
      setTimeout: function(fn, delay) { setTimeout(fn, delay) },
      clearTimeout: function(fn, delay) { clearTimeout(fn, delay) },
    };
    spyOn(jasmineUnderTest, 'getGlobal').and.returnValue(global);
    var env = new jasmineUnderTest.Env(),
      reporter = jasmine.createSpyObj('fakeReporter', [ "specDone", "jasmineDone", "suiteDone" ]);

    reporter.jasmineDone.and.callFake(function() {
      expect(reporter.specDone).not.toHaveFailedExpectationsForRunnable('A suite fails', ['fail thrown']);
      expect(reporter.suiteDone).toHaveFailedExpectationsForRunnable('A suite', ['fail thrown']);
      done();
    });

    env.addReporter(reporter);

    env.fdescribe('A suite', function() {
      env.it('fails', function(specDone) {
        setTimeout(function() {
          specDone();
          setTimeout(function() {
          setTimeout(function() {
            global.onerror('fail');
          });
          });
        });
      });
    });

    env.describe('Ignored', function() {
      env.it('is not run', function() {});
    });

    env.execute();
  });

  describe('suiteDone reporting', function(){
    it("reports when an afterAll fails an expectation", function(done) {
      var env = new jasmineUnderTest.Env(),
        reporter = jasmine.createSpyObj('fakeReport', ['jasmineDone','suiteDone']);

      reporter.jasmineDone.and.callFake(function() {
        expect(reporter.suiteDone).toHaveFailedExpectationsForRunnable('my suite', [
          'Expected 1 to equal 2.',
          'Expected 2 to equal 3.'
        ]);
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

    it("if there are no specs, it still reports correctly", function(done) {
      var env = new jasmineUnderTest.Env(),
        reporter = jasmine.createSpyObj('fakeReport', ['jasmineDone','suiteDone']);

      reporter.jasmineDone.and.callFake(function() {
        expect(reporter.suiteDone).toHaveFailedExpectationsForRunnable('outer suite', [
          'Expected 1 to equal 2.',
          'Expected 2 to equal 3.'
        ]);
        done();
      });

      env.addReporter(reporter);

      env.describe('outer suite', function() {
        env.describe('inner suite', function() {
          env.it('spec', function(){ });
        });

        env.afterAll(function() {
          env.expect(1).toEqual(2);
          env.expect(2).toEqual(3);
        });
      });

      env.execute();
    });

    it("reports when afterAll throws an exception", function(done) {
      var env = new jasmineUnderTest.Env(),
        error = new Error('After All Exception'),
        reporter = jasmine.createSpyObj('fakeReport', ['jasmineDone','suiteDone']);

      reporter.jasmineDone.and.callFake(function() {
        expect(reporter.suiteDone).toHaveFailedExpectationsForRunnable('my suite', [
          (/^Error: After All Exception/)
        ]);
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
      var env = new jasmineUnderTest.Env(),
        reporter = jasmine.createSpyObj('fakeReport', ['jasmineDone','suiteDone']);

      reporter.jasmineDone.and.callFake(function() {
        expect(reporter.suiteDone).toHaveFailedExpectationsForRunnable('my suite', [
          'Expected 1 to equal 2.'
        ]);
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
      var env = new jasmineUnderTest.Env(),
        error = new Error('After All Exception'),
        reporter = jasmine.createSpyObj('fakeReport', ['jasmineDone','suiteDone']);


      reporter.jasmineDone.and.callFake(function() {
        expect(reporter.suiteDone).toHaveFailedExpectationsForRunnable('my suite', [
          (/^Error: After All Exception/)
        ]);
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
  });

  it('reports expectation failures in global beforeAll', function(done) {
    var env = new jasmineUnderTest.Env(),
      reporter = jasmine.createSpyObj(['specDone', 'jasmineDone']);

    reporter.jasmineDone.and.callFake(function(results) {
      expect(results.failedExpectations).toEqual([jasmine.objectContaining({ message: 'Expected 1 to be 0.' })]);
      expect(reporter.specDone).toHaveFailedExpectationsForRunnable('is a spec', []);
      done();
    });

    env.beforeAll(function() {
      env.expect(1).toBe(0);
    });

    env.it('is a spec', function() {
      env.expect(true).toBe(true);
    });

    env.addReporter(reporter);

    env.execute();
  });

  it('reports expectation failures in global afterAll', function(done) {
    var env = new jasmineUnderTest.Env(),
      reporter = jasmine.createSpyObj(['jasmineDone']);

    reporter.jasmineDone.and.callFake(function(results) {
      expect(results.failedExpectations).toEqual([jasmine.objectContaining({ message: 'Expected 1 to be 0.' })]);
      done();
    });

    env.afterAll(function() {
      env.expect(1).toBe(0);
    });

    env.it('is a spec', function() {
      env.expect(true).toBe(true);
    });

    env.addReporter(reporter);

    env.execute();
  });

  it("Allows specifying which specs and suites to run", function(done) {
    var env = new jasmineUnderTest.Env(),
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

  it('runs before and after all functions for runnables provided to .execute()', function(done) {
    var env = new jasmineUnderTest.Env(),
      calls = [],
      first_spec,
      second_spec;

    var assertions = function() {
      expect(calls).toEqual([
        "before",
        "first spec",
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

  it("Allows filtering out specs and suites to run programmatically", function(done) {
    var env = new jasmineUnderTest.Env(),
        calls = [],
        suiteCallback = jasmine.createSpy('suite callback'),
        firstSpec,
        secondSuite;

    var assertions = function() {
      expect(calls.length).toEqual(2);
      expect(calls).toEqual(jasmine.arrayContaining([
        'first spec',
        'second spec'
      ]));
      expect(suiteCallback).toHaveBeenCalled();
      done();
    };

    env.addReporter({jasmineDone: assertions, suiteDone: suiteCallback});

    env.describe("first suite", function() {
      env.it("first spec", function() {
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

    env.specFilter = function(spec) {
      return /^first suite/.test(spec.getFullName());
    };

    env.execute();
  });

  it("Functions can be spied on and have their calls tracked", function (done) {
    var env = new jasmineUnderTest.Env();

    var originalFunctionWasCalled = false;
    var subject = {
      spiedFunc: function() {
        originalFunctionWasCalled = true;
        return "original result";
      }
    };

    env.addReporter({jasmineDone: done});

    env.it("works with spies", function() {
      var spy = env.spyOn(subject, 'spiedFunc').and.returnValue("stubbed result");

      expect(subject.spiedFunc).toEqual(spy);
      expect(subject.spiedFunc.calls.any()).toEqual(false);
      expect(subject.spiedFunc.calls.count()).toEqual(0);

      subject.spiedFunc('foo');

      expect(subject.spiedFunc.calls.any()).toEqual(true);
      expect(subject.spiedFunc.calls.count()).toEqual(1);
      expect(subject.spiedFunc.calls.mostRecent().args).toEqual(['foo']);
      expect(subject.spiedFunc.calls.mostRecent().object).toEqual(subject);
      expect(subject.spiedFunc.calls.mostRecent().returnValue).toEqual("stubbed result");
      expect(originalFunctionWasCalled).toEqual(false);

      subject.spiedFunc.and.callThrough();
      subject.spiedFunc('bar');
      expect(subject.spiedFunc.calls.count()).toEqual(2);
      expect(subject.spiedFunc.calls.mostRecent().args).toEqual(['bar']);
      expect(subject.spiedFunc.calls.mostRecent().returnValue).toEqual("original result");
      expect(originalFunctionWasCalled).toEqual(true);
    });

    env.execute();
  });

  it('can be configured to allow respying on functions', function (done) {
    var env = new jasmineUnderTest.Env(),
        foo = {
          bar: function () {
            return 1;
          }
        };

    env.allowRespy(true);
    env.addReporter({ jasmineDone: done });

    env.describe('test suite', function(){
      env.it('spec 0', function(){
        env.spyOn(foo,'bar');

        var error = null;

        expect(function() {
          env.spyOn(foo, 'bar');
        }).not.toThrow();
      });
    });

    env.execute();
  });

  it('removes all spies added in a spec after the spec is complete', function(done) {
    var env = new jasmineUnderTest.Env(),
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
    var env = new jasmineUnderTest.Env(),
      originalFoo = function() {},
      testObj = {
        foo: originalFoo
      };

      env.describe('test suite', function() {
        env.beforeAll(function() { env.spyOn(testObj, 'foo');});

        env.it('spec 0', function() {
          expect(jasmineUnderTest.isSpy(testObj.foo)).toBe(true);
        });

        env.it('spec 1', function() {
          expect(jasmineUnderTest.isSpy(testObj.foo)).toBe(true);
        });
      });

      env.describe('another suite', function() {
        env.it('spec 2', function() {
          expect(jasmineUnderTest.isSpy(testObj.foo)).toBe(false);
        });
      });

    env.addReporter({ jasmineDone: done });

    env.execute();
  });

  it('removes a spy from the top suite after the run is complete', function(done) {
    var env = new jasmineUnderTest.Env(),
      originalFoo = function() {},
      testObj = {
        foo: originalFoo
      };

    env.beforeAll(function() {
      env.spyOn(testObj, 'foo');
    });

    env.it('spec', function() {
      expect(jasmineUnderTest.isSpy(testObj.foo)).toBe(true);
    });

    env.addReporter({
      jasmineDone: function() {
        expect(jasmineUnderTest.isSpy(testObj.foo)).toBe(false);
        done();
      }
    });

    env.execute();
  });

  it("Mock clock can be installed and used in tests", function(done) {
    var globalSetTimeout = jasmine.createSpy('globalSetTimeout').and.callFake(function(cb, t) { setTimeout(cb, t); }),
        delayedFunctionForGlobalClock = jasmine.createSpy('delayedFunctionForGlobalClock'),
        delayedFunctionForMockClock = jasmine.createSpy('delayedFunctionForMockClock'),
        env = new jasmineUnderTest.Env({global: { setTimeout: globalSetTimeout, clearTimeout: clearTimeout, setImmediate: function(cb) { setTimeout(cb, 0); } }});

    var assertions = function() {
      expect(delayedFunctionForMockClock).toHaveBeenCalled();
      expect(globalSetTimeout).toHaveBeenCalledWith(delayedFunctionForGlobalClock, 100);

      done();
    };

    env.addReporter({ jasmineDone: assertions });
    env.randomizeTests(false);

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
    var env = new jasmineUnderTest.Env(),
        reporter = jasmine.createSpyObj('reporter', ['jasmineDone']),
        mutatedVar;

    reporter.jasmineDone.and.callFake(function() {
      done();
    });
    env.addReporter(reporter);

    env.describe("tests", function() {
      env.beforeEach(function() {
        mutatedVar = 2;
      });

      env.it("async spec", function(underTestCallback) {
        setTimeout(function() {
          expect(mutatedVar).toEqual(2);
          underTestCallback();
        }, 0);
      });

      env.it("after async spec", function() {
        mutatedVar = 3;
      });
    });

    env.execute();
  });

  describe("with a mock clock", function() {
    var realSetTimeout;
    beforeEach(function() {
      this.originalTimeout = jasmineUnderTest.DEFAULT_TIMEOUT_INTERVAL;
      realSetTimeout = setTimeout;
      jasmine.clock().install();
    });

    afterEach(function() {
      jasmine.clock().tick(1);
      jasmine.clock().tick(1);
      jasmine.clock().uninstall();
      jasmineUnderTest.DEFAULT_TIMEOUT_INTERVAL = this.originalTimeout;
    });

    it("should wait a default interval before failing specs that haven't called done yet", function(done) {
      var env = new jasmineUnderTest.Env(),
          reporter = jasmine.createSpyObj('fakeReporter', [ "specDone", "jasmineDone" ]);

      reporter.specDone.and.callFake(function(result) {
        expect(result).toEqual(jasmine.objectContaining({status: 'failed'}));
        realSetTimeout(function() {
          jasmine.clock().tick(1);
        }, 0);
      });

      reporter.jasmineDone.and.callFake(function() {
        expect(reporter.specDone.calls.count()).toEqual(1);
        jasmine.clock().tick(1);
        realSetTimeout(done);
      });

      env.addReporter(reporter);
      jasmineUnderTest.DEFAULT_TIMEOUT_INTERVAL = 8414;

      env.it("async spec that doesn't call done", function(underTestCallback) {
        env.expect(true).toBeTruthy();
        jasmine.clock().tick(8416);
        jasmine.clock().tick(1);
      });

      env.execute();
    });

    it("should not use the mock clock for asynchronous timeouts", function(done){
      var env = new jasmineUnderTest.Env(),
        reporter = jasmine.createSpyObj('fakeReporter', [ "specDone", "jasmineDone" ]),
        clock = env.clock;

      reporter.specDone.and.callFake(function() {
        realSetTimeout(function() {
          jasmine.clock().tick(1);
        }, 0);
      });

      reporter.jasmineDone.and.callFake(function() {
        expect(reporter.specDone).toHaveBeenCalledTimes(1);
        expect(reporter.specDone.calls.argsFor(0)[0]).toEqual(jasmine.objectContaining({status: 'passed'}));
        jasmine.clock().tick(1);
        realSetTimeout(done);
      });

      env.addReporter(reporter);
      jasmineUnderTest.DEFAULT_TIMEOUT_INTERVAL = 5;

      env.beforeAll(function() {
        clock.install();
      });

      env.afterAll(function() {
        clock.uninstall();
      });

      env.it("spec that should not time out", function(innerDone) {
        clock.tick(6);
        expect(true).toEqual(true);
        realSetTimeout(innerDone);
      });

      env.execute();
    });

    it('should wait a custom interval before reporting async functions that fail to call done', function(done) {
      var env = new jasmineUnderTest.Env(),
          reporter = jasmine.createSpyObj('fakeReport', ['jasmineDone', 'suiteDone', 'specDone']),
          timeoutFailure = (/^Error: Timeout - Async callback was not invoked within timeout specified by jasmine\.DEFAULT_TIMEOUT_INTERVAL\./);

      reporter.specDone.and.callFake(function(r) {
        realSetTimeout(function() {
          jasmine.clock().tick(1);
        }, 0);
      });

      reporter.suiteDone.and.callFake(function(r) {
        realSetTimeout(function() {
          jasmine.clock().tick(1);
        }, 0);
      });

      reporter.jasmineDone.and.callFake(function() {
        expect(reporter.suiteDone).toHaveFailedExpectationsForRunnable('suite beforeAll', [ timeoutFailure ]);
        expect(reporter.suiteDone).toHaveFailedExpectationsForRunnable('suite afterAll', [ timeoutFailure ]);
        expect(reporter.specDone).toHaveFailedExpectationsForRunnable('suite beforeEach times out', [ timeoutFailure ]);
        expect(reporter.specDone).toHaveFailedExpectationsForRunnable('suite afterEach times out', [ timeoutFailure ]);
        expect(reporter.specDone).toHaveFailedExpectationsForRunnable('suite it times out', [ timeoutFailure ]);

        jasmine.clock().tick(1);
        realSetTimeout(done);
      });

      env.addReporter(reporter);
      jasmineUnderTest.DEFAULT_TIMEOUT_INTERVAL = 10000;

      env.describe('suite', function() {
        env.afterAll(function() {
          realSetTimeout(function() {
            try {
              jasmine.clock().tick(10);
            } catch(e) {
              // don't worry if the clock is already uninstalled
            }
          }, 100);
        });
        env.describe('beforeAll', function() {
          env.beforeAll(function(innerDone) {
            realSetTimeout(function() {
              jasmine.clock().tick(5001);
            }, 0);
          }, 5000);

          env.it('times out', function(innerDone) {
            realSetTimeout(function() {
              jasmine.clock().tick(1);
              innerDone();
            }, 0);
          });
        });

        env.describe('afterAll', function() {
          env.afterAll(function(innerDone) {
            realSetTimeout(function() {
              jasmine.clock().tick(2001);
            }, 0);
          }, 2000);

          env.it('times out', function(innerDone) {
            realSetTimeout(function() {
              jasmine.clock().tick(1);
              innerDone();
            }, 0);
          });
        });

        env.describe('beforeEach', function() {
          env.beforeEach(function(innerDone) {
            realSetTimeout(function() {
              jasmine.clock().tick(1001);
            }, 0);
          }, 1000);

          env.it('times out', function(innerDone) {
            realSetTimeout(function() {
              jasmine.clock().tick(1);
              innerDone();
            }, 0);
          });
        });

        env.describe('afterEach', function() {
          env.afterEach(function(innerDone) {
            realSetTimeout(function() {
              jasmine.clock().tick(4001);
            }, 0);
          }, 4000);

          env.it('times out', function(innerDone) {
            realSetTimeout(function() {
              jasmine.clock().tick(1);
              innerDone();
            }, 0);
          });
        });

        env.it('it times out', function(innerDone) {
          realSetTimeout(function() {
            jasmine.clock().tick(6001);
          }, 0);
        }, 6000);
      });

      env.execute();
    });
  });

  it('explicitly fails an async spec', function(done) {
    var env = new jasmineUnderTest.Env(),
      specDone = jasmine.createSpy('specDone');

    env.addReporter({
      specDone: specDone,
      jasmineDone: function() {
        expect(specDone).toHaveFailedExpectationsForRunnable('failing has a default message',
          ['Failed']
        );
        expect(specDone).toHaveFailedExpectationsForRunnable('failing specifies a message',
          ['Failed: messy message']
        );
        expect(specDone).toHaveFailedExpectationsForRunnable('failing fails via the done callback',
          ['Failed: done failed']
        );
        expect(specDone).toHaveFailedExpectationsForRunnable('failing has a message from an Error',
          ['Failed: error message']
        );
        expect(specDone).toHaveFailedExpectationsForRunnable('failing has a message from an Error to done',
          ['Failed: done error']
        );

        setTimeout(done);
      }
    });

    env.describe('failing', function() {
      env.it('has a default message', function(innerDone) {
        setTimeout(function() {
          env.fail();
          innerDone();
        }, 1);
      });

      env.it('specifies a message', function(innerDone) {
        setTimeout(function() {
          env.fail('messy message');
          innerDone();
        }, 1);
      });

      env.it('fails via the done callback', function(innerDone) {
        setTimeout(function() {
          innerDone.fail('done failed');
        }, 1);
      });

      env.it('has a message from an Error', function(innerDone) {
        setTimeout(function() {
          env.fail(new Error('error message'));
          innerDone();
        }, 1);
      });

      env.it('has a message from an Error to done', function(innerDone) {
        setTimeout(function() {
          innerDone(new Error('done error'));
        }, 1);
      });
    });

    env.execute();
  });

  describe('focused tests', function() {
    it('should only run the focused tests', function(done) {
      var env = new jasmineUnderTest.Env(),
        calls = [];

      var assertions = function() {
        expect(calls).toEqual(['focused']);
        done();
      };

      env.addReporter({jasmineDone: assertions});

      env.describe('a suite', function() {
        env.fit('is focused', function() {
          calls.push('focused');
        });

        env.it('is not focused', function() {
          calls.push('freakout');
        })
      });

      env.execute();
    });

    it('should only run focused suites', function(done){
      var env = new jasmineUnderTest.Env(),
        calls = [];

      var assertions = function() {
        expect(calls).toEqual(['focused']);
        done();
      };

      env.addReporter({jasmineDone: assertions});

      env.fdescribe('a focused suite', function() {
        env.it('is focused', function() {
          calls.push('focused');
        });
      });

      env.describe('a regular suite', function() {
        env.it('is not focused', function() {
          calls.push('freakout');
        })
      });

      env.execute();
    });

    it('should run focused tests inside an xdescribe', function(done) {
      var env = new jasmineUnderTest.Env(),
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
          totalSpecsDefined: 1,
          order: jasmine.any(jasmineUnderTest.Order)
        });

        expect(reporter.specDone).toHaveBeenCalledWith(jasmine.objectContaining({
          description: 'with a fit spec',
          status: 'failed'
        }));

        done();
      });

      env.addReporter(reporter);

      env.xdescribe("xd suite", function() {
        env.fit("with a fit spec", function() {
          env.expect(true).toBe(false);
        });
      });

      env.execute();
    });

    it('should run focused suites inside an xdescribe', function(done) {
      var env = new jasmineUnderTest.Env(),
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
          totalSpecsDefined: 1,
          order: jasmine.any(jasmineUnderTest.Order)
        });

        expect(reporter.specDone).toHaveBeenCalledWith(jasmine.objectContaining({
          description: 'with a spec',
          status: 'failed'
        }));

        done();
      });

      env.addReporter(reporter);

      env.xdescribe("xd suite", function() {
        env.fdescribe("fd suite", function() {
          env.it("with a spec", function() {
            env.expect(true).toBe(false);
          });
        });
      });

      env.execute();
    });
  });

  it("should report as expected", function(done) {
    var env = new jasmineUnderTest.Env(),
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
        totalSpecsDefined: 5,
        order: jasmine.any(jasmineUnderTest.Order)
      });

      expect(reporter.specDone.calls.count()).toBe(5);

      expect(reporter.specDone).toHaveBeenCalledWith(jasmine.objectContaining({
        description: 'with a top level spec',
        status: 'passed'
      }));

      expect(reporter.specDone).toHaveBeenCalledWith(jasmine.objectContaining({
        description: "with an x'ed spec",
        status: 'pending'
      }));

      expect(reporter.specDone).toHaveBeenCalledWith(jasmine.objectContaining({
        description: 'with a spec',
        status: 'failed'
      }));

      expect(reporter.specDone).toHaveBeenCalledWith(jasmine.objectContaining({
        description: 'is pending',
        status: 'pending'
      }));

      var suiteResult = reporter.suiteStarted.calls.argsFor(0)[0];
      expect(suiteResult.description).toEqual("A Suite");

      done();
    });

    env.addReporter(reporter);

    env.describe("A Suite", function() {
      env.it("with a top level spec", function() {
        env.expect(true).toBe(true);
      });
      env.describe("with a nested suite", function() {
        env.xit("with an x'ed spec", function() {
          env.expect(true).toBe(true);
        });
        env.it("with a spec", function() {
          env.expect(true).toBe(false);
        });
      });

      env.describe('with only non-executable specs', function() {
        env.it('is pending');
        env.xit('is xed', function() {
          env.expect(true).toBe(true);
        });
      });
    });

    env.execute();
  });

  it("should report the random seed at the beginning and end of execution", function(done) {
    var env = new jasmineUnderTest.Env(),
        reporter = jasmine.createSpyObj('fakeReporter', [
          "jasmineStarted",
          "jasmineDone",
          "suiteStarted",
          "suiteDone",
          "specStarted",
          "specDone"
        ]);
    env.randomizeTests(true);
    env.seed('123456');

    reporter.jasmineDone.and.callFake(function(doneArg) {
      expect(reporter.jasmineStarted).toHaveBeenCalled();
      var startedArg = reporter.jasmineStarted.calls.argsFor(0)[0];
      expect(startedArg.order.random).toEqual(true);
      expect(startedArg.order.seed).toEqual('123456');

      expect(doneArg.order.random).toEqual(true);
      expect(doneArg.order.seed).toEqual('123456');
      done();
    });

    env.addReporter(reporter);
    env.randomizeTests(true);
    env.execute();
  });

  it('should report pending spec messages', function(done) {
    var env = new jasmineUnderTest.Env(),
        reporter = jasmine.createSpyObj('fakeReporter', [
          'specDone',
          'jasmineDone'
        ]);

    reporter.jasmineDone.and.callFake(function() {
      var specStatus = reporter.specDone.calls.argsFor(0)[0];

      expect(specStatus.status).toBe('pending');
      expect(specStatus.pendingReason).toBe('with a message');

      done();
    });

    env.addReporter(reporter);

    env.it('will be pending', function() {
      env.pending('with a message');
    });

    env.execute();
  });

  it('should report pending spec messages from promise-returning functions', function(done) {
    function StubPromise(fn) {
      try {
        fn();
      } catch (e) {
        this.exception = e;
      }
    }

    StubPromise.prototype.then = function(resolve, reject) {
      reject(this.exception);
    };

    var env = new jasmineUnderTest.Env(),
        reporter = jasmine.createSpyObj('fakeReporter', [
          'specDone',
          'jasmineDone'
        ]);

    reporter.jasmineDone.and.callFake(function() {
      var specStatus = reporter.specDone.calls.argsFor(0)[0];

      expect(specStatus.status).toBe('pending');
      expect(specStatus.pendingReason).toBe('with a message');

      done();
    });

    env.addReporter(reporter);

    env.it('will be pending', function() {
      return new StubPromise(function() {
        env.pending('with a message');
      });
    });

    env.execute();
  });

  it('should report using fallback reporter', function(done) {
    var env = new jasmineUnderTest.Env(),
        reporter = jasmine.createSpyObj('fakeReporter', [
          'specDone',
          'jasmineDone'
        ]);

    reporter.jasmineDone.and.callFake(function() {
      expect(reporter.specDone).toHaveBeenCalled();

      done();
    });

    env.provideFallbackReporter(reporter);

    env.it('will be pending', function() {
      env.pending('with a message');
    });

    env.execute();
  });

  it('should report xdescribes as expected', function(done) {
    var env = new jasmineUnderTest.Env(),
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
        totalSpecsDefined: 1,
        order: jasmine.any(jasmineUnderTest.Order)
      });

      expect(reporter.specDone).toHaveBeenCalledWith(jasmine.objectContaining({ status: 'pending' }));
      expect(reporter.suiteDone).toHaveBeenCalledWith(jasmine.objectContaining({ description: 'xd out', status: 'pending' }));
      expect(reporter.suiteDone.calls.count()).toBe(4);

      done();
    });

    env.addReporter(reporter);

    env.describe("A Suite", function() {
      env.describe("nested", function() {
        env.xdescribe("xd out", function() {
          env.describe("nested again", function() {
            env.it("with a spec", function() {
              env.expect(true).toBe(false);
            });
          });
        });
      });
    });

    env.execute();
  });

  it("should be possible to get full name from a spec", function() {
    var env = new jasmineUnderTest.Env(),
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
    var env = new jasmineUnderTest.Env(),
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
    env.randomizeTests(false);

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
    var env = new jasmineUnderTest.Env(),
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
    env.randomizeTests(false);

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
    var env = new jasmineUnderTest.Env(),
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
    env.randomizeTests(false);

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

  it("produces an understandable error message when an 'expect' is used outside of a current spec", function(done) {
    var env = new jasmineUnderTest.Env(),
        reporter = jasmine.createSpyObj('fakeReporter', ['jasmineDone']);

    reporter.jasmineDone.and.callFake(done);
    env.addReporter(reporter);

    env.describe("A Suite", function() {
      env.it("an async spec that is actually synchronous", function(underTestCallback) {
        underTestCallback();
      });
      expect(function() { env.expect('a').toEqual('a'); }).toThrowError(/'expect' was used when there was no current spec/);
    });

    env.execute();
  });

  it("Custom equality testers for toContain should be per suite", function(done) {
    var env = new jasmineUnderTest.Env(),
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
    env.randomizeTests(false);

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
    var env = new jasmineUnderTest.Env(),
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
    var env = new jasmineUnderTest.Env(),
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
    var env = new jasmineUnderTest.Env(),
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
    var env = new jasmineUnderTest.Env(),
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
    var env = new jasmineUnderTest.Env(),
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

  it("should associate errors thrown from async code with the correct runnable", function(done) {
    var env = new jasmineUnderTest.Env(),
        reporter = jasmine.createSpyObj('fakeReport', ['jasmineDone','suiteDone','specDone']);

    reporter.jasmineDone.and.callFake(function() {
      expect(reporter.suiteDone).toHaveFailedExpectationsForRunnable('async suite', [
        /^(((Uncaught )?Error: suite( thrown)?)|(suite thrown))$/
      ]);
      expect(reporter.specDone).toHaveFailedExpectationsForRunnable('suite async spec', [
        /^(((Uncaught )?Error: spec( thrown)?)|(spec thrown))$/
      ]);
      done();
    });

    env.addReporter(reporter);

    env.describe('async suite', function() {
      env.afterAll(function(innerDone) {
        setTimeout(function() { throw new Error('suite'); }, 1);
      }, 10);

      env.it('spec', function() {});
    });

    env.describe('suite', function() {
      env.it('async spec', function(innerDone) {
        setTimeout(function() { throw new Error('spec'); }, 1);
      }, 10);
    });

    env.execute();
  });

  it('should throw on suites/specs/befores/afters nested in methods other than \'describe\'', function(done) {
    var env = new jasmineUnderTest.Env(),
      reporter = jasmine.createSpyObj('reporter', ['jasmineDone', 'suiteDone', 'specDone']);

    reporter.jasmineDone.and.callFake(function() {
      var msg = /\'.*\' should only be used in \'describe\' function/;

      expect(reporter.specDone).toHaveFailedExpectationsForRunnable('suite describe', [msg]);
      expect(reporter.specDone).toHaveFailedExpectationsForRunnable('suite xdescribe', [msg]);
      expect(reporter.specDone).toHaveFailedExpectationsForRunnable('suite fdescribe', [msg]);

      expect(reporter.specDone).toHaveFailedExpectationsForRunnable('spec it', [msg]);
      expect(reporter.specDone).toHaveFailedExpectationsForRunnable('spec xit', [msg]);
      expect(reporter.specDone).toHaveFailedExpectationsForRunnable('spec fit', [msg]);

      expect(reporter.suiteDone).toHaveFailedExpectationsForRunnable('beforeAll', [msg]);
      expect(reporter.specDone).toHaveFailedExpectationsForRunnable('beforeEach spec', [msg]);

      expect(reporter.suiteDone).toHaveFailedExpectationsForRunnable('afterAll', [msg]);
      expect(reporter.specDone).toHaveFailedExpectationsForRunnable('afterEach spec', [msg]);

      done();
    });

    env.addReporter(reporter);

    env.describe('suite', function() {
      env.it('describe', function() { env.describe('inner suite', function() {}); });
      env.it('xdescribe', function() { env.xdescribe('inner suite', function() {}); });
      env.it('fdescribe', function() { env.fdescribe('inner suite', function() {}); });
    });

    env.describe('spec', function() {
      env.it('it', function() { env.it('inner spec', function() {}); });
      env.it('xit', function() { env.xit('inner spec', function() {}); });
      env.it('fit', function() { env.fit('inner spec', function() {}); });
    });

    env.describe('beforeAll', function() {
      env.beforeAll(function() { env.beforeAll(function() {}); });
      env.it('spec', function() {});
    });

    env.describe('beforeEach', function() {
      env.beforeEach(function() { env.beforeEach(function() {}); });
      env.it('spec', function() {});
    });

    env.describe('afterAll', function() {
      env.afterAll(function() { env.afterAll(function() {}); });
      env.it('spec', function() {});
    });

    env.describe('afterEach', function() {
      env.afterEach(function() { env.afterEach(function() {}); });
      env.it('spec', function() {});
    });

    env.execute();
  });

  it('reports errors that occur during loading', function(done) {
    var global = {
      setTimeout: function(fn, delay) { setTimeout(fn, delay) },
      clearTimeout: function(fn, delay) { clearTimeout(fn, delay) },
    };
    spyOn(jasmineUnderTest, 'getGlobal').and.returnValue(global);

    var env = new jasmineUnderTest.Env(),
      reporter = jasmine.createSpyObj('reporter', ['jasmineDone', 'suiteDone', 'specDone']);

    reporter.jasmineDone.and.callFake(function(e) {
      expect(e.failedExpectations).toEqual([
        {
          passed: false,
          globalErrorType: 'load',
          message: 'Uncaught SyntaxError: Unexpected end of input',
          filename: 'borkenSpec.js',
          lineno: 42
        },
        {
          passed: false,
          globalErrorType: 'load',
          message: 'Uncaught Error: ENOCHEESE',
          filename: undefined,
          lineno: undefined
        }
      ]);

      done();
    });

    env.addReporter(reporter);
    global.onerror('Uncaught SyntaxError: Unexpected end of input', 'borkenSpec.js', 42);
    global.onerror('Uncaught Error: ENOCHEESE');

    env.execute();
  });

  describe('If suppressLoadErrors: true was passed', function() {
    it('does not install a global error handler during loading', function(done) {
      var originalOnerror = jasmine.createSpy('original onerror')
      var global = {
        setTimeout: function(fn, delay) { setTimeout(fn, delay) },
        clearTimeout: function(fn, delay) { clearTimeout(fn, delay) },
        onerror: originalOnerror
      };
      spyOn(jasmineUnderTest, 'getGlobal').and.returnValue(global);
      var globalErrors = new jasmineUnderTest.GlobalErrors(global);
      var onerror = jasmine.createSpy('onerror');
      globalErrors.pushListener(onerror);
      spyOn(jasmineUnderTest, 'GlobalErrors').and.returnValue(globalErrors);

      var env = new jasmineUnderTest.Env({suppressLoadErrors: true});
        reporter = jasmine.createSpyObj('reporter', ['jasmineDone', 'suiteDone', 'specDone']);

      reporter.jasmineDone.and.callFake(function(e) {
        expect(e.failedExpectations).toEqual([]);
        expect(originalOnerror).toHaveBeenCalledWith('Uncaught Error: ENOCHEESE');
        done();
      });

      env.addReporter(reporter);
      global.onerror('Uncaught Error: ENOCHEESE');

      env.execute();
    });
  });

  describe('Overall status in the jasmineDone event', function() {
    describe('When everything passes', function() {
      it('is "passed"', function(done) {
        var env = new jasmineUnderTest.Env(),
          reporter = jasmine.createSpyObj('reporter', ['jasmineDone', 'suiteDone', 'specDone']);

        reporter.jasmineDone.and.callFake(function(e) {
          expect(e.overallStatus).toEqual('passed');
          done();
        });

        env.addReporter(reporter);
        env.it('passes', function() {});
        env.execute();
      });
    });

    describe('When a spec fails', function() {
      it('is "failed"', function(done) {
        var env = new jasmineUnderTest.Env(),
          reporter = jasmine.createSpyObj('reporter', ['jasmineDone', 'suiteDone', 'specDone']);

        reporter.jasmineDone.and.callFake(function(e) {
          expect(e.overallStatus).toEqual('failed');
          done();
        });

        env.addReporter(reporter);
        env.it('fails', function() {
          env.expect(true).toBe(false);
        });
        env.execute();
      });
    });

    describe('When a top-level beforeAll fails', function() {
      it('is "failed"', function(done) {
        var env = new jasmineUnderTest.Env(),
          reporter = jasmine.createSpyObj('reporter', ['jasmineDone', 'suiteDone', 'specDone']);

        reporter.jasmineDone.and.callFake(function(e) {
          expect(e.overallStatus).toEqual('failed');
          done();
        });

        env.addReporter(reporter);
        env.beforeAll(function() {
          throw new Error('nope');
        });
        env.it('does not run', function() {});
        env.execute();
      });
    });

    describe('When a suite beforeAll fails', function() {
      it('is "failed"', function(done) {
        var env = new jasmineUnderTest.Env(),
          reporter = jasmine.createSpyObj('reporter', ['jasmineDone', 'suiteDone', 'specDone']);

        reporter.jasmineDone.and.callFake(function(e) {
          expect(e.overallStatus).toEqual('failed');
          done();
        });

        env.addReporter(reporter);
        env.describe('something', function() {
          env.beforeAll(function() {
            throw new Error('nope');
          });
          env.it('does not run', function() {});
        });
        env.execute();
      });
    });

    describe('When a top-level afterAll fails', function() {
      it('is "failed"', function(done) {
        var env = new jasmineUnderTest.Env(),
          reporter = jasmine.createSpyObj('reporter', ['jasmineDone', 'suiteDone', 'specDone']);

        reporter.jasmineDone.and.callFake(function(e) {
          expect(e.overallStatus).toEqual('failed');
          done();
        });

        env.addReporter(reporter);
        env.afterAll(function() {
          throw new Error('nope');
        });
        env.it('does not run', function() {});
        env.execute();
      });
    });

    describe('When a suite afterAll fails', function() {
      it('is "failed"', function(done) {
        var env = new jasmineUnderTest.Env(),
          reporter = jasmine.createSpyObj('reporter', ['jasmineDone', 'suiteDone', 'specDone']);

        reporter.jasmineDone.and.callFake(function(e) {
          expect(e.overallStatus).toEqual('failed');
          done();
        });

        env.addReporter(reporter);
        env.describe('something', function() {
          env.afterAll(function() {
            throw new Error('nope');
          });
          env.it('does not run', function() {});
        });
        env.execute();
      });
    });

    describe("When there are load errors", function() {
      it('is "failed"', function(done) {
        var global = {
          setTimeout: function(fn, delay) { setTimeout(fn, delay) },
          clearTimeout: function(fn, delay) { clearTimeout(fn, delay) },
        };
        spyOn(jasmineUnderTest, 'getGlobal').and.returnValue(global);

        var env = new jasmineUnderTest.Env();
        var reporter = jasmine.createSpyObj('reporter', ['jasmineDone', 'suiteDone', 'specDone']);

        reporter.jasmineDone.and.callFake(function(e) {
          expect(e.overallStatus).toEqual('failed');
          done();
        });

        env.addReporter(reporter);
        env.it('passes', function() {});
        global.onerror('Uncaught Error: ENOCHEESE');
        env.execute();
      });
    });

    describe('When there are no specs', function() {
      it('is "incomplete"', function(done) {
        var env = new jasmineUnderTest.Env(),
          reporter = jasmine.createSpyObj('reporter', ['jasmineDone', 'suiteDone', 'specDone']);

        reporter.jasmineDone.and.callFake(function(e) {
          expect(e.overallStatus).toEqual('incomplete');
          expect(e.incompleteReason).toEqual('No specs found');
          done();
        });

        env.addReporter(reporter);
        env.execute();
      });
    });

    describe('When a spec is focused', function() {
      it('is "incomplete"', function(done) {
        var env = new jasmineUnderTest.Env(),
          reporter = jasmine.createSpyObj('reporter', ['jasmineDone', 'suiteDone', 'specDone']);

        reporter.jasmineDone.and.callFake(function(e) {
          expect(e.overallStatus).toEqual('incomplete');
          expect(e.incompleteReason).toEqual('fit() or fdescribe() was found');
          done();
        });

        env.addReporter(reporter);
        env.fit('is focused', function() {});
        env.execute();
      });
    });

    describe('When a suite is focused', function() {
      it('is "incomplete"', function(done) {
        var env = new jasmineUnderTest.Env(),
          reporter = jasmine.createSpyObj('reporter', ['jasmineDone', 'suiteDone', 'specDone']);

        reporter.jasmineDone.and.callFake(function(e) {
          expect(e.overallStatus).toEqual('incomplete');
          expect(e.incompleteReason).toEqual('fit() or fdescribe() was found');
          done();
        });

        env.addReporter(reporter);
        env.fdescribe('something focused', function() {
          env.it('does a thing', function() {});
        });
        env.execute();
      });
    });

    describe('When there are both failures and focused specs', function() {
      it('is "failed"', function(done) {
        var env = new jasmineUnderTest.Env(),
          reporter = jasmine.createSpyObj('reporter', ['jasmineDone', 'suiteDone', 'specDone']);

        reporter.jasmineDone.and.callFake(function(e) {
          expect(e.overallStatus).toEqual('failed');
          expect(e.incompleteReason).toBeUndefined();
          done();
        });

        env.addReporter(reporter);
        env.fit('is focused', function() {
          env.expect(true).toBe(false);
        });
        env.execute();
      });
    });
  });

  it('should report deprecation warnings on the correct specs and suites', function(done) {
    var env = new jasmineUnderTest.Env(),
      reporter = jasmine.createSpyObj('reporter', ['jasmineDone', 'suiteDone', 'specDone']);

    // prevent deprecation from being desplayed
    spyOn(console, "error");

    reporter.jasmineDone.and.callFake(function(result) {
      expect(result.deprecationWarnings).toEqual([
        jasmine.objectContaining({ message: 'top level deprecation' })
      ]);

      expect(reporter.suiteDone).toHaveBeenCalledWith(jasmine.objectContaining({
        fullName: 'suite',
        deprecationWarnings: [
          jasmine.objectContaining({ message: 'suite level deprecation' })
        ]
      }));

      expect(reporter.specDone).toHaveBeenCalledWith(jasmine.objectContaining({
        fullName: 'suite spec',
        deprecationWarnings: [
          jasmine.objectContaining({ message: 'spec level deprecation' })
        ]
      }));

      done();
    });

    env.addReporter(reporter);

    env.deprecated('top level deprecation');

    env.describe('suite', function() {
      env.beforeAll(function() {
        env.deprecated('suite level deprecation');
      });

      env.it('spec', function() {
        env.deprecated('spec level deprecation');
      });
    });

    env.execute();
  });

  it('should report deprecation stack with an error object', function(done) {
    var env = new jasmineUnderTest.Env(),
      exceptionFormatter = new jasmineUnderTest.ExceptionFormatter(),
      reporter = jasmine.createSpyObj('reporter', ['jasmineDone', 'suiteDone', 'specDone']),
      topLevelError, suiteLevelError, specLevelError;

      try { throw new Error('top level deprecation') } catch (err) { topLevelError = err; }
      try { throw new Error('suite level deprecation') } catch (err) { suiteLevelError = err; }
      try { throw new Error('spec level deprecation') } catch (err) { specLevelError = err; }

    // prevent deprecation from being desplayed
    spyOn(console, "error");

    reporter.jasmineDone.and.callFake(function(result) {
      expect(result.deprecationWarnings).toEqual([
        jasmine.objectContaining({
          message: topLevelError.message,
          stack: exceptionFormatter.stack(topLevelError)
        })
      ]);

      expect(reporter.suiteDone).toHaveBeenCalledWith(jasmine.objectContaining({
        fullName: 'suite',
        deprecationWarnings: [
          jasmine.objectContaining({
            message: suiteLevelError.message,
            stack: exceptionFormatter.stack(suiteLevelError)
          })
        ]
      }));

      expect(reporter.specDone).toHaveBeenCalledWith(jasmine.objectContaining({
        fullName: 'suite spec',
        deprecationWarnings: [
          jasmine.objectContaining({
            message: specLevelError.message,
            stack: exceptionFormatter.stack(specLevelError)
          })
        ]
      }));

      done();
    });

    env.addReporter(reporter);

    env.deprecated(topLevelError);

    env.describe('suite', function() {
      env.beforeAll(function() {
        env.deprecated(suiteLevelError);
      });

      env.it('spec', function() {
        env.deprecated(specLevelError);
      });
    });

    env.execute();
  });
});
