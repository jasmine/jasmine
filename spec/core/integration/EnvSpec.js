describe('Env integration', function() {
  let env;
  const isBrowser = typeof window !== 'undefined';

  beforeEach(function() {
    specHelpers.registerIntegrationMatchers();
    env = new jasmineUnderTest.Env();
  });

  afterEach(function() {
    env.cleanup_();
  });

  it('Suites execute as expected (no nesting)', async function() {
    const calls = [];

    env.configure({ random: false });

    env.describe('A Suite', function() {
      env.it('with a spec', function() {
        calls.push('with a spec');
      });
      env.it('and another spec', function() {
        calls.push('and another spec');
      });
    });

    await env.execute();

    expect(calls).toEqual(['with a spec', 'and another spec']);
  });

  it('Nested Suites execute as expected', async function() {
    const calls = [];

    env.configure({ random: false });

    env.describe('Outer suite', function() {
      env.it('an outer spec', function() {
        calls.push('an outer spec');
      });
      env.describe('Inner suite', function() {
        env.it('an inner spec', function() {
          calls.push('an inner spec');
        });
        env.it('another inner spec', function() {
          calls.push('another inner spec');
        });
      });
    });

    await env.execute();

    expect(calls).toEqual([
      'an outer spec',
      'an inner spec',
      'another inner spec'
    ]);
  });

  it('Multiple top-level Suites execute as expected', async function() {
    const calls = [];

    env.configure({ random: false });

    env.describe('Outer suite', function() {
      env.it('an outer spec', function() {
        calls.push('an outer spec');
      });
      env.describe('Inner suite', function() {
        env.it('an inner spec', function() {
          calls.push('an inner spec');
        });
        env.it('another inner spec', function() {
          calls.push('another inner spec');
        });
      });
    });

    env.describe('Another outer suite', function() {
      env.it('a 2nd outer spec', function() {
        calls.push('a 2nd outer spec');
      });
    });

    await env.execute();

    expect(calls).toEqual([
      'an outer spec',
      'an inner spec',
      'another inner spec',
      'a 2nd outer spec'
    ]);
  });

  it('explicitly fails a spec', async function() {
    const specDone = jasmine.createSpy('specDone');

    env.addReporter({ specDone: specDone });

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
        env.fail({ prop: 'value', arr: ['works', true] });
      });
    });

    await env.execute();

    expect(specDone).toHaveBeenCalledWith(
      jasmine.objectContaining({
        description: 'has a default message',
        failedExpectations: [
          jasmine.objectContaining({
            message: 'Failed'
          })
        ]
      })
    );
    expect(specDone).toHaveBeenCalledWith(
      jasmine.objectContaining({
        description: 'specifies a message',
        failedExpectations: [
          jasmine.objectContaining({
            message: 'Failed: messy message'
          })
        ]
      })
    );
    expect(specDone).toHaveBeenCalledWith(
      jasmine.objectContaining({
        description: 'has a message and stack trace from an Error',
        failedExpectations: [
          jasmine.objectContaining({
            message: 'Failed: error message',
            stack: {
              asymmetricMatch: function(other) {
                const split = other.split('\n');
                let firstLine = split[0];
                if (firstLine.indexOf('error message') >= 0) {
                  // Chrome inserts the message and a newline before the first stacktrace line.
                  firstLine = split[1];
                }
                return firstLine.indexOf('EnvSpec') >= 0;
              }
            }
          })
        ]
      })
    );
    expect(specDone).toHaveBeenCalledWith(
      jasmine.objectContaining({
        description: 'pretty prints objects',
        failedExpectations: [
          jasmine.objectContaining({
            message: "Failed: Object({ prop: 'value', arr: [ 'works', true ] })"
          })
        ]
      })
    );
  });

  it("produces an understandable error message when 'fail' is used outside of a current spec", async function() {
    env.describe('A Suite', function() {
      env.it('an async spec that is actually synchronous', function(
        underTestCallback
      ) {
        underTestCallback();
      });
      expect(function() {
        env.fail();
      }).toThrowError(/'fail' was used when there was no current spec/);
    });

    await env.execute();
  });

  it("calls associated befores/specs/afters with the same 'this'", async function() {
    env.configure({ random: false });
    env.describe('tests', function() {
      let firstTimeThrough = true;
      let firstSpecContext;
      let secondSpecContext;

      env.beforeEach(function() {
        if (firstTimeThrough) {
          firstSpecContext = this;
        } else {
          secondSpecContext = this;
        }
        expect(this).toEqual(new jasmineUnderTest.UserContext());
      });

      env.it('sync spec', function() {
        expect(this).toBe(firstSpecContext);
      });

      env.it('another sync spec', function() {
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

    await env.execute();
  });

  it("calls associated befores/its/afters with the same 'this' for an async spec", async function() {
    env.describe('with an async spec', function() {
      let specContext;

      env.beforeEach(function() {
        specContext = this;
        expect(this).toEqual(new jasmineUnderTest.UserContext());
      });

      env.it('sync spec', function(underTestCallback) {
        expect(this).toBe(specContext);
        underTestCallback();
      });

      env.afterEach(function() {
        expect(this).toBe(specContext);
      });
    });

    await env.execute();
  });

  it('calls associated beforeAlls/afterAlls only once per suite', async function() {
    const before = jasmine.createSpy('beforeAll'),
      after = jasmine.createSpy('afterAll');

    env.describe('with beforeAll and afterAll', function() {
      env.it('spec', function() {
        expect(before).toHaveBeenCalled();
        expect(after).not.toHaveBeenCalled();
      });

      env.it('another spec', function() {
        expect(before).toHaveBeenCalled();
        expect(after).not.toHaveBeenCalled();
      });

      env.beforeAll(before);
      env.afterAll(after);
    });

    await env.execute();

    expect(after).toHaveBeenCalled();
    expect(after.calls.count()).toBe(1);
    expect(before.calls.count()).toBe(1);
  });

  it('calls associated beforeAlls/afterAlls only once per suite for async', async function() {
    const before = jasmine.createSpy('beforeAll'),
      after = jasmine.createSpy('afterAll');

    env.describe('with beforeAll and afterAll', function() {
      env.it('spec', function() {
        expect(before).toHaveBeenCalled();
        expect(after).not.toHaveBeenCalled();
      });

      env.it('another spec', function() {
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

    await env.execute();

    expect(after).toHaveBeenCalled();
    expect(after.calls.count()).toBe(1);
    expect(before.calls.count()).toBe(1);
  });

  it("calls associated beforeAlls/afterAlls with the cascaded 'this'", async function() {
    env.describe('with beforeAll and afterAll', function() {
      env.beforeAll(function() {
        this.x = 1;
      });

      env.it('has an x at the root', function() {
        expect(this.x).toBe(1);
      });

      env.describe('child that deletes', function() {
        env.beforeAll(function() {
          expect(this.x).toBe(1);
          delete this.x;
        });

        env.it('has no x', function() {
          expect(this.x).not.toBeDefined();
        });
      });

      env.describe('child should still have x', function() {
        env.beforeAll(function(innerDone) {
          expect(this.x).toBe(1);
          innerDone();
        });

        env.it('has an x', function() {
          expect(this.x).toBe(1);
          delete this.x;
        });

        env.it('still has an x', function() {
          expect(this.x).toBe(1);
        });

        env.it('adds a y', function() {
          this.y = 2;
          expect(this.y).toBe(2);
        });

        env.it("doesn't have y that was added in sibling", function() {
          expect(this.y).not.toBeDefined();
        });
      });
    });

    await env.execute();
  });

  it('tags top-level afterAll failures with a type', async function() {
    const jasmineDone = jasmine.createSpy('jasmineDone');

    env.it('has a spec', function() {});

    env.afterAll(function() {
      throw 'nope';
    });

    env.addReporter({ jasmineDone: jasmineDone });

    await env.execute();

    const result = jasmineDone.calls.argsFor(0)[0];
    expect(result.failedExpectations[0].globalErrorType).toEqual('afterAll');
  });

  it('does not tag suite afterAll failures with a type', async function() {
    const reporter = {
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

    await env.execute();

    expect(reporter.suiteDone).toHaveBeenCalled();
  });

  it('when the beforeAll fails, error at suite level', async function() {
    const reporter = jasmine.createSpyObj('fakeReporter', [
      'specDone',
      'suiteDone'
    ]);

    env.addReporter(reporter);

    env.describe('A suite', function() {
      env.beforeAll(function() {
        env.expect(1).toBe(2);
      });

      env.it('spec that will pass', function() {});

      env.describe('nesting', function() {
        env.it('another spec to pass', function() {});
      });
    });

    await env.execute();

    expect(reporter.specDone.calls.count()).toEqual(2);
    expect(reporter.specDone).toHaveFailedExpectationsForRunnable(
      'A suite spec that will pass',
      []
    );
    expect(reporter.specDone).toHaveFailedExpectationsForRunnable(
      'A suite nesting another spec to pass',
      []
    );
    expect(reporter.suiteDone).toHaveFailedExpectationsForRunnable('A suite', [
      'Expected 1 to be 2.'
    ]);
  });

  it('reports multiple calls to done in the top suite as errors', async function() {
    const reporter = jasmine.createSpyObj('fakeReporter', ['jasmineDone']);
    const message =
      'A top-level beforeAll or afterAll function called its ' +
      "'done' callback more than once.";

    env.addReporter(reporter);
    env.beforeAll(function(innerDone) {
      innerDone();
      innerDone();
    });
    env.it('a spec, so the beforeAll runs', function() {});
    env.afterAll(function(innerDone) {
      innerDone();
      innerDone();
    });

    await env.execute();

    expect(reporter.jasmineDone).toHaveBeenCalled();
    const errors = reporter.jasmineDone.calls.argsFor(0)[0].failedExpectations;
    expect(errors.length).toEqual(2);
    expect(errors[0].message)
      .withContext('top beforeAll')
      .toContain(message);
    expect(errors[0].globalErrorType).toEqual('lateError');
    expect(errors[1].message)
      .withContext('top afterAll')
      .toContain(message);
    expect(errors[1].globalErrorType).toEqual('lateError');
  });

  it('reports multiple calls to done in a non-top suite as errors', async function() {
    const reporter = jasmine.createSpyObj('fakeReporter', [
      'jasmineDone',
      'suiteDone'
    ]);
    const message =
      "An asynchronous beforeAll or afterAll function called its 'done' " +
      'callback more than once.\n(in suite: a suite)';
    let lateDone;
    reporter.suiteDone.and.callFake(function() {
      lateDone();
    });

    env.addReporter(reporter);
    env.describe('a suite', function() {
      env.beforeAll(function(innerDone) {
        innerDone();
        innerDone();
      });
      env.it('a spec, so that before/afters run', function() {});
      env.afterAll(function(innerDone) {
        innerDone();
        innerDone();
        lateDone = innerDone;
      });
    });

    await env.execute();

    expect(reporter.suiteDone).toHaveBeenCalled();
    const suiteErrors = reporter.suiteDone.calls.argsFor(0)[0]
      .failedExpectations;
    expect(suiteErrors.length).toEqual(2);
    expect(suiteErrors[0].message)
      .withContext('suite beforeAll')
      .toContain(message);
    expect(suiteErrors[1].message)
      .withContext('suite afterAll')
      .toContain(message);

    expect(reporter.jasmineDone).toHaveBeenCalled();
    const topErrors = reporter.jasmineDone.calls.argsFor(0)[0]
      .failedExpectations;
    expect(topErrors.length).toEqual(1);
    expect(topErrors[0].message)
      .withContext('late suite afterAll')
      .toContain(message);
    expect(topErrors[0].globalErrorType).toEqual('lateError');
    expect(topErrors[0].globalErrorType).toEqual('lateError');
  });

  it('reports multiple calls to done in a spec as errors', async function() {
    const reporter = jasmine.createSpyObj('fakeReporter', [
      'specDone',
      'suiteDone',
      'jasmineDone'
    ]);
    const message =
      'An asynchronous spec, beforeEach, or afterEach function called its ' +
      "'done' callback more than once.\n(in spec: a suite a spec)";
    let lateDone;
    reporter.specDone.and.callFake(function() {
      lateDone();
    });
    reporter.suiteDone.and.callFake(function() {
      lateDone();
    });

    env.addReporter(reporter);
    env.describe('a suite', function() {
      env.beforeEach(function(innerDone) {
        innerDone();
        innerDone();
      });
      env.it('a spec', function(innerDone) {
        innerDone();
        innerDone();
      });
      env.afterEach(function(innerDone) {
        innerDone();
        innerDone();
        lateDone = innerDone;
      });
    });

    await env.execute();

    expect(reporter.specDone).toHaveBeenCalled();
    const specErrors = reporter.specDone.calls.argsFor(0)[0].failedExpectations;
    expect(specErrors.length).toEqual(3);
    expect(specErrors[0].message)
      .withContext('error caused by beforeEach')
      .toContain(message);
    expect(specErrors[1].message)
      .withContext('error caused by it')
      .toContain(message);
    expect(specErrors[2].message)
      .withContext('error caused by afterEach')
      .toContain(message);

    const suiteErrors = reporter.suiteDone.calls.argsFor(0)[0]
      .failedExpectations;
    expect(suiteErrors.length).toEqual(1);
    expect(suiteErrors[0].message)
      .withContext('late error caused by afterEach')
      .toContain(message);

    const topErrors = reporter.jasmineDone.calls.argsFor(0)[0]
      .failedExpectations;
    expect(topErrors.length).toEqual(1);
    expect(topErrors[0].message)
      .withContext('really late error caused by afterEach')
      .toContain(message);
    expect(topErrors[0].globalErrorType).toEqual('lateError');
  });

  it('reports multiple calls to done in reporters as errors', async function() {
    const message =
      "An asynchronous reporter callback called its 'done' callback more " +
      'than once.';
    const reporter = jasmine.createSpyObj('fakeReport', ['jasmineDone']);
    reporter.specDone = function(result, done) {
      done();
      done();
    };
    env.addReporter(reporter);

    env.it('a spec', function() {});

    await env.execute();

    expect(reporter.jasmineDone).toHaveBeenCalled();
    const errors = reporter.jasmineDone.calls.argsFor(0)[0].failedExpectations;
    expect(errors.length).toEqual(1);
    expect(errors[0].message).toContain(message);
    expect(errors[0].globalErrorType).toEqual('lateError');
  });

  it('does not report an error for a call to done that comes after a timeout', async function() {
    const reporter = jasmine.createSpyObj('fakeReporter', ['jasmineDone']);
    let firstSpecDone;

    reporter.specDone = function(result, reporterDone) {
      setTimeout(function() {
        firstSpecDone();
        reporterDone();
      });
    };
    env.addReporter(reporter);

    env.it(
      'a spec',
      function(innerDone) {
        firstSpecDone = innerDone;
      },
      1
    );

    await env.execute();

    expect(reporter.jasmineDone).toHaveBeenCalledWith(
      jasmine.objectContaining({
        failedExpectations: []
      })
    );
  });

  describe('suiteDone reporting', function() {
    it('reports when an afterAll fails an expectation', async function() {
      const reporter = jasmine.createSpyObj('fakeReport', ['suiteDone']);

      env.addReporter(reporter);

      env.describe('my suite', function() {
        env.it('my spec', function() {});

        env.afterAll(function() {
          env.expect(1).toEqual(2);
          env.expect(2).toEqual(3);
        });
      });

      await env.execute();

      expect(reporter.suiteDone).toHaveFailedExpectationsForRunnable(
        'my suite',
        ['Expected 1 to equal 2.', 'Expected 2 to equal 3.']
      );
    });

    it('if there are no specs, it still reports correctly', async function() {
      const reporter = jasmine.createSpyObj('fakeReport', ['suiteDone']);
      env.addReporter(reporter);

      env.describe('outer suite', function() {
        env.describe('inner suite', function() {
          env.it('spec', function() {});
        });

        env.afterAll(function() {
          env.expect(1).toEqual(2);
          env.expect(2).toEqual(3);
        });
      });

      await env.execute();

      expect(reporter.suiteDone).toHaveFailedExpectationsForRunnable(
        'outer suite',
        ['Expected 1 to equal 2.', 'Expected 2 to equal 3.']
      );
    });

    it('reports when afterAll throws an exception', async function() {
      const error = new Error('After All Exception'),
        reporter = jasmine.createSpyObj('fakeReport', ['suiteDone']);

      env.addReporter(reporter);

      env.describe('my suite', function() {
        env.it('my spec', function() {});

        env.afterAll(function() {
          throw error;
        });
      });

      await env.execute();

      expect(reporter.suiteDone).toHaveFailedExpectationsForRunnable(
        'my suite',
        [/^Error: After All Exception/]
      );
    });

    it('reports when an async afterAll fails an expectation', async function() {
      const reporter = jasmine.createSpyObj('fakeReport', ['suiteDone']);

      env.addReporter(reporter);

      env.describe('my suite', function() {
        env.it('my spec', function() {});

        env.afterAll(function(afterAllDone) {
          env.expect(1).toEqual(2);
          afterAllDone();
        });
      });

      await env.execute();

      expect(reporter.suiteDone).toHaveFailedExpectationsForRunnable(
        'my suite',
        ['Expected 1 to equal 2.']
      );
    });

    it('reports when an async afterAll throws an exception', async function() {
      const error = new Error('After All Exception'),
        reporter = jasmine.createSpyObj('fakeReport', ['suiteDone']);

      env.addReporter(reporter);

      env.describe('my suite', function() {
        env.it('my spec', function() {});

        env.afterAll(function(afterAllDone) {
          throw error;
        });
      });

      await env.execute();

      expect(reporter.suiteDone).toHaveFailedExpectationsForRunnable(
        'my suite',
        [/^Error: After All Exception/]
      );
    });

    it('reports the duration of the suite', async function() {
      let duration;

      env.addReporter({
        suiteDone: function(result) {
          expect(duration).toBeUndefined();
          duration = result.duration;
        }
      });

      env.describe('my suite', function() {
        env.it('takes time', function(done) {
          // We can't just use the mock clock here because the timer is designed
          // to record real time even when the mock clock is installed.
          setTimeout(done, 10);
        });
      });

      await env.execute();

      // Expect > 0 to compensate for clock imprecision
      expect(duration).toBeGreaterThan(0);
    });
  });

  describe('specDone reporting', function() {
    it('reports the duration of the spec', async function() {
      let duration;

      env.addReporter({
        specDone: function(result) {
          expect(duration).toBeUndefined();
          duration = result.duration;
        }
      });

      env.describe('my suite', function() {
        env.it('takes time', function(done) {
          // We can't just use the mock clock here because the timer is designed
          // to record real time even when the mock clock is installed.
          setTimeout(done, 10);
        });
      });

      await env.execute();

      // Expect > 0 to compensate for clock imprecision
      expect(duration).toBeGreaterThan(0);
    });
  });

  it('reports expectation failures in global beforeAll', async function() {
    const reporter = jasmine.createSpyObj(['specDone', 'jasmineDone']);

    env.beforeAll(function() {
      env.expect(1).toBe(0);
    });

    env.it('is a spec', function() {
      env.expect(true).toBe(true);
    });

    env.addReporter(reporter);

    await env.execute();

    const results = reporter.jasmineDone.calls.argsFor(0)[0];
    expect(results.failedExpectations).toEqual([
      jasmine.objectContaining({ message: 'Expected 1 to be 0.' })
    ]);
    expect(reporter.specDone).toHaveFailedExpectationsForRunnable(
      'is a spec',
      []
    );
  });

  it('reports expectation failures in global afterAll', async function() {
    const reporter = jasmine.createSpyObj(['jasmineDone']);

    env.afterAll(function() {
      env.expect(1).toBe(0);
    });

    env.it('is a spec', function() {
      env.expect(true).toBe(true);
    });

    env.addReporter(reporter);

    await env.execute();

    const results = reporter.jasmineDone.calls.argsFor(0)[0];
    expect(results.failedExpectations).toEqual([
      jasmine.objectContaining({ message: 'Expected 1 to be 0.' })
    ]);
  });

  it('Allows specifying which specs and suites to run', async function() {
    const calls = [],
      suiteCallback = jasmine.createSpy('suite callback');
    let firstSpec;
    let secondSuite;

    env.addReporter({ suiteDone: suiteCallback });

    env.describe('first suite', function() {
      firstSpec = env.it('first spec', function() {
        calls.push('first spec');
      });
      env.it('second spec', function() {
        calls.push('second spec');
      });
    });

    secondSuite = env.describe('second suite', function() {
      env.it('third spec', function() {
        calls.push('third spec');
      });
    });

    await env.execute([secondSuite.id, firstSpec.id]);

    expect(calls).toEqual(['third spec', 'first spec']);
    expect(suiteCallback).toHaveBeenCalled();
  });

  it('runs before and after all functions for runnables provided to .execute()', async function() {
    const calls = [];
    let first_spec;
    let second_spec;

    env.describe('first suite', function() {
      env.beforeAll(function() {
        calls.push('before');
      });
      env.afterAll(function() {
        calls.push('after');
      });
      first_spec = env.it('spec', function() {
        calls.push('first spec');
      });
      second_spec = env.it('spec 2', function() {
        calls.push('second spec');
      });
    });

    await env.execute([first_spec.id, second_spec.id]);

    expect(calls).toEqual(['before', 'first spec', 'second spec', 'after']);
  });

  it('Allows filtering out specs and suites to run programmatically', async function() {
    const calls = [],
      suiteCallback = jasmine.createSpy('suite callback');

    env.addReporter({ suiteDone: suiteCallback });

    env.describe('first suite', function() {
      env.it('first spec', function() {
        calls.push('first spec');
      });
      env.it('second spec', function() {
        calls.push('second spec');
      });
    });

    env.describe('second suite', function() {
      env.it('third spec', function() {
        calls.push('third spec');
      });
    });

    env.configure({
      random: false,
      specFilter: function(spec) {
        return /^first suite/.test(spec.getFullName());
      }
    });

    await env.execute();

    expect(calls).toEqual(['first spec', 'second spec']);
    expect(suiteCallback).toHaveBeenCalled();
  });

  it('Functions can be spied on and have their calls tracked', async function() {
    let originalFunctionWasCalled = false;
    const subject = {
      spiedFunc: function() {
        originalFunctionWasCalled = true;
        return 'original result';
      }
    };

    env.it('works with spies', function() {
      const spy = env
        .spyOn(subject, 'spiedFunc')
        .and.returnValue('stubbed result');

      expect(subject.spiedFunc).toEqual(spy);
      expect(subject.spiedFunc.calls.any()).toEqual(false);
      expect(subject.spiedFunc.calls.count()).toEqual(0);

      subject.spiedFunc('foo');

      expect(subject.spiedFunc.calls.any()).toEqual(true);
      expect(subject.spiedFunc.calls.count()).toEqual(1);
      expect(subject.spiedFunc.calls.mostRecent().args).toEqual(['foo']);
      expect(subject.spiedFunc.calls.mostRecent().object).toEqual(subject);
      expect(subject.spiedFunc.calls.mostRecent().returnValue).toEqual(
        'stubbed result'
      );
      expect(originalFunctionWasCalled).toEqual(false);

      subject.spiedFunc.and.callThrough();
      subject.spiedFunc('bar');
      expect(subject.spiedFunc.calls.count()).toEqual(2);
      expect(subject.spiedFunc.calls.mostRecent().args).toEqual(['bar']);
      expect(subject.spiedFunc.calls.mostRecent().returnValue).toEqual(
        'original result'
      );
      expect(originalFunctionWasCalled).toEqual(true);
    });

    env.it(
      'works with constructors when using callThrough spy strategy',
      function() {
        function MyClass(foo) {
          if (!(this instanceof MyClass)) {
            throw new Error('You must use the new keyword.');
          }
          this.foo = foo;
        }
        const subject = { MyClass: MyClass };
        const spy = env.spyOn(subject, 'MyClass').and.callThrough();

        expect(function() {
          const result = new spy('hello world');
          expect(result instanceof MyClass).toBeTruthy();
          expect(result.foo).toEqual('hello world');
        }).not.toThrow();

        expect(function() {
          const result = new spy(
            'passing',
            'extra',
            'arguments',
            'to',
            'constructor'
          );
          expect(result instanceof MyClass).toBeTruthy();
          expect(result.foo).toEqual('passing');
        }).not.toThrow();

        expect(function() {
          spy('hello world');
        }).toThrowError('You must use the new keyword.');
      }
    );

    await env.execute();
  });

  it('can be configured to allow respying on functions', async function() {
    const foo = {
      bar: function() {
        return 1;
      }
    };

    env.allowRespy(true);

    env.describe('test suite', function() {
      env.it('spec 0', function() {
        env.spyOn(foo, 'bar');

        expect(function() {
          env.spyOn(foo, 'bar');
        }).not.toThrow();
      });
    });

    await env.execute();
  });

  it('removes all spies added in a spec after the spec is complete', async function() {
    const originalFoo = function() {},
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

    env.configure({ random: false });
    await env.execute();

    expect(firstSpec).toHaveBeenCalled();
    expect(secondSpec).toHaveBeenCalled();
  });

  it('removes all spies added in a suite after the suite is complete', async function() {
    const originalFoo = function() {},
      testObj = {
        foo: originalFoo
      };

    env.describe('test suite', function() {
      env.beforeAll(function() {
        env.spyOn(testObj, 'foo');
      });

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

    await env.execute();
  });

  it('removes a spy from the top suite after the run is complete', async function() {
    const originalFoo = function() {},
      testObj = {
        foo: originalFoo
      };

    env.beforeAll(function() {
      env.spyOn(testObj, 'foo');
    });

    env.it('spec', function() {
      expect(jasmineUnderTest.isSpy(testObj.foo)).toBe(true);
    });

    await env.execute();

    expect(jasmineUnderTest.isSpy(testObj.foo)).toBe(false);
  });

  it('Mock clock can be installed and used in tests', async function() {
    const globalSetTimeout = jasmine
        .createSpy('globalSetTimeout')
        .and.callFake(function(cb, t) {
          return setTimeout(cb, t);
        }),
      delayedFunctionForGlobalClock = jasmine.createSpy(
        'delayedFunctionForGlobalClock'
      ),
      delayedFunctionForMockClock = jasmine.createSpy(
        'delayedFunctionForMockClock'
      );

    env.cleanup_();
    env = new jasmineUnderTest.Env({
      global: {
        setTimeout: globalSetTimeout,
        clearTimeout: clearTimeout,
        queueMicrotask: function(fn) {
          queueMicrotask(fn);
        }
      }
    });

    env.configure({ random: false });

    env.describe('tests', function() {
      env.it('test with mock clock', function() {
        env.clock.install();
        env.clock.setTimeout(delayedFunctionForMockClock, 100);
        env.clock.tick(100);
        env.clock.uninstall();
      });
      env.it('test without mock clock', function() {
        env.clock.setTimeout(delayedFunctionForGlobalClock, 100);
      });
    });

    expect(globalSetTimeout).not.toHaveBeenCalled();
    expect(delayedFunctionForMockClock).not.toHaveBeenCalled();

    await env.execute();

    expect(delayedFunctionForMockClock).toHaveBeenCalled();
    expect(globalSetTimeout).toHaveBeenCalledWith(
      delayedFunctionForGlobalClock,
      100
    );
  });

  it('should run async specs in order, waiting for them to complete', async function() {
    let mutatedVar;

    env.describe('tests', function() {
      env.beforeEach(function() {
        mutatedVar = 2;
      });

      env.it('async spec', function(underTestCallback) {
        setTimeout(function() {
          expect(mutatedVar).toEqual(2);
          underTestCallback();
        }, 0);
      });

      env.it('after async spec', function() {
        mutatedVar = 3;
      });
    });

    await env.execute();
  });

  describe('with a mock clock', function() {
    let realSetTimeout;
    function createMockedEnv() {
      env.cleanup_();
      // explicitly pass in timing functions so we can make sure that clear stack always works
      // no matter how long the suite in the spec is
      env = new jasmineUnderTest.Env({
        global: {
          setTimeout: function(cb, t) {
            const stack = new Error().stack;
            if (stack.indexOf('ClearStack') >= 0) {
              return realSetTimeout(cb, t);
            } else {
              return setTimeout(cb, t);
            }
          },
          clearTimeout: clearTimeout,
          setInterval: setInterval,
          clearInterval: clearInterval,
          queueMicrotask: function(fn) {
            queueMicrotask(fn);
          }
        }
      });
    }

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

    it("should wait a default interval before failing specs that haven't called done yet", async function() {
      createMockedEnv();
      const reporter = jasmine.createSpyObj('fakeReporter', ['specDone']);

      reporter.specDone.and.callFake(function(result) {
        expect(result).toEqual(jasmine.objectContaining({ status: 'failed' }));
        realSetTimeout(function() {
          jasmine.clock().tick(1);
        }, 0);
      });

      env.addReporter(reporter);
      jasmineUnderTest.DEFAULT_TIMEOUT_INTERVAL = 8414;

      env.it("async spec that doesn't call done", function(underTestCallback) {
        env.expect(true).toBeTruthy();
        jasmine.clock().tick(8416);
        jasmine.clock().tick(1);
      });

      await env.execute();

      expect(reporter.specDone.calls.count()).toEqual(1);
      jasmine.clock().tick(1);
      await new Promise(resolve => realSetTimeout(resolve));
    });

    it('should not use the mock clock for asynchronous timeouts', async function() {
      createMockedEnv();
      const reporter = jasmine.createSpyObj('fakeReporter', ['specDone']),
        clock = env.clock;

      reporter.specDone.and.callFake(function() {
        realSetTimeout(function() {
          jasmine.debugLog('Ticking after specDone');
          jasmine.clock().tick(1);
        }, 0);
      });

      env.addReporter(reporter);
      jasmineUnderTest.DEFAULT_TIMEOUT_INTERVAL = 500;

      env.beforeAll(function() {
        clock.install();
      });

      env.afterAll(function() {
        clock.uninstall();
      });

      env.it('spec that should not time out', function(innerDone) {
        clock.tick(1000);
        expect(true).toEqual(true);
        jasmine.debugLog('Calling realSetTimeout in spec');
        realSetTimeout(function() {
          jasmine.debugLog('Calling innerDone');
          innerDone();
        });
      });

      await env.execute();
      expect(reporter.specDone).toHaveBeenCalledTimes(1);
      const event = reporter.specDone.calls.argsFor(0)[0];
      jasmine.debugLog('Spec result: ' + jasmine.basicPrettyPrinter_(event));
      expect(event).toEqual(jasmine.objectContaining({ status: 'passed' }));
      jasmine.clock().tick(1);

      await new Promise(resolve => realSetTimeout(resolve));
    });

    it('should wait a custom interval before reporting async functions that fail to complete', async function() {
      createMockedEnv();
      const reporter = jasmine.createSpyObj('fakeReport', [
        'jasmineDone',
        'suiteDone',
        'specDone'
      ]);

      env.addReporter(reporter);
      jasmineUnderTest.DEFAULT_TIMEOUT_INTERVAL = 10000;

      env.describe('suite', function() {
        env.afterAll(function() {
          realSetTimeout(function() {
            try {
              jasmine.clock().tick(10);
              // eslint-disable-next-line no-unused-vars
            } catch (e) {
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

        env.it(
          'it times out',
          function(innerDone) {
            realSetTimeout(function() {
              jasmine.clock().tick(6001);
            }, 0);
          },
          6000
        );
      });

      await env.execute();

      const r = reporter.jasmineDone.calls.argsFor(0)[0];
      expect(r.failedExpectations).toEqual([]);
      expect(reporter.suiteDone).toHaveFailedExpectationsForRunnable(
        'suite beforeAll',
        [
          /^Error: Timeout - Async function did not complete within 5000ms \(custom timeout\)/
        ]
      );
      expect(reporter.suiteDone).toHaveFailedExpectationsForRunnable(
        'suite afterAll',
        [
          /^Error: Timeout - Async function did not complete within 2000ms \(custom timeout\)/
        ]
      );
      expect(reporter.specDone).toHaveFailedExpectationsForRunnable(
        'suite beforeEach times out',
        [
          /^Error: Timeout - Async function did not complete within 1000ms \(custom timeout\)/
        ]
      );
      expect(reporter.specDone).toHaveFailedExpectationsForRunnable(
        'suite afterEach times out',
        [
          /^Error: Timeout - Async function did not complete within 4000ms \(custom timeout\)/
        ]
      );
      expect(reporter.specDone).toHaveFailedExpectationsForRunnable(
        'suite it times out',
        [
          /^Error: Timeout - Async function did not complete within 6000ms \(custom timeout\)/
        ]
      );

      jasmine.clock().tick(1);
      await new Promise(resolve => realSetTimeout(resolve));
    });
  });

  it('explicitly fails an async spec', async function() {
    const specDone = jasmine.createSpy('specDone');

    env.addReporter({ specDone: specDone });

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

    await env.execute();

    expect(specDone).toHaveFailedExpectationsForRunnable(
      'failing has a default message',
      ['Failed']
    );
    expect(specDone).toHaveFailedExpectationsForRunnable(
      'failing specifies a message',
      ['Failed: messy message']
    );
    expect(specDone).toHaveFailedExpectationsForRunnable(
      'failing fails via the done callback',
      ['Failed: done failed']
    );
    expect(specDone).toHaveFailedExpectationsForRunnable(
      'failing has a message from an Error',
      ['Failed: error message']
    );
    expect(specDone).toHaveFailedExpectationsForRunnable(
      'failing has a message from an Error to done',
      ['Failed: done error']
    );

    await new Promise(resolve => setTimeout(resolve));
  });

  describe('focused tests', function() {
    it('should only run the focused tests', async function() {
      const calls = [];

      env.describe('a suite', function() {
        env.fit('is focused', function() {
          calls.push('focused');
        });

        env.it('is not focused', function() {
          calls.push('freakout');
        });
      });

      await env.execute();

      expect(calls).toEqual(['focused']);
    });

    it('should only run focused suites', async function() {
      const calls = [];

      env.fdescribe('a focused suite', function() {
        env.it('is focused', function() {
          calls.push('focused');
        });
      });

      env.describe('a regular suite', function() {
        env.it('is not focused', function() {
          calls.push('freakout');
        });
      });

      await env.execute();

      expect(calls).toEqual(['focused']);
    });

    it('should run focused tests inside an xdescribe', async function() {
      const reporter = jasmine.createSpyObj('fakeReporter', [
        'jasmineStarted',
        'suiteStarted',
        'suiteDone',
        'specStarted',
        'specDone'
      ]);

      env.addReporter(reporter);

      env.xdescribe('xd suite', function() {
        env.fit('with a fit spec', function() {
          env.expect(true).toBe(false);
        });
      });

      await env.execute();

      expect(reporter.jasmineStarted).toHaveBeenCalledWith({
        totalSpecsDefined: 1,
        order: { random: true, seed: jasmine.any(String) },
        parallel: false
      });

      expect(reporter.specDone).toHaveBeenCalledWith(
        jasmine.objectContaining({
          description: 'with a fit spec',
          status: 'failed'
        })
      );
    });

    it('should run focused suites inside an xdescribe', async function() {
      const reporter = jasmine.createSpyObj('fakeReporter', [
        'jasmineStarted',
        'suiteStarted',
        'suiteDone',
        'specStarted',
        'specDone'
      ]);

      env.addReporter(reporter);

      env.xdescribe('xd suite', function() {
        env.fdescribe('fd suite', function() {
          env.it('with a spec', function() {
            env.expect(true).toBe(false);
          });
        });
      });

      await env.execute();

      expect(reporter.jasmineStarted).toHaveBeenCalledWith({
        totalSpecsDefined: 1,
        order: { random: true, seed: jasmine.any(String) },
        parallel: false
      });

      expect(reporter.specDone).toHaveBeenCalledWith(
        jasmine.objectContaining({
          description: 'with a spec',
          status: 'failed'
        })
      );
    });
  });

  it('should report as expected', async function() {
    const reporter = jasmine.createSpyObj('fakeReporter', [
      'jasmineStarted',
      'suiteStarted',
      'suiteDone',
      'specStarted',
      'specDone'
    ]);
    const suiteFullNameToId = {};
    reporter.suiteStarted.and.callFake(function(e) {
      suiteFullNameToId[e.fullName] = e.id;
    });

    env.configure({ random: false });
    env.addReporter(reporter);

    env.it('a top level spec', function() {});

    env.describe('A Suite', function() {
      env.it('with a spec', function() {
        env.expect(true).toBe(true);
      });
      env.describe('with a nested suite', function() {
        env.xit("with an x'ed spec", function() {
          env.expect(true).toBe(true);
        });
        env.it('with a spec', function() {
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

    await env.execute();

    expect(reporter.jasmineStarted).toHaveBeenCalledWith({
      totalSpecsDefined: 6,
      order: { random: false },
      parallel: false
    });

    expect(reporter.specStarted.calls.count()).toBe(6);
    expect(reporter.specDone.calls.count()).toBe(6);

    const baseSpecEvent = {
      passedExpectations: [],
      failedExpectations: [],
      deprecationWarnings: [],
      pendingReason: '',
      duration: null,
      properties: null,
      debugLogs: null,
      id: jasmine.any(String),
      filename: jasmine.any(String)
    };

    expect(reporter.specStarted.calls.argsFor(0)[0]).toEqual({
      ...baseSpecEvent,
      description: 'a top level spec',
      fullName: 'a top level spec',
      parentSuiteId: null
    });
    expect(reporter.specDone.calls.argsFor(0)[0]).toEqual({
      ...baseSpecEvent,
      description: 'a top level spec',
      fullName: 'a top level spec',
      status: 'passed',
      parentSuiteId: null,
      duration: jasmine.any(Number)
    });
    expect(reporter.specStarted.calls.argsFor(1)[0]).toEqual({
      ...baseSpecEvent,
      description: 'with a spec',
      fullName: 'A Suite with a spec',
      parentSuiteId: suiteFullNameToId['A Suite']
    });
    expect(reporter.specDone.calls.argsFor(1)[0]).toEqual({
      ...baseSpecEvent,
      description: 'with a spec',
      fullName: 'A Suite with a spec',
      status: 'passed',
      parentSuiteId: suiteFullNameToId['A Suite'],
      passedExpectations: [
        {
          matcherName: 'toBe',
          message: 'Passed.',
          stack: '',
          passed: true,
          globalErrorType: undefined
        }
      ],
      duration: jasmine.any(Number)
    });

    expect(reporter.specStarted.calls.argsFor(2)[0]).toEqual({
      ...baseSpecEvent,
      description: "with an x'ed spec",
      fullName: "A Suite with a nested suite with an x'ed spec",
      parentSuiteId: suiteFullNameToId['A Suite with a nested suite'],
      pendingReason: 'Temporarily disabled with xit'
    });
    expect(reporter.specDone.calls.argsFor(2)[0]).toEqual({
      ...baseSpecEvent,
      description: "with an x'ed spec",
      fullName: "A Suite with a nested suite with an x'ed spec",
      status: 'pending',
      parentSuiteId: suiteFullNameToId['A Suite with a nested suite'],
      pendingReason: 'Temporarily disabled with xit',
      duration: jasmine.any(Number)
    });

    expect(reporter.specStarted.calls.argsFor(3)[0]).toEqual({
      ...baseSpecEvent,
      description: 'with a spec',
      fullName: 'A Suite with a nested suite with a spec',
      parentSuiteId: suiteFullNameToId['A Suite with a nested suite']
    });
    expect(reporter.specDone.calls.argsFor(3)[0]).toEqual({
      ...baseSpecEvent,
      description: 'with a spec',
      fullName: 'A Suite with a nested suite with a spec',
      status: 'failed',
      parentSuiteId: suiteFullNameToId['A Suite with a nested suite'],
      failedExpectations: [
        jasmine.objectContaining({
          matcherName: 'toBe',
          message: 'Expected true to be false.'
        })
      ],
      duration: jasmine.any(Number)
    });

    expect(reporter.specStarted.calls.argsFor(4)[0]).toEqual({
      ...baseSpecEvent,
      description: 'is pending',
      fullName: 'A Suite with only non-executable specs is pending',
      parentSuiteId: suiteFullNameToId['A Suite with only non-executable specs']
    });
    expect(reporter.specDone.calls.argsFor(4)[0]).toEqual({
      ...baseSpecEvent,
      description: 'is pending',
      status: 'pending',
      fullName: 'A Suite with only non-executable specs is pending',
      parentSuiteId:
        suiteFullNameToId['A Suite with only non-executable specs'],
      duration: jasmine.any(Number)
    });

    expect(reporter.specStarted.calls.argsFor(5)[0]).toEqual({
      ...baseSpecEvent,
      description: 'is xed',
      fullName: 'A Suite with only non-executable specs is xed',
      parentSuiteId:
        suiteFullNameToId['A Suite with only non-executable specs'],
      pendingReason: 'Temporarily disabled with xit'
    });
    expect(reporter.specDone.calls.argsFor(5)[0]).toEqual({
      ...baseSpecEvent,
      description: 'is xed',
      status: 'pending',
      fullName: 'A Suite with only non-executable specs is xed',
      parentSuiteId:
        suiteFullNameToId['A Suite with only non-executable specs'],
      pendingReason: 'Temporarily disabled with xit',
      duration: jasmine.any(Number)
    });

    expect(reporter.suiteStarted.calls.count()).toBe(3);
    expect(reporter.suiteDone.calls.count()).toBe(3);

    const baseSuiteEvent = {
      id: jasmine.any(String),
      filename: jasmine.any(String),
      failedExpectations: [],
      deprecationWarnings: [],
      duration: null,
      properties: null
    };

    expect(reporter.suiteStarted.calls.argsFor(0)[0]).toEqual({
      ...baseSuiteEvent,
      description: 'A Suite',
      fullName: 'A Suite',
      parentSuiteId: null
    });
    expect(reporter.suiteDone.calls.argsFor(2)[0]).toEqual({
      ...baseSuiteEvent,
      description: 'A Suite',
      fullName: 'A Suite',
      status: 'passed',
      parentSuiteId: null,
      duration: jasmine.any(Number)
    });

    expect(reporter.suiteStarted.calls.argsFor(1)[0]).toEqual({
      ...baseSuiteEvent,
      description: 'with a nested suite',
      fullName: 'A Suite with a nested suite',
      parentSuiteId: suiteFullNameToId['A Suite']
    });
    expect(reporter.suiteDone.calls.argsFor(0)[0]).toEqual({
      ...baseSuiteEvent,
      description: 'with a nested suite',
      status: 'passed',
      fullName: 'A Suite with a nested suite',
      parentSuiteId: suiteFullNameToId['A Suite'],
      duration: jasmine.any(Number)
    });

    expect(reporter.suiteStarted.calls.argsFor(2)[0]).toEqual({
      ...baseSuiteEvent,
      description: 'with only non-executable specs',
      fullName: 'A Suite with only non-executable specs',
      parentSuiteId: suiteFullNameToId['A Suite']
    });
    expect(reporter.suiteDone.calls.argsFor(1)[0]).toEqual({
      ...baseSuiteEvent,
      description: 'with only non-executable specs',
      status: 'passed',
      fullName: 'A Suite with only non-executable specs',
      parentSuiteId: suiteFullNameToId['A Suite'],
      duration: jasmine.any(Number)
    });
  });

  it('reports focused specs and suites as expected', async function() {
    const reporter = jasmine.createSpyObj('fakeReporter', [
      'suiteStarted',
      'suiteDone',
      'specStarted',
      'specDone'
    ]);
    const suiteFullNameToId = {};
    reporter.suiteStarted.and.callFake(function(e) {
      suiteFullNameToId[e.fullName] = e.id;
    });

    env.fit('a focused top level spec', function() {});

    env.describe('a suite', function() {
      env.fdescribe('a focused suite', function() {
        env.fit('a focused spec', function() {});
      });
    });

    env.addReporter(reporter);
    await env.execute();

    expect(reporter.specStarted).toHaveBeenCalledTimes(2);
    expect(reporter.specDone).toHaveBeenCalledTimes(2);

    expect(reporter.specStarted).toHaveBeenCalledWith(
      jasmine.objectContaining({
        description: 'a focused top level spec',
        parentSuiteId: null
      })
    );
    expect(reporter.specDone).toHaveBeenCalledWith(
      jasmine.objectContaining({
        description: 'a focused top level spec',
        status: 'passed',
        parentSuiteId: null
      })
    );

    expect(reporter.specStarted).toHaveBeenCalledWith(
      jasmine.objectContaining({
        description: 'a focused spec',
        parentSuiteId: suiteFullNameToId['a suite a focused suite']
      })
    );
    expect(reporter.specDone).toHaveBeenCalledWith(
      jasmine.objectContaining({
        description: 'a focused spec',
        status: 'passed',
        parentSuiteId: suiteFullNameToId['a suite a focused suite']
      })
    );

    expect(reporter.suiteStarted).toHaveBeenCalledWith(
      jasmine.objectContaining({
        description: 'a suite',
        parentSuiteId: null
      })
    );
    expect(reporter.suiteDone).toHaveBeenCalledWith(
      jasmine.objectContaining({
        description: 'a suite',
        status: 'passed',
        parentSuiteId: null
      })
    );

    expect(reporter.suiteStarted).toHaveBeenCalledWith(
      jasmine.objectContaining({
        description: 'a focused suite',
        parentSuiteId: suiteFullNameToId['a suite']
      })
    );
    expect(reporter.suiteDone).toHaveBeenCalledWith(
      jasmine.objectContaining({
        description: 'a focused suite',
        status: 'passed',
        parentSuiteId: suiteFullNameToId['a suite']
      })
    );
  });

  it('should report the random seed at the beginning and end of execution', async function() {
    const reporter = jasmine.createSpyObj('fakeReporter', [
      'jasmineStarted',
      'jasmineDone',
      'suiteStarted',
      'suiteDone',
      'specStarted',
      'specDone'
    ]);
    env.configure({ random: true, seed: '123456' });

    env.addReporter(reporter);
    env.configure({ random: true });
    await env.execute();

    expect(reporter.jasmineStarted).toHaveBeenCalled();
    const startedArg = reporter.jasmineStarted.calls.argsFor(0)[0];
    expect(startedArg.order).toEqual({ random: true, seed: '123456' });

    const doneArg = reporter.jasmineDone.calls.argsFor(0)[0];
    expect(doneArg.order).toEqual({ random: true, seed: '123456' });
  });

  it('coerces the random seed to a string if it is a number', async function() {
    const reporter = jasmine.createSpyObj('fakeReporter', [
      'jasmineStarted',
      'jasmineDone',
      'suiteStarted',
      'suiteDone',
      'specStarted',
      'specDone'
    ]);
    env.configure({ random: true, seed: 123456 });

    env.addReporter(reporter);
    env.configure({ random: true });
    await env.execute();

    expect(reporter.jasmineStarted).toHaveBeenCalled();
    const startedArg = reporter.jasmineStarted.calls.argsFor(0)[0];
    expect(startedArg.order.seed).toEqual('123456');

    const doneArg = reporter.jasmineDone.calls.argsFor(0)[0];
    expect(doneArg.order.seed).toEqual('123456');
  });

  it('should report pending spec messages', async function() {
    const reporter = jasmine.createSpyObj('fakeReporter', ['specDone']);

    env.addReporter(reporter);

    env.it('will be pending', function() {
      env.pending('with a message');
    });

    await env.execute();

    const specStatus = reporter.specDone.calls.argsFor(0)[0];
    expect(specStatus.status).toBe('pending');
    expect(specStatus.pendingReason).toBe('with a message');
  });

  it('should report pending spec messages from promise-returning functions', async function() {
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

    const reporter = jasmine.createSpyObj('fakeReporter', ['specDone']);

    env.addReporter(reporter);

    env.it('will be pending', function() {
      return new StubPromise(function() {
        env.pending('with a message');
      });
    });

    await env.execute();

    const specStatus = reporter.specDone.calls.argsFor(0)[0];
    expect(specStatus.status).toBe('pending');
    expect(specStatus.pendingReason).toBe('with a message');
  });

  it('should report using fallback reporter', function(done) {
    const reporter = jasmine.createSpyObj('fakeReporter', [
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

  it('should report xdescribes as expected', async function() {
    const reporter = jasmine.createSpyObj('fakeReporter', [
      'jasmineStarted',
      'suiteStarted',
      'suiteDone',
      'specStarted',
      'specDone'
    ]);

    env.addReporter(reporter);

    env.describe('A Suite', function() {
      env.describe('nested', function() {
        env.xdescribe('xd out', function() {
          env.describe('nested again', function() {
            env.it('with a spec', function() {
              env.expect(true).toBe(false);
            });
          });
        });
      });
    });

    await env.execute();

    expect(reporter.jasmineStarted).toHaveBeenCalledWith({
      totalSpecsDefined: 1,
      order: { random: true, seed: jasmine.any(String) },
      parallel: false
    });

    expect(reporter.specDone).toHaveBeenCalledWith(
      jasmine.objectContaining({ status: 'pending' })
    );
    expect(reporter.suiteDone).toHaveBeenCalledWith(
      jasmine.objectContaining({ description: 'xd out', status: 'pending' })
    );
    expect(reporter.suiteDone.calls.count()).toBe(4);
  });

  it('should be possible to get full name from a spec', function() {
    let topLevelSpec, nestedSpec, doublyNestedSpec;

    env.describe('my tests', function() {
      topLevelSpec = env.it('are sometimes top level', function() {});
      env.describe('are sometimes', function() {
        nestedSpec = env.it('singly nested', function() {});
        env.describe('even', function() {
          doublyNestedSpec = env.it('doubly nested', function() {});
        });
      });
    });

    expect(topLevelSpec.getFullName()).toBe('my tests are sometimes top level');
    expect(nestedSpec.getFullName()).toBe(
      'my tests are sometimes singly nested'
    );
    expect(doublyNestedSpec.getFullName()).toBe(
      'my tests are sometimes even doubly nested'
    );
  });

  it('Custom equality testers should be per spec', async function() {
    const reporter = jasmine.createSpyObj('fakeReporter', ['specDone']);

    env.addReporter(reporter);
    env.configure({ random: false });

    env.describe('testing custom equality testers', function() {
      env.it('with a custom tester', function() {
        env.addCustomEqualityTester(function() {
          return true;
        });
        env.expect('a').toEqual('b');
      });

      env.it('without a custom tester', function() {
        env.expect('a').toEqual('b');
      });
    });

    await env.execute();

    const firstSpecResult = reporter.specDone.calls.first().args[0],
      secondSpecResult = reporter.specDone.calls.mostRecent().args[0];

    expect(firstSpecResult.status).toEqual('passed');
    expect(secondSpecResult.status).toEqual('failed');
  });

  it('Custom equality testers should be per suite', async function() {
    const reporter = jasmine.createSpyObj('fakeReporter', ['specDone']);

    env.addReporter(reporter);
    env.configure({ random: false });

    env.describe('testing custom equality testers', function() {
      env.beforeAll(function() {
        env.addCustomEqualityTester(function() {
          return true;
        });
      });

      env.it('with a custom tester', function() {
        env.expect('a').toEqual('b');
      });

      env.it('with the same custom tester', function() {
        env.expect('a').toEqual('b');
      });
    });

    env.describe('another suite', function() {
      env.it('without the custom tester', function() {
        env.expect('a').toEqual('b');
      });
    });

    await env.execute();

    const firstSpecResult = reporter.specDone.calls.first().args[0],
      secondSpecResult = reporter.specDone.calls.argsFor(0)[0],
      thirdSpecResult = reporter.specDone.calls.mostRecent().args[0];

    expect(firstSpecResult.status).toEqual('passed');
    expect(secondSpecResult.status).toEqual('passed');
    expect(thirdSpecResult.status).toEqual('failed');
  });

  it('Custom equality testers for toContain should be per spec', async function() {
    const reporter = jasmine.createSpyObj('fakeReporter', ['specDone']);

    env.addReporter(reporter);
    env.configure({ random: false });

    env.describe('testing custom equality testers', function() {
      env.it('with a custom tester', function() {
        env.addCustomEqualityTester(function() {
          return true;
        });
        env.expect(['a']).toContain('b');
      });

      env.it('without a custom tester', function() {
        env.expect(['a']).toContain('b');
      });
    });

    await env.execute();

    const firstSpecResult = reporter.specDone.calls.first().args[0],
      secondSpecResult = reporter.specDone.calls.mostRecent().args[0];

    expect(firstSpecResult.status).toEqual('passed');
    expect(secondSpecResult.status).toEqual('failed');
  });

  it("produces an understandable error message when an 'expect' is used outside of a current spec", async function() {
    env.describe('A Suite', function() {
      env.it('an async spec that is actually synchronous', function(
        underTestCallback
      ) {
        underTestCallback();
      });
      expect(function() {
        env.expect('a').toEqual('a');
      }).toThrowError(/'expect' was used when there was no current spec/);
    });

    await env.execute();
  });

  it('Custom equality testers for toContain should be per suite', async function() {
    const reporter = jasmine.createSpyObj('fakeReporter', ['specDone']);

    env.addReporter(reporter);
    env.configure({ random: false });

    env.describe('testing custom equality testers', function() {
      env.beforeAll(function() {
        env.addCustomEqualityTester(function() {
          return true;
        });
      });

      env.it('with a custom tester', function() {
        env.expect(['a']).toContain('b');
      });

      env.it('also with the custom tester', function() {
        env.expect(['a']).toContain('b');
      });
    });

    env.describe('another suite', function() {
      env.it('without the custom tester', function() {
        env.expect(['a']).toContain('b');
      });
    });

    await env.execute();

    const firstSpecResult = reporter.specDone.calls.first().args[0],
      secondSpecResult = reporter.specDone.calls.argsFor(1)[0],
      thirdSpecResult = reporter.specDone.calls.mostRecent().args[0];

    expect(firstSpecResult.status).toEqual('passed');
    expect(secondSpecResult.status).toEqual('passed');
    expect(thirdSpecResult.status).toEqual('failed');
  });

  it('Custom matchers should be per spec', async function() {
    const matchers = {
      toFoo: function() {}
    };

    env.describe('testing custom matchers', function() {
      env.it('with a custom matcher', function() {
        env.addMatchers(matchers);
        expect(env.expect().toFoo).toBeDefined();
      });

      env.it('without a custom matcher', function() {
        expect(env.expect().toFoo).toBeUndefined();
      });
    });

    await env.execute();
  });

  it('Custom matchers should be per suite', async function() {
    const matchers = {
      toFoo: function() {}
    };

    env.describe('testing custom matchers', function() {
      env.beforeAll(function() {
        env.addMatchers(matchers);
      });

      env.it('with a custom matcher', function() {
        expect(env.expect().toFoo).toBeDefined();
      });

      env.it('with the same custom matcher', function() {
        expect(env.expect().toFoo).toBeDefined();
      });
    });

    env.describe('another suite', function() {
      env.it('no longer has the custom matcher', function() {
        expect(env.expect().toFoo).not.toBeDefined();
      });
    });

    await env.execute();
  });

  it('throws an exception if you try to create a spy outside of a runnable', async function() {
    const obj = { fn: function() {} };
    let exception;

    env.describe('a suite', function() {
      try {
        env.spyOn(obj, 'fn');
      } catch (e) {
        exception = e;
      }
      env.it('has a test', function() {});
    });

    await env.execute();

    expect(exception.message).toBe(
      'Spies must be created in a before function or a spec'
    );
  });

  it('throws an exception if you try to add a matcher outside of a runnable', async function() {
    let exception;

    env.describe('a suite', function() {
      try {
        env.addMatchers({
          myMatcher: function() {
            return false;
          }
        });
      } catch (e) {
        exception = e;
      }
      env.it('has a test', function() {});
    });

    await env.execute();

    expect(exception.message).toBe(
      'Matchers must be added in a before function or a spec'
    );
  });

  it('throws an exception if you try to add a custom equality outside of a runnable', async function() {
    let exception;

    env.describe('a suite', function() {
      try {
        env.addCustomEqualityTester(function() {
          return true;
        });
      } catch (e) {
        exception = e;
      }
      env.it('has a test', function() {});
    });

    await env.execute();

    expect(exception.message).toBe(
      'Custom Equalities must be added in a before function or a spec'
    );
  });

  it('throws an exception if you try to getSpecProperty outside of a spec', async function() {
    const env = new jasmineUnderTest.Env();
    let exception;

    env.describe('a suite', function() {
      env.it('a spec');
      try {
        env.getSpecProperty('a prop');
      } catch (e) {
        exception = e;
      }
      env.it('has a test', function() {});
    });

    await env.execute();

    expect(exception.message).toBe(
      "'getSpecProperty' was used when there was no current spec"
    );
  });

  it('reports test properties on specs', async function() {
    const env = new jasmineUnderTest.Env(),
      reporter = jasmine.createSpyObj('reporter', ['suiteDone', 'specDone']);

    reporter.specDone.and.callFake(function(e) {
      expect(e.properties).toEqual({
        fromBeforeEach: 'Pie',
        fromSpecInnerCallback: 'Bee',
        willChangeInAfterEach: 2,
        fromAfterEach: 'Cheese'
      });
    });

    env.addReporter(reporter);
    env.beforeEach(function() {
      env.setSpecProperty('fromBeforeEach', 'Pie');
    });
    env.afterEach(function() {
      env.setSpecProperty(
        'willChangeInAfterEach',
        env.getSpecProperty('willChangeInAfterEach') + 1
      );
      env.setSpecProperty('fromAfterEach', 'Cheese');
    });
    env.it('calls setSpecProperty', function() {
      env.setSpecProperty('fromSpecInnerCallback', 'Bee');
      env.setSpecProperty('willChangeInAfterEach', 1);
    });
    await env.execute();

    expect(reporter.specDone).toHaveBeenCalled();
  });

  it('throws an exception if you try to setSpecProperty outside of a spec', async function() {
    const env = new jasmineUnderTest.Env();
    let exception;

    env.describe('a suite', function() {
      env.it('a spec');
      try {
        env.setSpecProperty('a prop', 'val');
      } catch (e) {
        exception = e;
      }
      env.it('has a test', function() {});
    });

    await env.execute();

    expect(exception.message).toBe(
      "'setSpecProperty' was used when there was no current spec"
    );
  });

  it('reports test properties on suites', async function() {
    const env = new jasmineUnderTest.Env(),
      reporter = jasmine.createSpyObj('reporter', [
        'jasmineDone',
        'suiteDone',
        'specDone'
      ]);

    reporter.suiteDone.and.callFake(function(e) {
      expect(e.properties).toEqual({ b: 'Sweet' });
    });

    env.addReporter(reporter);
    env.describe('calls setSuiteProperty', function() {
      env.beforeEach(function() {
        env.setSuiteProperty('b', 'Sweet');
      });
      env.it('a passing spec', function() {
        expect.nothing();
      });
    });

    await env.execute();

    expect(reporter.suiteDone).toHaveBeenCalled();
  });

  it('throws an exception if you try to setSuiteProperty outside of a suite', function(done) {
    const env = new jasmineUnderTest.Env();

    try {
      env.setSuiteProperty('a', 'Bee');
    } catch (e) {
      expect(e.message).toBe(
        "'setSuiteProperty' was used when there was no current suite"
      );
      done();
    }
  });

  it('should associate errors thrown from async code with the correct runnable', async function() {
    const reporter = jasmine.createSpyObj('fakeReport', [
      'suiteDone',
      'specDone'
    ]);

    env.addReporter(reporter);

    env.describe('async suite', function() {
      env.afterAll(function(innerDone) {
        setTimeout(function() {
          throw new Error('suite');
        }, 1);
      }, 50);

      env.it('spec', function() {});
    });

    env.describe('suite', function() {
      env.it(
        'async spec',
        function(innerDone) {
          setTimeout(function() {
            throw new Error('spec');
          }, 1);
        },
        50
      );
    });

    await jasmine.spyOnGlobalErrorsAsync(async function(globalErrorSpy) {
      await env.execute();

      if (isBrowser) {
        // Verify that there were no unexpected errors
        expect(globalErrorSpy).toHaveBeenCalledTimes(2);
        expect(globalErrorSpy).toHaveBeenCalledWith(new Error('suite'));
        expect(globalErrorSpy).toHaveBeenCalledWith(new Error('spec'));
      }
    });

    expect(reporter.suiteDone).toHaveFailedExpectationsForRunnable(
      'async suite',
      [/Error: suite/]
    );
    expect(reporter.specDone).toHaveFailedExpectationsForRunnable(
      'suite async spec',
      [/Error: spec/]
    );
  });

  it("should throw on suites/specs/befores/afters nested in methods other than 'describe'", async function() {
    const reporter = jasmine.createSpyObj('reporter', [
      'suiteDone',
      'specDone'
    ]);

    env.addReporter(reporter);

    env.describe('suite', function() {
      env.it('describe', function() {
        env.describe('inner suite', function() {});
      });
      env.it('xdescribe', function() {
        env.xdescribe('inner suite', function() {});
      });
      env.it('fdescribe', function() {
        env.fdescribe('inner suite', function() {});
      });
    });

    env.describe('spec', function() {
      env.it('it', function() {
        env.it('inner spec', function() {});
      });
      env.it('xit', function() {
        env.xit('inner spec', function() {});
      });
      env.it('fit', function() {
        env.fit('inner spec', function() {});
      });
    });

    env.describe('beforeAll', function() {
      env.beforeAll(function() {
        env.beforeAll(function() {});
      });
      env.it('spec', function() {});
    });

    env.describe('beforeEach', function() {
      env.beforeEach(function() {
        env.beforeEach(function() {});
      });
      env.it('spec', function() {});
    });

    env.describe('afterAll', function() {
      env.afterAll(function() {
        env.afterAll(function() {});
      });
      env.it('spec', function() {});
    });

    env.describe('afterEach', function() {
      env.afterEach(function() {
        env.afterEach(function() {});
      });
      env.it('spec', function() {});
    });

    await env.execute();

    const msg = /\'.*\' should only be used in \'describe\' function/;

    expect(reporter.specDone).toHaveFailedExpectationsForRunnable(
      'suite describe',
      [msg]
    );
    expect(reporter.specDone).toHaveFailedExpectationsForRunnable(
      'suite xdescribe',
      [msg]
    );
    expect(reporter.specDone).toHaveFailedExpectationsForRunnable(
      'suite fdescribe',
      [msg]
    );

    expect(reporter.specDone).toHaveFailedExpectationsForRunnable('spec it', [
      msg
    ]);
    expect(reporter.specDone).toHaveFailedExpectationsForRunnable('spec xit', [
      msg
    ]);
    expect(reporter.specDone).toHaveFailedExpectationsForRunnable('spec fit', [
      msg
    ]);

    expect(reporter.suiteDone).toHaveFailedExpectationsForRunnable(
      'beforeAll',
      [msg]
    );
    expect(reporter.specDone).toHaveFailedExpectationsForRunnable(
      'beforeEach spec',
      [msg]
    );

    expect(reporter.suiteDone).toHaveFailedExpectationsForRunnable('afterAll', [
      msg
    ]);
    expect(reporter.specDone).toHaveFailedExpectationsForRunnable(
      'afterEach spec',
      [msg]
    );
  });

  describe('Overall status in the jasmineDone event', function() {
    describe('When everything passes', function() {
      it('is "passed"', async function() {
        const reporter = jasmine.createSpyObj('reporter', [
          'jasmineDone',
          'suiteDone',
          'specDone'
        ]);

        env.addReporter(reporter);
        env.it('passes', function() {});
        await env.execute();

        const e = reporter.jasmineDone.calls.argsFor(0)[0];
        expect(e.overallStatus).toEqual('passed');
      });
    });

    describe('When a spec fails', function() {
      it('is "failed"', async function() {
        const reporter = jasmine.createSpyObj('reporter', [
          'jasmineDone',
          'suiteDone',
          'specDone'
        ]);

        env.addReporter(reporter);
        env.it('fails', function() {
          env.expect(true).toBe(false);
        });
        await env.execute();

        const e = reporter.jasmineDone.calls.argsFor(0)[0];
        expect(e.overallStatus).toEqual('failed');
      });
    });

    describe('when spec has no expectations', function() {
      let reporter;

      beforeEach(function() {
        reporter = jasmine.createSpyObj('reporter', [
          'jasmineDone',
          'suiteDone',
          'specDone'
        ]);

        env.addReporter(reporter);
        env.it('is a spec without any expectations', function() {
          // does nothing, just a mock spec without expectations
        });
      });

      it('should report "failed" status if "failSpecWithNoExpectations" is enabled', async function() {
        env.configure({ failSpecWithNoExpectations: true });
        await env.execute();

        const e = reporter.jasmineDone.calls.argsFor(0)[0];
        expect(e.overallStatus).toEqual('failed');
      });

      it('should report "passed" status if "failSpecWithNoExpectations" is disabled', async function() {
        env.configure({ failSpecWithNoExpectations: false });
        await env.execute();

        const e = reporter.jasmineDone.calls.argsFor(0)[0];
        expect(e.overallStatus).toEqual('passed');
      });
    });

    describe('When a top-level beforeAll fails', function() {
      it('is "failed"', async function() {
        const reporter = jasmine.createSpyObj('reporter', [
          'jasmineDone',
          'suiteDone',
          'specDone'
        ]);

        env.addReporter(reporter);
        env.beforeAll(function() {
          throw new Error('nope');
        });
        env.it('does not run', function() {});
        await env.execute();

        const e = reporter.jasmineDone.calls.argsFor(0)[0];
        expect(e.overallStatus).toEqual('failed');
      });
    });

    describe('When a suite beforeAll fails', function() {
      it('is "failed"', async function() {
        const reporter = jasmine.createSpyObj('reporter', [
          'jasmineDone',
          'suiteDone',
          'specDone'
        ]);

        env.addReporter(reporter);
        env.describe('something', function() {
          env.beforeAll(function() {
            throw new Error('nope');
          });
          env.it('does not run', function() {});
        });
        await env.execute();

        const e = reporter.jasmineDone.calls.argsFor(0)[0];
        expect(e.overallStatus).toEqual('failed');
      });
    });

    describe('When a top-level afterAll fails', function() {
      it('is "failed"', async function() {
        const reporter = jasmine.createSpyObj('reporter', [
          'jasmineDone',
          'suiteDone',
          'specDone'
        ]);

        env.addReporter(reporter);
        env.afterAll(function() {
          throw new Error('nope');
        });
        env.it('does not run', function() {});
        await env.execute();

        const e = reporter.jasmineDone.calls.argsFor(0)[0];
        expect(e.overallStatus).toEqual('failed');
      });
    });

    describe('When a suite afterAll fails', function() {
      it('is "failed"', async function() {
        const reporter = jasmine.createSpyObj('reporter', [
          'jasmineDone',
          'suiteDone',
          'specDone'
        ]);

        env.addReporter(reporter);
        env.describe('something', function() {
          env.afterAll(function() {
            throw new Error('nope');
          });
          env.it('does not run', function() {});
        });
        await env.execute();

        const e = reporter.jasmineDone.calls.argsFor(0)[0];
        expect(e.overallStatus).toEqual('failed');
      });
    });

    describe('When there are load errors', function() {
      it('is "failed"', async function() {
        const global = {
          ...browserEventMethods(),
          setTimeout: function(fn, delay) {
            return setTimeout(fn, delay);
          },
          clearTimeout: function(fn, delay) {
            return clearTimeout(fn, delay);
          },
          queueMicrotask: function(fn) {
            queueMicrotask(fn);
          }
        };
        spyOn(jasmineUnderTest, 'getGlobal').and.returnValue(global);

        env.cleanup_();
        env = new jasmineUnderTest.Env();
        const reporter = jasmine.createSpyObj('reporter', [
          'jasmineDone',
          'suiteDone',
          'specDone'
        ]);

        reporter.jasmineDone.and.callFake(function(e) {
          expect(e.overallStatus).toEqual('failed');
        });

        env.addReporter(reporter);
        env.it('passes', function() {});
        dispatchErrorEvent(global, { error: 'ENOCHEESE' });
        await env.execute();

        expect(reporter.jasmineDone).toHaveBeenCalled();
      });
    });

    describe('When there are no specs', function() {
      it('is "incomplete"', async function() {
        const reporter = jasmine.createSpyObj('reporter', [
          'jasmineDone',
          'suiteDone',
          'specDone'
        ]);

        env.addReporter(reporter);
        await env.execute();

        const e = reporter.jasmineDone.calls.argsFor(0)[0];
        expect(e.overallStatus).toEqual('incomplete');
        expect(e.incompleteReason).toEqual('No specs found');
        expect(e.incompleteCode).toEqual('noSpecsFound');
      });
    });

    describe('When a spec is focused', function() {
      it('is "incomplete"', async function() {
        const reporter = jasmine.createSpyObj('reporter', [
          'jasmineDone',
          'suiteDone',
          'specDone'
        ]);

        env.addReporter(reporter);
        env.fit('is focused', function() {});
        await env.execute();

        const e = reporter.jasmineDone.calls.argsFor(0)[0];
        expect(e.overallStatus).toEqual('incomplete');
        expect(e.incompleteReason).toEqual('fit() or fdescribe() was found');
        expect(e.incompleteCode).toEqual('focused');
      });
    });

    describe('When a suite is focused', function() {
      it('is "incomplete"', async function() {
        const reporter = jasmine.createSpyObj('reporter', [
          'jasmineDone',
          'suiteDone',
          'specDone'
        ]);

        env.addReporter(reporter);
        env.fdescribe('something focused', function() {
          env.it('does a thing', function() {});
        });
        await env.execute();

        const e = reporter.jasmineDone.calls.argsFor(0)[0];
        expect(e.overallStatus).toEqual('incomplete');
        expect(e.incompleteReason).toEqual('fit() or fdescribe() was found');
        expect(e.incompleteCode).toEqual('focused');
      });
    });

    describe('When there are both failures and focused specs', function() {
      it('is "failed"', async function() {
        const reporter = jasmine.createSpyObj('reporter', [
          'jasmineDone',
          'suiteDone',
          'specDone'
        ]);

        env.addReporter(reporter);
        env.fit('is focused', function() {
          env.expect(true).toBe(false);
        });
        await env.execute();

        const e = reporter.jasmineDone.calls.argsFor(0)[0];
        expect(e.overallStatus).toEqual('failed');
        expect(e.incompleteReason).toBeUndefined();
        expect(e.incompleteCode).toBeUndefined();
      });
    });
  });

  it('should report deprecation stack with an error object', async function() {
    const exceptionFormatter = new jasmineUnderTest.ExceptionFormatter(),
      reporter = jasmine.createSpyObj('reporter', [
        'jasmineDone',
        'suiteDone',
        'specDone'
      ]),
      topLevelError = new Error('top level deprecation'),
      suiteLevelError = new Error('suite level deprecation'),
      specLevelError = new Error('spec level deprecation');

    // prevent deprecation from being displayed
    spyOn(console, 'error');

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

    await env.execute();

    const result = reporter.jasmineDone.calls.argsFor(0)[0];
    expect(result.deprecationWarnings).toEqual([
      jasmine.objectContaining({
        message: topLevelError.message,
        stack: exceptionFormatter.stack(topLevelError, { omitMessage: true })
      })
    ]);

    expect(reporter.suiteDone).toHaveBeenCalledWith(
      jasmine.objectContaining({
        fullName: 'suite',
        deprecationWarnings: [
          jasmine.objectContaining({
            message: suiteLevelError.message,
            stack: exceptionFormatter.stack(suiteLevelError, {
              omitMessage: true
            })
          })
        ]
      })
    );

    expect(reporter.specDone).toHaveBeenCalledWith(
      jasmine.objectContaining({
        fullName: 'suite spec',
        deprecationWarnings: [
          jasmine.objectContaining({
            message: specLevelError.message,
            stack: exceptionFormatter.stack(specLevelError, {
              omitMessage: true
            })
          })
        ]
      })
    );
  });

  it('supports async matchers', async function() {
    const specDone = jasmine.createSpy('specDone'),
      suiteDone = jasmine.createSpy('suiteDone'),
      jasmineDone = jasmine.createSpy('jasmineDone');

    env.addReporter({
      specDone: specDone,
      suiteDone: suiteDone,
      jasmineDone: jasmineDone
    });

    function fail(innerDone) {
      let resolve;
      const p = new Promise(function(res) {
        resolve = res;
      });
      env
        .expectAsync(p)
        .toBeRejected()
        .then(innerDone);
      resolve();
    }

    env.afterAll(fail);
    env.describe('a suite', function() {
      env.afterAll(fail);
      env.it('has an async failure', fail);
    });

    await env.execute();

    const result = jasmineDone.calls.argsFor(0)[0];
    expect(result.failedExpectations).toEqual([
      jasmine.objectContaining({
        message: 'Expected [object Promise] to be rejected.'
      })
    ]);

    expect(specDone).toHaveBeenCalledWith(
      jasmine.objectContaining({
        description: 'has an async failure',
        failedExpectations: [
          jasmine.objectContaining({
            message: 'Expected [object Promise] to be rejected.'
          })
        ]
      })
    );

    expect(suiteDone).toHaveBeenCalledWith(
      jasmine.objectContaining({
        description: 'a suite',
        failedExpectations: [
          jasmine.objectContaining({
            message: 'Expected [object Promise] to be rejected.'
          })
        ]
      })
    );
  });

  it('provides custom equality testers to async matchers', async function() {
    const specDone = jasmine.createSpy('specDone');

    env.addReporter({ specDone: specDone });

    env.it('has an async failure', function() {
      env.addCustomEqualityTester(function() {
        return true;
      });
      const p = Promise.resolve('something');
      return env.expectAsync(p).toBeResolvedTo('something else');
    });

    await env.execute();

    expect(specDone).toHaveBeenCalledWith(
      jasmine.objectContaining({
        description: 'has an async failure',
        failedExpectations: []
      })
    );
  });

  it('includes useful stack frames in async matcher failures', async function() {
    const specDone = jasmine.createSpy('specDone');

    env.addReporter({ specDone: specDone });

    env.it('has an async failure', function() {
      env.addCustomEqualityTester(function() {
        return true;
      });
      const p = Promise.resolve();
      return env.expectAsync(p).toBeRejected();
    });

    await env.execute();

    expect(specDone).toHaveBeenCalledWith(
      jasmine.objectContaining({
        failedExpectations: [
          jasmine.objectContaining({
            stack: jasmine.stringMatching('EnvSpec.js')
          })
        ]
      })
    );
  });

  it('reports an error when an async expectation occurs after the spec finishes', async function() {
    const jasmineDone = jasmine.createSpy('jasmineDone');
    let resolve;
    const promise = new Promise(function(res) {
      resolve = res;
    });

    env.configure({ random: false });

    env.describe('a suite', function() {
      env.it('does not wait', function() {
        // Note: we intentionally don't return the result of each expectAsync.
        // This causes the spec to finish before the expectations are evaluated.
        env.expectAsync(promise).toBeResolved();
        env.expectAsync(promise).toBeResolvedTo('something else');
      });
    });

    env.it('another spec', function(done) {
      // This is here to make sure that the async expectation evaluates
      // before the Jasmine under test finishes, especially on Safari 8 and 9.
      setTimeout(done, 10);
    });

    env.addReporter({
      specDone: function() {
        resolve();
      },
      jasmineDone: jasmineDone
    });

    await env.execute();

    const result = jasmineDone.calls.argsFor(0)[0];
    expect(result.failedExpectations).toEqual([
      jasmine.objectContaining({
        passed: false,
        globalErrorType: 'lateExpectation',
        message:
          'Spec "a suite does not wait" ran a "toBeResolved" expectation ' +
          'after it finished.\n' +
          '1. Did you forget to return or await the result of expectAsync?\n' +
          '2. Was done() invoked before an async operation completed?\n' +
          '3. Did an expectation follow a call to done()?',
        matcherName: 'toBeResolved'
      }),
      jasmine.objectContaining({
        passed: false,
        globalErrorType: 'lateExpectation',
        message:
          'Spec "a suite does not wait" ran a "toBeResolvedTo" expectation ' +
          'after it finished.\n' +
          "Message: \"Expected a promise to be resolved to 'something else' " +
          'but it was resolved to undefined."\n' +
          '1. Did you forget to return or await the result of expectAsync?\n' +
          '2. Was done() invoked before an async operation completed?\n' +
          '3. Did an expectation follow a call to done()?',
        matcherName: 'toBeResolvedTo'
      })
    ]);
  });

  it('reports an error when an async expectation occurs after the suite finishes', async function() {
    const jasmineDone = jasmine.createSpy('jasmineDone');
    let resolve;
    const promise = new Promise(function(res) {
      resolve = res;
    });

    env.configure({ random: false });

    env.describe('a suite', function() {
      env.afterAll(function() {
        // Note: we intentionally don't return the result of expectAsync.
        // This causes the suite to finish before the expectations are evaluated.
        env.expectAsync(promise).toBeResolved();
      });

      env.it('is a spec', function() {});
    });

    env.it('another spec', function(done) {
      // This is here to make sure that the async expectation evaluates
      // before the Jasmine under test finishes, especially on Safari 8 and 9.
      setTimeout(done, 10);
    });

    env.addReporter({
      suiteDone: function() {
        resolve();
      },
      jasmineDone: jasmineDone
    });

    await env.execute();

    const result = jasmineDone.calls.argsFor(0)[0];
    expect(result.failedExpectations).toEqual([
      {
        passed: false,
        globalErrorType: 'lateExpectation',
        message:
          'Suite "a suite" ran a "toBeResolved" expectation ' +
          'after it finished.\n' +
          '1. Did you forget to return or await the result of expectAsync?\n' +
          '2. Was done() invoked before an async operation completed?\n' +
          '3. Did an expectation follow a call to done()?',
        matcherName: 'toBeResolved',
        stack: jasmine.any(String)
      }
    ]);
  });

  it('supports asymmetric equality testers that take a matchersUtil', async function() {
    const env = new jasmineUnderTest.Env();

    env.it('spec using custom asymmetric equality tester', function() {
      const customEqualityFn = function(a, b) {
        if (a === 2 && b === 'two') {
          return true;
        }
      };
      const arrayWithFirstElement = function(sample) {
        return {
          asymmetricMatch: function(actual, matchersUtil) {
            return matchersUtil.equals(sample, actual[0]);
          }
        };
      };

      env.addCustomEqualityTester(customEqualityFn);
      env.expect(['two']).toEqual(arrayWithFirstElement(2));
    });

    const specExpectations = function(result) {
      expect(result.status).toEqual('passed');
    };

    env.addReporter({ specDone: specExpectations });
    await env.execute();
  });

  describe('The promise returned by #execute', function() {
    beforeEach(function() {
      this.savedInterval = jasmineUnderTest.DEFAULT_TIMEOUT_INTERVAL;
    });

    afterEach(function() {
      jasmineUnderTest.DEFAULT_TIMEOUT_INTERVAL = this.savedInterval;
    });

    it('is resolved after reporter events are dispatched', function() {
      const reporter = jasmine.createSpyObj('reporter', [
        'specDone',
        'suiteDone',
        'jasmineDone'
      ]);

      env.addReporter(reporter);
      env.describe('suite', function() {
        env.it('spec', function() {});
      });

      return env.execute(null).then(function() {
        expect(reporter.specDone).toHaveBeenCalled();
        expect(reporter.suiteDone).toHaveBeenCalled();
        expect(reporter.jasmineDone).toHaveBeenCalled();
      });
    });

    it('is resolved after the stack is cleared', function(done) {
      const realClearStack = jasmineUnderTest.getClearStack(
          jasmineUnderTest.getGlobal()
        ),
        clearStackSpy = jasmine
          .createSpy('clearStack')
          .and.callFake(realClearStack);
      spyOn(jasmineUnderTest, 'getClearStack').and.returnValue(clearStackSpy);

      // Create a new env that has the clearStack defined above
      env.cleanup_();
      env = new jasmineUnderTest.Env();

      env.describe('suite', function() {
        env.it('spec', function() {});
      });

      env.execute(null).then(function() {
        expect(clearStackSpy).toHaveBeenCalled(); // (many times)
        clearStackSpy.calls.reset();
        setTimeout(function() {
          expect(clearStackSpy).not.toHaveBeenCalled();
          done();
        });
      });
    });

    it('is resolved after QueueRunner timeouts are cleared', function() {
      const setTimeoutSpy = spyOn(
        jasmineUnderTest.getGlobal(),
        'setTimeout'
      ).and.callThrough();
      const clearTimeoutSpy = spyOn(
        jasmineUnderTest.getGlobal(),
        'clearTimeout'
      ).and.callThrough();

      jasmineUnderTest.DEFAULT_TIMEOUT_INTERVAL = 123456; // a distinctive value

      env = new jasmineUnderTest.Env();

      env.describe('suite', function() {
        env.it('spec', function() {});
      });

      return env.execute(null).then(function() {
        const timeoutIds = setTimeoutSpy.calls
          .all()
          .filter(function(call) {
            return call.args[1] === 123456;
          })
          .map(function(call) {
            return call.returnValue;
          });

        expect(timeoutIds.length).toBeGreaterThan(0);

        timeoutIds.forEach(function(timeoutId) {
          expect(clearTimeoutSpy).toHaveBeenCalledWith(timeoutId);
        });
      });
    });

    it('is resolved to the value of the jasmineDone event', async function() {
      env.describe('suite', function() {
        env.it('spec', function() {
          env.expect(true).toBe(false);
        });
      });

      let event;
      env.addReporter({
        jasmineDone: e => (event = e)
      });
      const result = await env.execute();

      expect(event.overallStatus).toEqual('failed');
      expect(result).toEqual(event);
    });
  });

  describe('The optional callback argument to #execute', function() {
    beforeEach(function() {
      this.savedInterval = jasmineUnderTest.DEFAULT_TIMEOUT_INTERVAL;
    });

    afterEach(function() {
      jasmineUnderTest.DEFAULT_TIMEOUT_INTERVAL = this.savedInterval;
    });

    it('is called after reporter events are dispatched', async function() {
      const reporter = jasmine.createSpyObj('reporter', [
        'specDone',
        'suiteDone',
        'jasmineDone'
      ]);

      env.addReporter(reporter);
      env.describe('suite', function() {
        env.it('spec', function() {});
      });

      await env.execute();

      expect(reporter.specDone).toHaveBeenCalled();
      expect(reporter.suiteDone).toHaveBeenCalled();
      expect(reporter.jasmineDone).toHaveBeenCalled();
    });

    it('is called after the stack is cleared', async function() {
      const realClearStack = jasmineUnderTest.getClearStack(
          jasmineUnderTest.getGlobal()
        ),
        clearStackSpy = jasmine
          .createSpy('clearStack')
          .and.callFake(realClearStack);
      spyOn(jasmineUnderTest, 'getClearStack').and.returnValue(clearStackSpy);

      // Create a new env that has the clearStack defined above
      env.cleanup_();
      env = new jasmineUnderTest.Env();

      env.describe('suite', function() {
        env.it('spec', function() {});
      });

      await env.execute();

      expect(clearStackSpy).toHaveBeenCalled(); // (many times)
      clearStackSpy.calls.reset();

      await new Promise(resolve => setTimeout(resolve));

      expect(clearStackSpy).not.toHaveBeenCalled();
    });

    it('is called after QueueRunner timeouts are cleared', async function() {
      const setTimeoutSpy = spyOn(
        jasmineUnderTest.getGlobal(),
        'setTimeout'
      ).and.callThrough();
      const clearTimeoutSpy = spyOn(
        jasmineUnderTest.getGlobal(),
        'clearTimeout'
      ).and.callThrough();

      jasmineUnderTest.DEFAULT_TIMEOUT_INTERVAL = 123456; // a distinctive value

      env = new jasmineUnderTest.Env();

      env.describe('suite', function() {
        env.it('spec', function() {});
      });

      await env.execute();

      const timeoutIds = setTimeoutSpy.calls
        .all()
        .filter(function(call) {
          return call.args[1] === 123456;
        })
        .map(function(call) {
          return call.returnValue;
        });

      expect(timeoutIds.length).toBeGreaterThan(0);

      timeoutIds.forEach(function(timeoutId) {
        expect(clearTimeoutSpy).toHaveBeenCalledWith(timeoutId);
      });
    });
  });

  it('sends debug logs to the reporter when the spec fails', async function() {
    const reporter = jasmine.createSpyObj('reporter', ['specDone']);

    env.addReporter(reporter);
    env.configure({ random: false });

    env.it('fails', function() {
      env.debugLog('message 1');
      env.debugLog('message 2');
      env.expect(1).toBe(2);
    });

    env.it('passes', function() {
      env.debugLog('message that should not be reported');
    });

    await env.execute();

    function numberInRange(min, max) {
      return {
        asymmetricMatch: function(compareTo) {
          return compareTo >= min && compareTo <= max;
        },
        jasmineToString: function() {
          return '<number from ' + min + ' to ' + max + ' inclusive>';
        }
      };
    }

    expect(reporter.specDone).toHaveBeenCalledTimes(2);
    const duration = reporter.specDone.calls.argsFor(0)[0].duration;
    expect(reporter.specDone.calls.argsFor(0)[0]).toEqual(
      jasmine.objectContaining({
        debugLogs: [
          {
            timestamp: numberInRange(0, duration),
            message: 'message 1'
          },
          {
            timestamp: numberInRange(0, duration),
            message: 'message 2'
          }
        ]
      })
    );
    expect(reporter.specDone.calls.argsFor(1)[0].debugLogs).toBeFalsy();
  });

  it('reports an error when debugLog is used when a spec is not running', async function() {
    const reporter = jasmine.createSpyObj('reporter', ['suiteDone']);

    env.describe('a suite', function() {
      env.beforeAll(function() {
        env.debugLog('a message');
      });

      env.it('a spec', function() {});
    });

    env.addReporter(reporter);
    await env.execute();

    expect(reporter.suiteDone).toHaveBeenCalledWith(
      jasmine.objectContaining({
        failedExpectations: [
          jasmine.objectContaining({
            message: jasmine.stringContaining(
              "'debugLog' was called when there was no current spec"
            )
          })
        ]
      })
    );
  });

  it('uses custom equality testers in Spy#withArgs', async function() {
    env.it('a spec', function() {
      const createSpySpy = env.createSpy('via createSpy');
      const spiedOn = { foo: function() {} };
      env.spyOn(spiedOn, 'foo');
      const spyObj = env.createSpyObj('spyObj', ['foo']);
      const spiedOnAllFuncs = { foo: function() {} };
      env.spyOnAllFunctions(spiedOnAllFuncs);

      for (const spy of [
        createSpySpy,
        spiedOn.foo,
        spyObj.foo,
        spiedOnAllFuncs.foo
      ]) {
        spy.and.returnValue('default strategy');
        spy.withArgs(42).and.returnValue('custom strategy');
      }

      env.addCustomEqualityTester(function(a, b) {
        if ((a === 'x' && b === 42) || (a === 42 && b === 'x')) {
          return true;
        }
      });

      env
        .expect(createSpySpy('x'))
        .withContext('createSpy')
        .toEqual('custom strategy');
      env
        .expect(spiedOn.foo('x'))
        .withContext('spyOn')
        .toEqual('custom strategy');
      env
        .expect(spyObj.foo('x'))
        .withContext('createSpyObj')
        .toEqual('custom strategy');
      env
        .expect(spiedOnAllFuncs.foo('x'))
        .withContext('spyOnAllFunctions')
        .toEqual('custom strategy');
    });

    let failedExpectations;
    env.addReporter({
      specDone: r => (failedExpectations = r.failedExpectations)
    });

    await env.execute();
    expect(failedExpectations).toEqual([]);
  });

  it('uses custom object formatters in spy strategy argument mismatch errors', async function() {
    env.it('a spec', function() {
      env.addCustomObjectFormatter(function(value) {
        if (typeof value === 'string') {
          return 'custom:' + value;
        }
      });
      const spy = env
        .createSpy('foo')
        .withArgs('x')
        .and.returnValue('');
      spy('y');
    });

    let failedExpectations;
    env.addReporter({
      specDone: r => (failedExpectations = r.failedExpectations)
    });

    await env.execute();
    expect(failedExpectations).toEqual([
      jasmine.objectContaining({
        message: jasmine.stringContaining(
          'received a call with arguments [ custom:y ]'
        )
      })
    ]);
  });

  it('reports a suite level error when a describe fn throws', async function() {
    const reporter = jasmine.createSpyObj('reporter', ['suiteDone']);
    env.addReporter(reporter);

    env.describe('throws before defining specs', function() {
      throw new Error('nope');
    });

    env.describe('throws after defining specs', function() {
      env.it('is a spec');
      throw new Error('nope');
    });

    await env.execute();

    expect(reporter.suiteDone).toHaveBeenCalledWith(
      jasmine.objectContaining({
        fullName: 'throws after defining specs',
        failedExpectations: [
          jasmine.objectContaining({
            message: jasmine.stringContaining('Error: nope')
          })
        ]
      })
    );

    expect(reporter.suiteDone).toHaveBeenCalledWith(
      jasmine.objectContaining({
        fullName: 'throws after defining specs',
        failedExpectations: [
          jasmine.objectContaining({
            message: jasmine.stringContaining('Error: nope')
          })
        ]
      })
    );
  });

  it('reports suite and spec filenames', async function() {
    const methods = ['suiteStarted', 'suiteDone', 'specStarted', 'specDone'];
    const reporter = jasmine.createSpyObj('reporter', methods);
    env.addReporter(reporter);

    // Simulate calling through global it and describe,
    // which add another stack frame vs calling env methods directly
    function describeShim(name, fn) {
      env.describe(name, fn);
    }
    function itShim(name, fn) {
      env.it(name, fn);
    }

    describeShim('a suite', function() {
      itShim('a spec', function() {});
    });

    await env.execute();

    for (const method of methods) {
      expect(reporter[method])
        .withContext(method)
        .toHaveBeenCalledWith(
          jasmine.objectContaining({
            filename: jasmine.stringMatching(/EnvSpec\.js$/)
          })
        );
    }
  });

  it('reports skipped suite and spec filenames', async function() {
    const methods = ['suiteStarted', 'suiteDone', 'specStarted', 'specDone'];
    const reporter = jasmine.createSpyObj('reporter', methods);
    env.addReporter(reporter);

    // Simulate calling through global it and describe,
    // which add another stack frame vs calling env methods directly
    function xdescribeShim(name, fn) {
      env.xdescribe(name, fn);
    }
    function xitShim(name, fn) {
      env.xit(name, fn);
    }

    xdescribeShim('a suite', function() {
      xitShim('a spec', function() {});
    });

    await env.execute();

    for (const method of methods) {
      expect(reporter[method])
        .withContext(method)
        .toHaveBeenCalledWith(
          jasmine.objectContaining({
            filename: jasmine.stringMatching(/EnvSpec\.js$/)
          })
        );
    }
  });

  it('reports focused suite and spec filenames', async function() {
    const methods = ['suiteStarted', 'suiteDone', 'specStarted', 'specDone'];
    const reporter = jasmine.createSpyObj('reporter', methods);
    env.addReporter(reporter);

    // Simulate calling through global it and describe,
    // which add another stack frame vs calling env methods directly
    function fdescribeShim(name, fn) {
      env.fdescribe(name, fn);
    }
    function fitShim(name, fn) {
      env.fit(name, fn);
    }

    fdescribeShim('a suite', function() {
      fitShim('a spec', function() {});
    });

    await env.execute();

    for (const method of methods) {
      expect(reporter[method])
        .withContext(method)
        .toHaveBeenCalledWith(
          jasmine.objectContaining({
            filename: jasmine.stringMatching(/EnvSpec\.js$/)
          })
        );
    }
  });

  describe('throwUnless', function() {
    it('throws when the matcher fails', async function() {
      let thrown;

      env.it('a spec', function() {
        try {
          env.throwUnless(1).toEqual(2);
        } catch (e) {
          thrown = e;
        }
      });

      await env.execute();
      expect(thrown).toBeInstanceOf(Error);
      expect(thrown.matcherName).toEqual('toEqual');
      expect(thrown.message).toEqual('Expected 1 to equal 2.');
    });

    it('does not throw when the matcher passes', async function() {
      let threw = false;

      env.it('a spec', function() {
        try {
          env.throwUnless(1).toEqual(1);
          // eslint-disable-next-line no-unused-vars
        } catch (e) {
          threw = true;
        }
      });

      await env.execute();
      expect(threw).toBe(false);
    });

    it('does not cause a failure if the error does not propagate back to jasmine', async function() {
      env.it('a spec', function() {
        try {
          env.throwUnless(1).toEqual(2);
          // eslint-disable-next-line no-unused-vars
        } catch (e) {}
      });

      const reporter = jasmine.createSpyObj('reporter', ['specDone']);
      env.addReporter(reporter);

      await env.execute();
      expect(reporter.specDone).toHaveBeenCalledWith(
        jasmine.objectContaining({ status: 'passed' })
      );
    });
  });

  describe('throwUnlessAsync', function() {
    it('throws when the matcher fails', async function() {
      const promise = Promise.resolve('a');
      let thrown;

      env.it('a spec', async function() {
        try {
          await env.throwUnlessAsync(promise).toBeResolvedTo('b');
        } catch (e) {
          thrown = e;
        }
      });

      await env.execute();
      expect(thrown).toBeInstanceOf(Error);
      expect(thrown.matcherName).toEqual('toBeResolvedTo');
      expect(thrown.message).toEqual(
        "Expected a promise to be resolved to 'b' but it was resolved to 'a'."
      );
    });

    it('does not throw when the matcher passes', async function() {
      let threw = false;

      env.it('a spec', async function() {
        try {
          await env.throwUnlessAsync(Promise.resolve()).toBeResolved();
          // eslint-disable-next-line no-unused-vars
        } catch (e) {
          threw = true;
        }
      });

      await env.execute();
      expect(threw).toBe(false);
    });

    it('does not cause a failure if the error does not propagate back to jasmine', async function() {
      env.it('a spec', async function() {
        try {
          await env.throwUnlessAsync(Promise.resolve()).toBeRejected();
          // eslint-disable-next-line no-unused-vars
        } catch (e) {}
      });

      const reporter = jasmine.createSpyObj('reporter', ['specDone']);
      env.addReporter(reporter);

      await env.execute();
      expect(reporter.specDone).toHaveBeenCalledWith(
        jasmine.objectContaining({ status: 'passed' })
      );
    });
  });

  it('forbids duplicates when forbidDuplicateNames is true', function() {
    env.configure({ forbidDuplicateNames: true });
    env.it('a spec');

    expect(function() {
      env.it('a spec');
    }).toThrowError('Duplicate spec name "a spec" found in top suite');
  });

  function browserEventMethods() {
    return {
      listeners_: { error: [], unhandledrejection: [], rejectionhandled: [] },
      addEventListener(eventName, listener) {
        this.listeners_[eventName].push(listener);
      },
      removeEventListener(eventName, listener) {
        this.listeners_[eventName] = this.listeners_[eventName].filter(
          l => l !== listener
        );
      }
    };
  }

  function dispatchErrorEvent(global, event) {
    expect(global.listeners_.error.length)
      .withContext('number of error listeners')
      .toBeGreaterThan(0);

    for (const l of global.listeners_.error) {
      l(event);
    }
  }
});
