describe('Env integration', function() {
  var env;

  beforeEach(function() {
    jasmine.getEnv().registerIntegrationMatchers();
    env = new jasmineUnderTest.Env();
  });

  afterEach(function() {
    env.cleanup_();
  });

  it('Suites execute as expected (no nesting)', function(done) {
    var calls = [];

    var assertions = function() {
      expect(calls).toEqual(['with a spec', 'and another spec']);

      done();
    };

    env.configure({ random: false });

    env.describe('A Suite', function() {
      env.it('with a spec', function() {
        calls.push('with a spec');
      });
      env.it('and another spec', function() {
        calls.push('and another spec');
      });
    });

    env.execute(null, assertions);
  });

  it('Nested Suites execute as expected', function(done) {
    var calls = [];

    var assertions = function() {
      expect(calls).toEqual([
        'an outer spec',
        'an inner spec',
        'another inner spec'
      ]);

      done();
    };

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

    env.execute(null, assertions);
  });

  it('Multiple top-level Suites execute as expected', function(done) {
    var calls = [];

    var assertions = function() {
      expect(calls).toEqual([
        'an outer spec',
        'an inner spec',
        'another inner spec',
        'a 2nd outer spec'
      ]);

      done();
    };

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

    env.execute(null, assertions);
  });

  it('explicitly fails a spec', function(done) {
    var specDone = jasmine.createSpy('specDone');

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

    env.execute(null, function() {
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
                  var split = other.split('\n'),
                    firstLine = split[0];
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
              message:
                "Failed: Object({ prop: 'value', arr: [ 'works', true ] })"
            })
          ]
        })
      );
      done();
    });
  });

  it("produces an understandable error message when 'fail' is used outside of a current spec", function(done) {
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

    env.execute(null, done);
  });

  it("calls associated befores/specs/afters with the same 'this'", function(done) {
    env.configure({ random: false });
    env.describe('tests', function() {
      var firstTimeThrough = true,
        firstSpecContext,
        secondSpecContext;

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

    env.execute(null, done);
  });

  it("calls associated befores/its/afters with the same 'this' for an async spec", function(done) {
    env.describe('with an async spec', function() {
      var specContext;

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

    env.execute(null, done);
  });

  it('calls associated beforeAlls/afterAlls only once per suite', function(done) {
    var before = jasmine.createSpy('beforeAll'),
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

    env.execute(null, function() {
      expect(after).toHaveBeenCalled();
      expect(after.calls.count()).toBe(1);
      expect(before.calls.count()).toBe(1);
      done();
    });
  });

  it('calls associated beforeAlls/afterAlls only once per suite for async', function(done) {
    var before = jasmine.createSpy('beforeAll'),
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

    env.execute(null, function() {
      expect(after).toHaveBeenCalled();
      expect(after.calls.count()).toBe(1);
      expect(before.calls.count()).toBe(1);
      done();
    });
  });

  it("calls associated beforeAlls/afterAlls with the cascaded 'this'", function(done) {
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

    env.execute(null, done);
  });

  it('tags top-level afterAll failures with a type', function(done) {
    var jasmineDone = jasmine.createSpy('jasmineDone');

    env.it('has a spec', function() {});

    env.afterAll(function() {
      throw 'nope';
    });

    env.addReporter({ jasmineDone: jasmineDone });
    env.execute(null, function() {
      {
        var result = jasmineDone.calls.argsFor(0)[0];
        expect(result.failedExpectations[0].globalErrorType).toEqual(
          'afterAll'
        );
        done();
      }
    });
  });

  it('does not tag suite afterAll failures with a type', function(done) {
    var reporter = {
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

    env.execute(null, function() {
      expect(reporter.suiteDone).toHaveBeenCalled();
      done();
    });
  });

  it('when the beforeAll fails, error at suite level', function(done) {
    var reporter = jasmine.createSpyObj('fakeReporter', [
      'specDone',
      'suiteDone'
    ]);

    var assertions = function() {
      expect(reporter.specDone.calls.count()).toEqual(2);
      expect(reporter.specDone).toHaveFailedExpectationsForRunnable(
        'A suite spec that will pass',
        []
      );
      expect(reporter.specDone).toHaveFailedExpectationsForRunnable(
        'A suite nesting another spec to pass',
        []
      );
      expect(reporter.suiteDone).toHaveFailedExpectationsForRunnable(
        'A suite',
        ['Expected 1 to be 2.']
      );

      done();
    };

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

    env.execute(null, assertions);
  });

  it('copes with async failures after done has been called', function(done) {
    var global = {
      setTimeout: function(fn, delay) {
        return setTimeout(fn, delay);
      },
      clearTimeout: function(fn, delay) {
        clearTimeout(fn, delay);
      }
    };
    spyOn(jasmineUnderTest, 'getGlobal').and.returnValue(global);
    env.cleanup_();
    env = new jasmineUnderTest.Env();
    var reporter = jasmine.createSpyObj('fakeReporter', [
      'specDone',
      'suiteDone'
    ]);

    var assertions = function() {
      expect(reporter.specDone).not.toHaveFailedExpectationsForRunnable(
        'A suite fails',
        ['fail thrown']
      );
      expect(reporter.suiteDone).toHaveFailedExpectationsForRunnable(
        'A suite',
        ['fail thrown']
      );
      done();
    };

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

    env.execute(null, assertions);
  });

  it('reports multiple calls to done in the top suite as errors', function(done) {
    var reporter = jasmine.createSpyObj('fakeReporter', ['jasmineDone']);
    var message =
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

    env.execute(null, function() {
      expect(reporter.jasmineDone).toHaveBeenCalled();
      const errors = reporter.jasmineDone.calls.argsFor(0)[0]
        .failedExpectations;
      expect(errors.length).toEqual(2);
      expect(errors[0].message)
        .withContext('top beforeAll')
        .toContain(message);
      expect(errors[0].globalErrorType).toEqual('lateError');
      expect(errors[1].message)
        .withContext('top afterAll')
        .toContain(message);
      expect(errors[1].globalErrorType).toEqual('lateError');
      done();
    });
  });

  it('reports multiple calls to done in a non-top suite as errors', function(done) {
    var reporter = jasmine.createSpyObj('fakeReporter', ['jasmineDone']);
    var message =
      "An asynchronous beforeAll or afterAll function called its 'done' " +
      'callback more than once.\n(in suite: a suite)';

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
      });
    });

    env.execute(null, function() {
      expect(reporter.jasmineDone).toHaveBeenCalled();
      const errors = reporter.jasmineDone.calls.argsFor(0)[0]
        .failedExpectations;
      expect(errors.length).toEqual(2);
      expect(errors[0].message)
        .withContext('suite beforeAll')
        .toContain(message);
      expect(errors[0].globalErrorType).toEqual('lateError');
      expect(errors[1].message)
        .withContext('suite afterAll')
        .toContain(message);
      expect(errors[1].globalErrorType).toEqual('lateError');
      done();
    });
  });

  it('reports multiple calls to done in a spec as errors', function(done) {
    var reporter = jasmine.createSpyObj('fakeReporter', ['jasmineDone']);
    var message =
      'An asynchronous spec, beforeEach, or afterEach function called its ' +
      "'done' callback more than once.\n(in spec: a suite a spec)";

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
      });
    });

    env.execute(null, function() {
      expect(reporter.jasmineDone).toHaveBeenCalled();
      const errors = reporter.jasmineDone.calls.argsFor(0)[0]
        .failedExpectations;
      expect(errors.length).toEqual(3);
      expect(errors[0].message)
        .withContext('error caused by beforeEach')
        .toContain(message);
      expect(errors[0].globalErrorType).toEqual('lateError');
      expect(errors[1].message)
        .withContext('error caused by it')
        .toContain(message);
      expect(errors[1].globalErrorType).toEqual('lateError');
      expect(errors[2].message)
        .withContext('error caused by afterEach')
        .toContain(message);
      expect(errors[2].globalErrorType).toEqual('lateError');
      done();
    });
  });

  it('reports multiple calls to done in reporters as errors', function(done) {
    var message =
      "An asynchronous reporter callback called its 'done' callback more " +
      'than once.';
    var reporter = jasmine.createSpyObj('fakeReport', ['jasmineDone']);
    reporter.specDone = function(result, done) {
      done();
      done();
    };
    env.addReporter(reporter);

    env.it('a spec', function() {});

    env.execute(null, function() {
      expect(reporter.jasmineDone).toHaveBeenCalled();
      const errors = reporter.jasmineDone.calls.argsFor(0)[0]
        .failedExpectations;
      expect(errors.length).toEqual(1);
      expect(errors[0].message).toContain(message);
      expect(errors[0].globalErrorType).toEqual('lateError');
      done();
    });
  });

  it('does not report an error for a call to done that comes after a timeout', function(done) {
    var reporter = jasmine.createSpyObj('fakeReporter', ['jasmineDone']),
      firstSpecDone;

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

    env.execute(null, function() {
      expect(reporter.jasmineDone).toHaveBeenCalledWith(
        jasmine.objectContaining({
          failedExpectations: []
        })
      );
      done();
    });
  });

  describe('suiteDone reporting', function() {
    it('reports when an afterAll fails an expectation', function(done) {
      var reporter = jasmine.createSpyObj('fakeReport', ['suiteDone']);

      var assertions = function() {
        expect(reporter.suiteDone).toHaveFailedExpectationsForRunnable(
          'my suite',
          ['Expected 1 to equal 2.', 'Expected 2 to equal 3.']
        );
        done();
      };

      env.addReporter(reporter);

      env.describe('my suite', function() {
        env.it('my spec', function() {});

        env.afterAll(function() {
          env.expect(1).toEqual(2);
          env.expect(2).toEqual(3);
        });
      });

      env.execute(null, assertions);
    });

    it('if there are no specs, it still reports correctly', function(done) {
      var reporter = jasmine.createSpyObj('fakeReport', ['suiteDone']);

      var assertions = function() {
        expect(reporter.suiteDone).toHaveFailedExpectationsForRunnable(
          'outer suite',
          ['Expected 1 to equal 2.', 'Expected 2 to equal 3.']
        );
        done();
      };

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

      env.execute(null, assertions);
    });

    it('reports when afterAll throws an exception', function(done) {
      var error = new Error('After All Exception'),
        reporter = jasmine.createSpyObj('fakeReport', ['suiteDone']);

      var assertions = function() {
        expect(reporter.suiteDone).toHaveFailedExpectationsForRunnable(
          'my suite',
          [/^Error: After All Exception/]
        );
        done();
      };

      env.addReporter(reporter);

      env.describe('my suite', function() {
        env.it('my spec', function() {});

        env.afterAll(function() {
          throw error;
        });
      });

      env.execute(null, assertions);
    });

    it('reports when an async afterAll fails an expectation', function(done) {
      var reporter = jasmine.createSpyObj('fakeReport', ['suiteDone']);

      var assertions = function() {
        expect(reporter.suiteDone).toHaveFailedExpectationsForRunnable(
          'my suite',
          ['Expected 1 to equal 2.']
        );
        done();
      };

      env.addReporter(reporter);

      env.describe('my suite', function() {
        env.it('my spec', function() {});

        env.afterAll(function(afterAllDone) {
          env.expect(1).toEqual(2);
          afterAllDone();
        });
      });

      env.execute(null, assertions);
    });

    it('reports when an async afterAll throws an exception', function(done) {
      var error = new Error('After All Exception'),
        reporter = jasmine.createSpyObj('fakeReport', ['suiteDone']);

      var assertions = function() {
        expect(reporter.suiteDone).toHaveFailedExpectationsForRunnable(
          'my suite',
          [/^Error: After All Exception/]
        );
        done();
      };

      env.addReporter(reporter);

      env.describe('my suite', function() {
        env.it('my spec', function() {});

        env.afterAll(function(afterAllDone) {
          throw error;
        });
      });

      env.execute(null, assertions);
    });

    it('reports the duration of the suite', function(done) {
      var duration;

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

      env.execute(null, function() {
        // Expect > 0 to compensate for clock imprecision
        expect(duration).toBeGreaterThan(0);
        done();
      });
    });
  });

  describe('specDone reporting', function() {
    it('reports the duration of the spec', function(done) {
      var duration;

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

      env.execute(null, function() {
        // Expect > 0 to compensate for clock imprecision
        expect(duration).toBeGreaterThan(0);
        done();
      });
    });
  });

  it('reports expectation failures in global beforeAll', function(done) {
    var reporter = jasmine.createSpyObj(['specDone', 'jasmineDone']);

    env.beforeAll(function() {
      env.expect(1).toBe(0);
    });

    env.it('is a spec', function() {
      env.expect(true).toBe(true);
    });

    env.addReporter(reporter);

    env.execute(null, function() {
      var results = reporter.jasmineDone.calls.argsFor(0)[0];
      expect(results.failedExpectations).toEqual([
        jasmine.objectContaining({ message: 'Expected 1 to be 0.' })
      ]);
      expect(reporter.specDone).toHaveFailedExpectationsForRunnable(
        'is a spec',
        []
      );
      done();
    });
  });

  it('reports expectation failures in global afterAll', function(done) {
    var reporter = jasmine.createSpyObj(['jasmineDone']);

    env.afterAll(function() {
      env.expect(1).toBe(0);
    });

    env.it('is a spec', function() {
      env.expect(true).toBe(true);
    });

    env.addReporter(reporter);

    env.execute(null, function() {
      var results = reporter.jasmineDone.calls.argsFor(0)[0];
      expect(results.failedExpectations).toEqual([
        jasmine.objectContaining({ message: 'Expected 1 to be 0.' })
      ]);
      done();
    });
  });

  it('Allows specifying which specs and suites to run', function(done) {
    var calls = [],
      suiteCallback = jasmine.createSpy('suite callback'),
      firstSpec,
      secondSuite;

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

    env.execute([secondSuite.id, firstSpec.id], function() {
      expect(calls).toEqual(['third spec', 'first spec']);
      expect(suiteCallback).toHaveBeenCalled();
      done();
    });
  });

  it('runs before and after all functions for runnables provided to .execute()', function(done) {
    var calls = [],
      first_spec,
      second_spec;

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

    env.execute([first_spec.id, second_spec.id], function() {
      expect(calls).toEqual(['before', 'first spec', 'second spec', 'after']);
      done();
    });
  });

  it('Allows filtering out specs and suites to run programmatically', function(done) {
    var calls = [],
      suiteCallback = jasmine.createSpy('suite callback'),
      firstSpec,
      secondSuite;

    env.addReporter({ suiteDone: suiteCallback });

    env.describe('first suite', function() {
      env.it('first spec', function() {
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

    env.configure({
      specFilter: function(spec) {
        return /^first suite/.test(spec.getFullName());
      }
    });

    env.execute(null, function() {
      expect(calls.length).toEqual(2);
      expect(calls).toEqual(
        jasmine.arrayContaining(['first spec', 'second spec'])
      );
      expect(suiteCallback).toHaveBeenCalled();
      done();
    });
  });

  it('Functions can be spied on and have their calls tracked', function(done) {
    var originalFunctionWasCalled = false;
    var subject = {
      spiedFunc: function() {
        originalFunctionWasCalled = true;
        return 'original result';
      }
    };

    env.it('works with spies', function() {
      var spy = env
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
          if (!(this instanceof MyClass))
            throw new Error('You must use the new keyword.');
          this.foo = foo;
        }
        var subject = { MyClass: MyClass };
        var spy = env.spyOn(subject, 'MyClass').and.callThrough();

        expect(function() {
          var result = new spy('hello world');
          expect(result instanceof MyClass).toBeTruthy();
          expect(result.foo).toEqual('hello world');
        }).not.toThrow();

        expect(function() {
          var result = new spy(
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

    env.execute(null, done);
  });

  it('can be configured to allow respying on functions', function(done) {
    var foo = {
      bar: function() {
        return 1;
      }
    };

    env.allowRespy(true);

    env.describe('test suite', function() {
      env.it('spec 0', function() {
        env.spyOn(foo, 'bar');

        var error = null;

        expect(function() {
          env.spyOn(foo, 'bar');
        }).not.toThrow();
      });
    });

    env.execute(null, done);
  });

  it('removes all spies added in a spec after the spec is complete', function(done) {
    var originalFoo = function() {},
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

    env.execute(null, function() {
      expect(firstSpec).toHaveBeenCalled();
      expect(secondSpec).toHaveBeenCalled();
      done();
    });
  });

  it('removes all spies added in a suite after the suite is complete', function(done) {
    var originalFoo = function() {},
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

    env.execute(null, done);
  });

  it('removes a spy from the top suite after the run is complete', function(done) {
    var originalFoo = function() {},
      testObj = {
        foo: originalFoo
      };

    env.beforeAll(function() {
      env.spyOn(testObj, 'foo');
    });

    env.it('spec', function() {
      expect(jasmineUnderTest.isSpy(testObj.foo)).toBe(true);
    });

    env.execute(null, function() {
      expect(jasmineUnderTest.isSpy(testObj.foo)).toBe(false);
      done();
    });
  });

  it('Mock clock can be installed and used in tests', function(done) {
    var globalSetTimeout = jasmine
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
        setImmediate: function(cb) {
          return setTimeout(cb, 0);
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

    env.execute(null, function() {
      expect(delayedFunctionForMockClock).toHaveBeenCalled();
      expect(globalSetTimeout).toHaveBeenCalledWith(
        delayedFunctionForGlobalClock,
        100
      );
      done();
    });
  });

  it('should run async specs in order, waiting for them to complete', function(done) {
    var mutatedVar;

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

    env.execute(null, done);
  });

  describe('with a mock clock', function() {
    var realSetTimeout;
    function createMockedEnv() {
      env.cleanup_();
      // explicitly pass in timing functions so we can make sure that clear stack always works
      // no matter how long the suite in the spec is
      env = new jasmineUnderTest.Env({
        global: {
          setTimeout: function(cb, t) {
            var stack = jasmine.util.errorWithStack().stack;
            if (stack.indexOf('ClearStack') >= 0) {
              return realSetTimeout(cb, t);
            } else {
              return setTimeout(cb, t);
            }
          },
          clearTimeout: clearTimeout,
          setInterval: setInterval,
          clearInterval: clearInterval,
          setImmediate: function(cb) {
            return realSetTimeout(cb, 0);
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

    it("should wait a default interval before failing specs that haven't called done yet", function(done) {
      createMockedEnv();
      var reporter = jasmine.createSpyObj('fakeReporter', ['specDone']);

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

      env.execute(null, function() {
        expect(reporter.specDone.calls.count()).toEqual(1);
        jasmine.clock().tick(1);
        realSetTimeout(done);
      });
    });

    it('should not use the mock clock for asynchronous timeouts', function(done) {
      createMockedEnv();
      var reporter = jasmine.createSpyObj('fakeReporter', ['specDone']),
        clock = env.clock;

      reporter.specDone.and.callFake(function() {
        realSetTimeout(function() {
          jasmine.debugLog('Ticking after specDone');
          jasmine.clock().tick(1);
        }, 0);
      });

      env.addReporter(reporter);
      jasmineUnderTest.DEFAULT_TIMEOUT_INTERVAL = 5;

      env.beforeAll(function() {
        clock.install();
      });

      env.afterAll(function() {
        clock.uninstall();
      });

      env.it('spec that should not time out', function(innerDone) {
        clock.tick(6);
        expect(true).toEqual(true);
        jasmine.debugLog('Calling realSetTimeout in spec');
        realSetTimeout(function() {
          jasmine.debugLog('Calling innerDone');
          innerDone();
        });
      });

      env.execute(null, function() {
        expect(reporter.specDone).toHaveBeenCalledTimes(1);
        const event = reporter.specDone.calls.argsFor(0)[0];
        jasmine.debugLog('Spec result: ' + jasmine.basicPrettyPrinter_(event));
        expect(event).toEqual(jasmine.objectContaining({ status: 'passed' }));
        jasmine.clock().tick(1);
        realSetTimeout(done);
      });
    });

    it('should wait a custom interval before reporting async functions that fail to complete', function(done) {
      createMockedEnv();
      var reporter = jasmine.createSpyObj('fakeReport', [
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

      env.execute(null, function() {
        var r = reporter.jasmineDone.calls.argsFor(0)[0];
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
        realSetTimeout(done);
      });
    });
  });

  it('explicitly fails an async spec', function(done) {
    var specDone = jasmine.createSpy('specDone');

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

    env.execute(null, function() {
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

      setTimeout(done);
    });
  });

  describe('focused tests', function() {
    it('should only run the focused tests', function(done) {
      var calls = [];

      env.describe('a suite', function() {
        env.fit('is focused', function() {
          calls.push('focused');
        });

        env.it('is not focused', function() {
          calls.push('freakout');
        });
      });

      env.execute(null, function() {
        expect(calls).toEqual(['focused']);
        done();
      });
    });

    it('should only run focused suites', function(done) {
      var calls = [];

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

      env.execute(null, function() {
        expect(calls).toEqual(['focused']);
        done();
      });
    });

    it('should run focused tests inside an xdescribe', function(done) {
      var reporter = jasmine.createSpyObj('fakeReporter', [
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

      env.execute(null, function() {
        expect(reporter.jasmineStarted).toHaveBeenCalledWith({
          totalSpecsDefined: 1,
          order: jasmine.any(jasmineUnderTest.Order)
        });

        expect(reporter.specDone).toHaveBeenCalledWith(
          jasmine.objectContaining({
            description: 'with a fit spec',
            status: 'failed'
          })
        );

        done();
      });
    });

    it('should run focused suites inside an xdescribe', function(done) {
      var reporter = jasmine.createSpyObj('fakeReporter', [
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

      env.execute(null, function() {
        expect(reporter.jasmineStarted).toHaveBeenCalledWith({
          totalSpecsDefined: 1,
          order: jasmine.any(jasmineUnderTest.Order)
        });

        expect(reporter.specDone).toHaveBeenCalledWith(
          jasmine.objectContaining({
            description: 'with a spec',
            status: 'failed'
          })
        );

        done();
      });
    });
  });

  it('should report as expected', function(done) {
    var reporter = jasmine.createSpyObj('fakeReporter', [
      'jasmineStarted',
      'suiteStarted',
      'suiteDone',
      'specStarted',
      'specDone'
    ]);

    env.addReporter(reporter);

    env.describe('A Suite', function() {
      env.it('with a top level spec', function() {
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

    env.execute(null, function() {
      expect(reporter.jasmineStarted).toHaveBeenCalledWith({
        totalSpecsDefined: 5,
        order: jasmine.any(jasmineUnderTest.Order)
      });

      expect(reporter.specDone.calls.count()).toBe(5);

      expect(reporter.specDone).toHaveBeenCalledWith(
        jasmine.objectContaining({
          description: 'with a top level spec',
          status: 'passed'
        })
      );

      expect(reporter.specDone).toHaveBeenCalledWith(
        jasmine.objectContaining({
          description: "with an x'ed spec",
          status: 'pending'
        })
      );

      expect(reporter.specDone).toHaveBeenCalledWith(
        jasmine.objectContaining({
          description: 'with a spec',
          status: 'failed'
        })
      );

      expect(reporter.specDone).toHaveBeenCalledWith(
        jasmine.objectContaining({
          description: 'is pending',
          status: 'pending'
        })
      );

      var suiteDone = reporter.suiteDone.calls.argsFor(0)[0];
      expect(typeof suiteDone.duration).toBe('number');

      var suiteResult = reporter.suiteStarted.calls.argsFor(0)[0];
      expect(suiteResult.description).toEqual('A Suite');

      done();
    });
  });

  it('should report the random seed at the beginning and end of execution', function(done) {
    var reporter = jasmine.createSpyObj('fakeReporter', [
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
    env.execute(null, function() {
      expect(reporter.jasmineStarted).toHaveBeenCalled();
      var startedArg = reporter.jasmineStarted.calls.argsFor(0)[0];
      expect(startedArg.order.random).toEqual(true);
      expect(startedArg.order.seed).toEqual('123456');

      var doneArg = reporter.jasmineDone.calls.argsFor(0)[0];
      expect(doneArg.order.random).toEqual(true);
      expect(doneArg.order.seed).toEqual('123456');
      done();
    });
  });

  it('should report pending spec messages', function(done) {
    var reporter = jasmine.createSpyObj('fakeReporter', ['specDone']);

    env.addReporter(reporter);

    env.it('will be pending', function() {
      env.pending('with a message');
    });

    env.execute(null, function() {
      var specStatus = reporter.specDone.calls.argsFor(0)[0];

      expect(specStatus.status).toBe('pending');
      expect(specStatus.pendingReason).toBe('with a message');

      done();
    });
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

    var reporter = jasmine.createSpyObj('fakeReporter', ['specDone']);

    env.addReporter(reporter);

    env.it('will be pending', function() {
      return new StubPromise(function() {
        env.pending('with a message');
      });
    });

    env.execute(null, function() {
      var specStatus = reporter.specDone.calls.argsFor(0)[0];

      expect(specStatus.status).toBe('pending');
      expect(specStatus.pendingReason).toBe('with a message');

      done();
    });
  });

  it('should report using fallback reporter', function(done) {
    var reporter = jasmine.createSpyObj('fakeReporter', [
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
    var reporter = jasmine.createSpyObj('fakeReporter', [
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

    env.execute(null, function() {
      expect(reporter.jasmineStarted).toHaveBeenCalledWith({
        totalSpecsDefined: 1,
        order: jasmine.any(jasmineUnderTest.Order)
      });

      expect(reporter.specDone).toHaveBeenCalledWith(
        jasmine.objectContaining({ status: 'pending' })
      );
      expect(reporter.suiteDone).toHaveBeenCalledWith(
        jasmine.objectContaining({ description: 'xd out', status: 'pending' })
      );
      expect(reporter.suiteDone.calls.count()).toBe(4);

      done();
    });
  });

  it('should be possible to get full name from a spec', function() {
    var topLevelSpec, nestedSpec, doublyNestedSpec;

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

  it('Custom equality testers should be per spec', function(done) {
    var reporter = jasmine.createSpyObj('fakeReporter', ['specDone']);

    env.addReporter(reporter);
    env.configure({ random: false });

    env.describe('testing custom equality testers', function() {
      env.it('with a custom tester', function() {
        env.addCustomEqualityTester(function(a, b) {
          return true;
        });
        env.expect('a').toEqual('b');
      });

      env.it('without a custom tester', function() {
        env.expect('a').toEqual('b');
      });
    });

    env.execute(null, function() {
      var firstSpecResult = reporter.specDone.calls.first().args[0],
        secondSpecResult = reporter.specDone.calls.mostRecent().args[0];

      expect(firstSpecResult.status).toEqual('passed');
      expect(secondSpecResult.status).toEqual('failed');

      done();
    });
  });

  it('Custom equality testers should be per suite', function(done) {
    var reporter = jasmine.createSpyObj('fakeReporter', ['specDone']);

    env.addReporter(reporter);
    env.configure({ random: false });

    env.describe('testing custom equality testers', function() {
      env.beforeAll(function() {
        env.addCustomEqualityTester(function(a, b) {
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

    env.execute(null, function() {
      var firstSpecResult = reporter.specDone.calls.first().args[0],
        secondSpecResult = reporter.specDone.calls.argsFor(0)[0],
        thirdSpecResult = reporter.specDone.calls.mostRecent().args[0];

      expect(firstSpecResult.status).toEqual('passed');
      expect(secondSpecResult.status).toEqual('passed');
      expect(thirdSpecResult.status).toEqual('failed');

      done();
    });
  });

  it('Custom equality testers for toContain should be per spec', function(done) {
    var reporter = jasmine.createSpyObj('fakeReporter', ['specDone']);

    env.addReporter(reporter);
    env.configure({ random: false });

    env.describe('testing custom equality testers', function() {
      env.it('with a custom tester', function() {
        env.addCustomEqualityTester(function(a, b) {
          return true;
        });
        env.expect(['a']).toContain('b');
      });

      env.it('without a custom tester', function() {
        env.expect(['a']).toContain('b');
      });
    });

    env.execute(null, function() {
      var firstSpecResult = reporter.specDone.calls.first().args[0],
        secondSpecResult = reporter.specDone.calls.mostRecent().args[0];

      expect(firstSpecResult.status).toEqual('passed');
      expect(secondSpecResult.status).toEqual('failed');

      done();
    });
  });

  it("produces an understandable error message when an 'expect' is used outside of a current spec", function(done) {
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

    env.execute(null, done);
  });

  it('Custom equality testers for toContain should be per suite', function(done) {
    var reporter = jasmine.createSpyObj('fakeReporter', ['specDone']);

    env.addReporter(reporter);
    env.configure({ random: false });

    env.describe('testing custom equality testers', function() {
      env.beforeAll(function() {
        env.addCustomEqualityTester(function(a, b) {
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

    env.execute(null, function() {
      var firstSpecResult = reporter.specDone.calls.first().args[0],
        secondSpecResult = reporter.specDone.calls.argsFor(1)[0],
        thirdSpecResult = reporter.specDone.calls.mostRecent().args[0];

      expect(firstSpecResult.status).toEqual('passed');
      expect(secondSpecResult.status).toEqual('passed');
      expect(thirdSpecResult.status).toEqual('failed');

      done();
    });
  });

  it('Custom matchers should be per spec', function(done) {
    var matchers = {
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

    env.execute(null, done);
  });

  it('Custom matchers should be per suite', function(done) {
    var matchers = {
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

    env.execute(null, done);
  });

  it('throws an exception if you try to create a spy outside of a runnable', function(done) {
    var obj = { fn: function() {} },
      exception;

    env.describe('a suite', function() {
      try {
        env.spyOn(obj, 'fn');
      } catch (e) {
        exception = e;
      }
      env.it('has a test', function() {});
    });

    env.execute(null, function() {
      expect(exception.message).toBe(
        'Spies must be created in a before function or a spec'
      );
      done();
    });
  });

  it('throws an exception if you try to add a matcher outside of a runnable', function(done) {
    var obj = { fn: function() {} },
      exception;

    env.describe('a suite', function() {
      try {
        env.addMatchers({
          myMatcher: function(actual, expected) {
            return false;
          }
        });
      } catch (e) {
        exception = e;
      }
      env.it('has a test', function() {});
    });

    env.execute(null, function() {
      expect(exception.message).toBe(
        'Matchers must be added in a before function or a spec'
      );
      done();
    });
  });

  it('throws an exception if you try to add a custom equality outside of a runnable', function(done) {
    var obj = { fn: function() {} },
      exception;

    env.describe('a suite', function() {
      try {
        env.addCustomEqualityTester(function(first, second) {
          return true;
        });
      } catch (e) {
        exception = e;
      }
      env.it('has a test', function() {});
    });

    env.execute(null, function() {
      expect(exception.message).toBe(
        'Custom Equalities must be added in a before function or a spec'
      );
      done();
    });
  });

  it('reports test properties on specs', function(done) {
    var env = new jasmineUnderTest.Env(),
      reporter = jasmine.createSpyObj('reporter', ['suiteDone', 'specDone']);

    reporter.specDone.and.callFake(function(e) {
      expect(e.properties).toEqual({ a: 'Bee' });
    });

    env.addReporter(reporter);
    env.it('calls setSpecProperty', function() {
      env.setSpecProperty('a', 'Bee');
    });
    env.execute(null, function() {
      expect(reporter.specDone).toHaveBeenCalled();
      done();
    });
  });

  it('throws an exception if you try to setSpecProperty outside of a spec', function(done) {
    var env = new jasmineUnderTest.Env(),
      exception;

    env.describe('a suite', function() {
      env.it('a spec');
      try {
        env.setSpecProperty('a prop', 'val');
      } catch (e) {
        exception = e;
      }
      env.it('has a test', function() {});
    });

    env.execute(null, function() {
      expect(exception.message).toBe(
        "'setSpecProperty' was used when there was no current spec"
      );
      done();
    });
  });

  it('reports test properties on suites', function(done) {
    var env = new jasmineUnderTest.Env(),
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

    env.execute(null, function() {
      expect(reporter.suiteDone).toHaveBeenCalled();
      done();
    });
  });

  it('throws an exception if you try to setSuiteProperty outside of a suite', function(done) {
    var env = new jasmineUnderTest.Env();

    try {
      env.setSuiteProperty('a', 'Bee');
    } catch (e) {
      expect(e.message).toBe(
        "'setSuiteProperty' was used when there was no current suite"
      );
      done();
    }
  });

  it('should associate errors thrown from async code with the correct runnable', function(done) {
    var reporter = jasmine.createSpyObj('fakeReport', [
      'suiteDone',
      'specDone'
    ]);

    env.addReporter(reporter);

    env.describe('async suite', function() {
      env.afterAll(function(innerDone) {
        setTimeout(function() {
          throw new Error('suite');
        }, 1);
      }, 10);

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
        10
      );
    });

    env.execute(null, function() {
      expect(reporter.suiteDone).toHaveFailedExpectationsForRunnable(
        'async suite',
        [
          /^(((Uncaught )?(exception: )?Error: suite( thrown)?)|(suite thrown))$/
        ]
      );
      expect(reporter.specDone).toHaveFailedExpectationsForRunnable(
        'suite async spec',
        [/^(((Uncaught )?(exception: )?Error: spec( thrown)?)|(spec thrown))$/]
      );
      done();
    });
  });

  it("should throw on suites/specs/befores/afters nested in methods other than 'describe'", function(done) {
    var reporter = jasmine.createSpyObj('reporter', ['suiteDone', 'specDone']);

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

    env.execute(null, function() {
      var msg = /\'.*\' should only be used in \'describe\' function/;

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
      expect(reporter.specDone).toHaveFailedExpectationsForRunnable(
        'spec xit',
        [msg]
      );
      expect(reporter.specDone).toHaveFailedExpectationsForRunnable(
        'spec fit',
        [msg]
      );

      expect(reporter.suiteDone).toHaveFailedExpectationsForRunnable(
        'beforeAll',
        [msg]
      );
      expect(reporter.specDone).toHaveFailedExpectationsForRunnable(
        'beforeEach spec',
        [msg]
      );

      expect(reporter.suiteDone).toHaveFailedExpectationsForRunnable(
        'afterAll',
        [msg]
      );
      expect(reporter.specDone).toHaveFailedExpectationsForRunnable(
        'afterEach spec',
        [msg]
      );

      done();
    });
  });

  it('reports errors that occur during loading', function(done) {
    var global = {
      setTimeout: function(fn, delay) {
        return setTimeout(fn, delay);
      },
      clearTimeout: function(fn, delay) {
        clearTimeout(fn, delay);
      },
      onerror: function() {}
    };
    spyOn(jasmineUnderTest, 'getGlobal').and.returnValue(global);

    env.cleanup_();
    env = new jasmineUnderTest.Env();
    var reporter = jasmine.createSpyObj('reporter', [
      'jasmineDone',
      'suiteDone',
      'specDone'
    ]);

    env.addReporter(reporter);
    global.onerror(
      'Uncaught SyntaxError: Unexpected end of input',
      'borkenSpec.js',
      42,
      undefined,
      { stack: 'a stack' }
    );
    global.onerror('Uncaught Error: ENOCHEESE');

    env.execute(null, function() {
      var e = reporter.jasmineDone.calls.argsFor(0)[0];
      expect(e.failedExpectations).toEqual([
        {
          passed: false,
          globalErrorType: 'load',
          message: 'Uncaught SyntaxError: Unexpected end of input',
          stack: 'a stack',
          filename: 'borkenSpec.js',
          lineno: 42
        },
        {
          passed: false,
          globalErrorType: 'load',
          message: 'Uncaught Error: ENOCHEESE',
          stack: undefined,
          filename: undefined,
          lineno: undefined
        }
      ]);

      done();
    });
  });

  describe('If suppressLoadErrors: true was passed', function() {
    it('does not install a global error handler during loading', function(done) {
      var originalOnerror = jasmine.createSpy('original onerror');
      var global = {
        setTimeout: function(fn, delay) {
          return setTimeout(fn, delay);
        },
        clearTimeout: function(fn, delay) {
          clearTimeout(fn, delay);
        },
        onerror: originalOnerror
      };
      spyOn(jasmineUnderTest, 'getGlobal').and.returnValue(global);
      var globalErrors = new jasmineUnderTest.GlobalErrors(global);
      var onerror = jasmine.createSpy('onerror');
      globalErrors.pushListener(onerror);
      spyOn(jasmineUnderTest, 'GlobalErrors').and.returnValue(globalErrors);

      env.cleanup_();
      env = new jasmineUnderTest.Env({ suppressLoadErrors: true });
      var reporter = jasmine.createSpyObj('reporter', [
        'jasmineDone',
        'suiteDone',
        'specDone'
      ]);

      env.addReporter(reporter);
      global.onerror('Uncaught Error: ENOCHEESE');

      env.execute(null, function() {
        var e = reporter.jasmineDone.calls.argsFor(0)[0];
        expect(e.failedExpectations).toEqual([]);
        expect(originalOnerror).toHaveBeenCalledWith(
          'Uncaught Error: ENOCHEESE'
        );
        done();
      });
    });
  });

  describe('Overall status in the jasmineDone event', function() {
    describe('When everything passes', function() {
      it('is "passed"', function(done) {
        var reporter = jasmine.createSpyObj('reporter', [
          'jasmineDone',
          'suiteDone',
          'specDone'
        ]);

        env.addReporter(reporter);
        env.it('passes', function() {});
        env.execute(null, function() {
          var e = reporter.jasmineDone.calls.argsFor(0)[0];
          expect(e.overallStatus).toEqual('passed');
          done();
        });
      });
    });

    describe('When a spec fails', function() {
      it('is "failed"', function(done) {
        var reporter = jasmine.createSpyObj('reporter', [
          'jasmineDone',
          'suiteDone',
          'specDone'
        ]);

        env.addReporter(reporter);
        env.it('fails', function() {
          env.expect(true).toBe(false);
        });
        env.execute(null, function() {
          var e = reporter.jasmineDone.calls.argsFor(0)[0];
          expect(e.overallStatus).toEqual('failed');
          done();
        });
      });
    });

    describe('when spec has no expectations', function() {
      var reporter;

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

      it('should report "failed" status if "failSpecWithNoExpectations" is enabled', function(done) {
        env.configure({ failSpecWithNoExpectations: true });
        env.execute(null, function() {
          var e = reporter.jasmineDone.calls.argsFor(0)[0];
          expect(e.overallStatus).toEqual('failed');
          done();
        });
      });

      it('should report "passed" status if "failSpecWithNoExpectations" is disabled', function(done) {
        env.configure({ failSpecWithNoExpectations: false });
        env.execute(null, function() {
          var e = reporter.jasmineDone.calls.argsFor(0)[0];
          expect(e.overallStatus).toEqual('passed');
          done();
        });
      });
    });

    describe('When a top-level beforeAll fails', function() {
      it('is "failed"', function(done) {
        var reporter = jasmine.createSpyObj('reporter', [
          'jasmineDone',
          'suiteDone',
          'specDone'
        ]);

        env.addReporter(reporter);
        env.beforeAll(function() {
          throw new Error('nope');
        });
        env.it('does not run', function() {});
        env.execute(null, function() {
          var e = reporter.jasmineDone.calls.argsFor(0)[0];
          expect(e.overallStatus).toEqual('failed');
          done();
        });
      });
    });

    describe('When a suite beforeAll fails', function() {
      it('is "failed"', function(done) {
        var reporter = jasmine.createSpyObj('reporter', [
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
        env.execute(null, function() {
          var e = reporter.jasmineDone.calls.argsFor(0)[0];
          expect(e.overallStatus).toEqual('failed');
          done();
        });
      });
    });

    describe('When a top-level afterAll fails', function() {
      it('is "failed"', function(done) {
        var reporter = jasmine.createSpyObj('reporter', [
          'jasmineDone',
          'suiteDone',
          'specDone'
        ]);

        env.addReporter(reporter);
        env.afterAll(function() {
          throw new Error('nope');
        });
        env.it('does not run', function() {});
        env.execute(null, function() {
          var e = reporter.jasmineDone.calls.argsFor(0)[0];
          expect(e.overallStatus).toEqual('failed');
          done();
        });
      });
    });

    describe('When a suite afterAll fails', function() {
      it('is "failed"', function(done) {
        var reporter = jasmine.createSpyObj('reporter', [
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
        env.execute(null, function() {
          var e = reporter.jasmineDone.calls.argsFor(0)[0];
          expect(e.overallStatus).toEqual('failed');
          done();
        });
      });
    });

    describe('When there are load errors', function() {
      it('is "failed"', function(done) {
        var global = {
          setTimeout: function(fn, delay) {
            return setTimeout(fn, delay);
          },
          clearTimeout: function(fn, delay) {
            return clearTimeout(fn, delay);
          }
        };
        spyOn(jasmineUnderTest, 'getGlobal').and.returnValue(global);

        env.cleanup_();
        env = new jasmineUnderTest.Env();
        var reporter = jasmine.createSpyObj('reporter', [
          'jasmineDone',
          'suiteDone',
          'specDone'
        ]);

        reporter.jasmineDone.and.callFake(function(e) {
          expect(e.overallStatus).toEqual('failed');
        });

        env.addReporter(reporter);
        env.it('passes', function() {});
        global.onerror('Uncaught Error: ENOCHEESE');
        env.execute(null, function() {
          expect(reporter.jasmineDone).toHaveBeenCalled();
          done();
        });
      });
    });

    describe('When there are no specs', function() {
      it('is "incomplete"', function(done) {
        var reporter = jasmine.createSpyObj('reporter', [
          'jasmineDone',
          'suiteDone',
          'specDone'
        ]);

        env.addReporter(reporter);
        env.execute(null, function() {
          var e = reporter.jasmineDone.calls.argsFor(0)[0];
          expect(e.overallStatus).toEqual('incomplete');
          expect(e.incompleteReason).toEqual('No specs found');
          done();
        });
      });
    });

    describe('When a spec is focused', function() {
      it('is "incomplete"', function(done) {
        var reporter = jasmine.createSpyObj('reporter', [
          'jasmineDone',
          'suiteDone',
          'specDone'
        ]);

        env.addReporter(reporter);
        env.fit('is focused', function() {});
        env.execute(null, function(e) {
          var e = reporter.jasmineDone.calls.argsFor(0)[0];
          expect(e.overallStatus).toEqual('incomplete');
          expect(e.incompleteReason).toEqual('fit() or fdescribe() was found');
          done();
        });
      });
    });

    describe('When a suite is focused', function() {
      it('is "incomplete"', function(done) {
        var reporter = jasmine.createSpyObj('reporter', [
          'jasmineDone',
          'suiteDone',
          'specDone'
        ]);

        env.addReporter(reporter);
        env.fdescribe('something focused', function() {
          env.it('does a thing', function() {});
        });
        env.execute(null, function() {
          var e = reporter.jasmineDone.calls.argsFor(0)[0];
          expect(e.overallStatus).toEqual('incomplete');
          expect(e.incompleteReason).toEqual('fit() or fdescribe() was found');
          done();
        });
      });
    });

    describe('When there are both failures and focused specs', function() {
      it('is "failed"', function(done) {
        var reporter = jasmine.createSpyObj('reporter', [
          'jasmineDone',
          'suiteDone',
          'specDone'
        ]);

        env.addReporter(reporter);
        env.fit('is focused', function() {
          env.expect(true).toBe(false);
        });
        env.execute(null, function() {
          var e = reporter.jasmineDone.calls.argsFor(0)[0];
          expect(e.overallStatus).toEqual('failed');
          expect(e.incompleteReason).toBeUndefined();
          done();
        });
      });
    });
  });

  it('should report deprecation stack with an error object', function(done) {
    var exceptionFormatter = new jasmineUnderTest.ExceptionFormatter(),
      reporter = jasmine.createSpyObj('reporter', [
        'jasmineDone',
        'suiteDone',
        'specDone'
      ]),
      topLevelError,
      suiteLevelError,
      specLevelError;

    try {
      throw new Error('top level deprecation');
    } catch (err) {
      topLevelError = err;
    }
    try {
      throw new Error('suite level deprecation');
    } catch (err) {
      suiteLevelError = err;
    }
    try {
      throw new Error('spec level deprecation');
    } catch (err) {
      specLevelError = err;
    }

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

    env.execute(null, function() {
      var result = reporter.jasmineDone.calls.argsFor(0)[0];
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

      done();
    });
  });

  it('supports async matchers', function(done) {
    var specDone = jasmine.createSpy('specDone'),
      suiteDone = jasmine.createSpy('suiteDone'),
      jasmineDone = jasmine.createSpy('jasmineDone');

    env.addReporter({
      specDone: specDone,
      suiteDone: suiteDone,
      jasmineDone: jasmineDone
    });

    function fail(innerDone) {
      var resolve;
      var p = new Promise(function(res, rej) {
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

    env.execute(null, function() {
      var result = jasmineDone.calls.argsFor(0)[0];
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

      done();
    });
  });

  it('provides custom equality testers to async matchers', function(done) {
    var specDone = jasmine.createSpy('specDone');

    env.addReporter({ specDone: specDone });

    env.it('has an async failure', function() {
      env.addCustomEqualityTester(function() {
        return true;
      });
      var p = Promise.resolve('something');
      return env.expectAsync(p).toBeResolvedTo('something else');
    });

    env.execute(null, function() {
      expect(specDone).toHaveBeenCalledWith(
        jasmine.objectContaining({
          description: 'has an async failure',
          failedExpectations: []
        })
      );
      done();
    });
  });

  it('includes useful stack frames in async matcher failures', function(done) {
    var specDone = jasmine.createSpy('specDone');

    env.addReporter({ specDone: specDone });

    env.it('has an async failure', function() {
      env.addCustomEqualityTester(function() {
        return true;
      });
      var p = Promise.resolve();
      return env.expectAsync(p).toBeRejected();
    });

    env.execute(null, function() {
      expect(specDone).toHaveBeenCalledWith(
        jasmine.objectContaining({
          failedExpectations: [
            jasmine.objectContaining({
              stack: jasmine.stringMatching('EnvSpec.js')
            })
          ]
        })
      );
      done();
    });
  });

  it('reports an error when an async expectation occurs after the spec finishes', function(done) {
    var resolve,
      jasmineDone = jasmine.createSpy('jasmineDone'),
      promise = new Promise(function(res) {
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

    env.execute(null, function() {
      var result = jasmineDone.calls.argsFor(0)[0];
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

      done();
    });
  });

  it('reports an error when an async expectation occurs after the suite finishes', function(done) {
    var resolve,
      jasmineDone = jasmine.createSpy('jasmineDone'),
      promise = new Promise(function(res) {
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

    env.execute(null, function() {
      var result = jasmineDone.calls.argsFor(0)[0];
      expect(result.failedExpectations).toEqual([
        jasmine.objectContaining({
          passed: false,
          globalErrorType: 'lateExpectation',
          message:
            'Suite "a suite" ran a "toBeResolved" expectation ' +
            'after it finished.\n' +
            '1. Did you forget to return or await the result of expectAsync?\n' +
            '2. Was done() invoked before an async operation completed?\n' +
            '3. Did an expectation follow a call to done()?',
          matcherName: 'toBeResolved'
        })
      ]);

      done();
    });
  });

  it('supports asymmetric equality testers that take a matchersUtil', function(done) {
    var env = new jasmineUnderTest.Env();

    env.it('spec using custom asymmetric equality tester', function() {
      var customEqualityFn = function(a, b) {
        if (a === 2 && b === 'two') {
          return true;
        }
      };
      var arrayWithFirstElement = function(sample) {
        return {
          asymmetricMatch: function(actual, matchersUtil) {
            return matchersUtil.equals(sample, actual[0]);
          }
        };
      };

      env.addCustomEqualityTester(customEqualityFn);
      env.expect(['two']).toEqual(arrayWithFirstElement(2));
    });

    var specExpectations = function(result) {
      expect(result.status).toEqual('passed');
    };

    env.addReporter({ specDone: specExpectations });
    env.execute(null, done);
  });

  describe('The promise returned by #execute', function() {
    beforeEach(function() {
      this.savedInterval = jasmineUnderTest.DEFAULT_TIMEOUT_INTERVAL;
    });

    afterEach(function() {
      jasmineUnderTest.DEFAULT_TIMEOUT_INTERVAL = this.savedInterval;
    });

    it('is resolved after reporter events are dispatched', function() {
      var reporter = jasmine.createSpyObj('reporter', [
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
      var realClearStack = jasmineUnderTest.getClearStack(
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
      var setTimeoutSpy = spyOn(
        jasmineUnderTest.getGlobal(),
        'setTimeout'
      ).and.callThrough();
      var clearTimeoutSpy = spyOn(
        jasmineUnderTest.getGlobal(),
        'clearTimeout'
      ).and.callThrough();

      jasmineUnderTest.DEFAULT_TIMEOUT_INTERVAL = 123456; // a distinctive value

      env = new jasmineUnderTest.Env();

      env.describe('suite', function() {
        env.it('spec', function() {});
      });

      return env.execute(null).then(function() {
        var timeoutIds = setTimeoutSpy.calls
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

    it('is called after reporter events are dispatched', function(done) {
      var reporter = jasmine.createSpyObj('reporter', [
        'specDone',
        'suiteDone',
        'jasmineDone'
      ]);

      env.addReporter(reporter);
      env.describe('suite', function() {
        env.it('spec', function() {});
      });

      env.execute(null, function() {
        expect(reporter.specDone).toHaveBeenCalled();
        expect(reporter.suiteDone).toHaveBeenCalled();
        expect(reporter.jasmineDone).toHaveBeenCalled();
        done();
      });
    });

    it('is called after the stack is cleared', function(done) {
      var realClearStack = jasmineUnderTest.getClearStack(
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

      env.execute(null, function() {
        expect(clearStackSpy).toHaveBeenCalled(); // (many times)
        clearStackSpy.calls.reset();
        setTimeout(function() {
          expect(clearStackSpy).not.toHaveBeenCalled();
          done();
        });
      });
    });

    it('is called after QueueRunner timeouts are cleared', function(done) {
      var setTimeoutSpy = spyOn(
        jasmineUnderTest.getGlobal(),
        'setTimeout'
      ).and.callThrough();
      var clearTimeoutSpy = spyOn(
        jasmineUnderTest.getGlobal(),
        'clearTimeout'
      ).and.callThrough();

      jasmineUnderTest.DEFAULT_TIMEOUT_INTERVAL = 123456; // a distinctive value

      env = new jasmineUnderTest.Env();

      env.describe('suite', function() {
        env.it('spec', function() {});
      });

      env.execute(null, function() {
        var timeoutIds = setTimeoutSpy.calls
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

        done();
      });
    });
  });

  it('sends debug logs to the reporter when the spec fails', function(done) {
    var reporter = jasmine.createSpyObj('reporter', ['specDone']),
      startTime,
      endTime;

    env.addReporter(reporter);
    env.configure({ random: false });

    env.it('fails', function() {
      startTime = new Date().getTime();
      env.debugLog('message 1');
      env.debugLog('message 2');
      env.expect(1).toBe(2);
      endTime = new Date().getTime();
    });

    env.it('passes', function() {
      env.debugLog('message that should not be reported');
    });

    env.execute(null, function() {
      function numberInRange(min, max) {
        return {
          asymmetricMatch: function(compareTo) {
            return compareTo >= min && compareTo <= max;
          },
          jasmineToString: function(pp) {
            return '<number from ' + min + ' to ' + max + ' inclusive>';
          }
        };
      }

      var duration;

      expect(reporter.specDone).toHaveBeenCalledTimes(2);
      duration = reporter.specDone.calls.argsFor(0)[0].duration;
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
      done();
    });
  });

  it('reports an error when debugLog is used when a spec is not running', function(done) {
    var reporter = jasmine.createSpyObj('reporter', ['suiteDone']);

    env.describe('a suite', function() {
      env.beforeAll(function() {
        env.debugLog('a message');
      });

      env.it('a spec', function() {});
    });

    env.addReporter(reporter);
    env.execute(null, function() {
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
      done();
    });
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
});
