describe('Custom Matchers (Integration)', function() {
  var env;
  var fakeTimer;

  beforeEach(function() {
    env = new jasmineUnderTest.Env();
    env.configure({ random: false });
  });

  afterEach(function() {
    env.cleanup_();
  });

  it('allows adding more matchers local to a spec', function(done) {
    env.it('spec defining a custom matcher', function() {
      env.addMatchers({
        matcherForSpec: function() {
          return {
            compare: function(actual, expected) {
              return {
                pass: false,
                message:
                  'matcherForSpec: actual: ' +
                  actual +
                  '; expected: ' +
                  expected
              };
            }
          };
        }
      });

      env.expect('zzz').matcherForSpec('yyy');
    });

    env.it('spec without custom matcher defined', function() {
      expect(env.expect('zzz').matcherForSpec).toBeUndefined();
    });

    var specDoneSpy = jasmine.createSpy('specDoneSpy');
    var expectations = function() {
      var firstSpecResult = specDoneSpy.calls.first().args[0];
      expect(firstSpecResult.status).toEqual('failed');
      expect(firstSpecResult.failedExpectations[0].message).toEqual(
        'matcherForSpec: actual: zzz; expected: yyy'
      );
      done();
    };
    env.addReporter({ specDone: specDoneSpy });

    env.execute(null, expectations);
  });

  it('passes the spec if the custom matcher passes', function(done) {
    env.it('spec using custom matcher', function() {
      env.addMatchers({
        toBeReal: function() {
          return {
            compare: function() {
              return { pass: true };
            }
          };
        }
      });

      env.expect(true).toBeReal();
    });

    var specExpectations = function(result) {
      expect(result.status).toEqual('passed');
    };

    env.addReporter({ specDone: specExpectations });
    env.execute(null, done);
  });

  it('passes the spec if the custom equality matcher passes for types nested inside asymmetric equality testers', function(done) {
    env.it('spec using custom equality matcher', function() {
      var customEqualityFn = function(a, b) {
        // All "foo*" strings match each other.
        if (
          typeof a == 'string' &&
          typeof b == 'string' &&
          a.substr(0, 3) == 'foo' &&
          b.substr(0, 3) == 'foo'
        ) {
          return true;
        }
      };

      env.addCustomEqualityTester(customEqualityFn);
      env
        .expect({ foo: 'fooValue' })
        .toEqual(jasmineUnderTest.objectContaining({ foo: 'fooBar' }));
      env
        .expect(['fooValue', 'things'])
        .toEqual(jasmineUnderTest.arrayContaining(['fooBar']));
      env
        .expect(['fooValue'])
        .toEqual(jasmineUnderTest.arrayWithExactContents(['fooBar']));
    });

    var specExpectations = function(result) {
      expect(result.status).toEqual('passed');
    };

    env.addReporter({ specDone: specExpectations });
    env.execute(null, done);
  });

  it('supports asymmetric equality testers that take a list of custom equality testers', function(done) {
    // TODO: remove this in the next major release.
    spyOn(jasmineUnderTest, 'getEnv').and.returnValue(env);
    spyOn(env, 'deprecated'); // suppress warnings

    env.it('spec using custom asymmetric equality tester', function() {
      var customEqualityFn = function(a, b) {
        if (a === 2 && b === 'two') {
          return true;
        }
      };
      var arrayWithFirstElement = function(sample) {
        return {
          asymmetricMatch: function(actual, customEqualityTesters) {
            return jasmineUnderTest.matchersUtil.equals(
              sample,
              actual[0],
              customEqualityTesters
            );
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

  it('displays an appropriate failure message if a custom equality matcher fails', function(done) {
    spyOn(env, 'deprecated');

    env.it('spec using custom equality matcher', function() {
      var customEqualityFn = function(a, b) {
        // "foo" is not equal to anything
        if (a === 'foo' || b === 'foo') {
          return false;
        }
      };

      env.addCustomEqualityTester(customEqualityFn);
      env.expect({ foo: 'foo' }).toEqual({ foo: 'foo' });
    });

    var specExpectations = function(result) {
      expect(result.status).toEqual('failed');
      expect(result.failedExpectations[0].message).toEqual(
        "Expected $.foo = 'foo' to equal 'foo'."
      );
    };

    env.addReporter({ specDone: specExpectations });
    env.execute(null, done);
  });

  it('uses the negative compare function for a negative comparison, if provided', function(done) {
    env.it('spec with custom negative comparison matcher', function() {
      env.addMatchers({
        toBeReal: function() {
          return {
            compare: function() {
              return { pass: true };
            },
            negativeCompare: function() {
              return { pass: true };
            }
          };
        }
      });

      env.expect(true).not.toBeReal();
    });

    var specExpectations = function(result) {
      expect(result.status).toEqual('passed');
    };

    env.addReporter({ specDone: specExpectations });
    env.execute(null, done);
  });

  it('generates messages with the same rules as built in matchers absent a custom message', function(done) {
    env.it('spec with an expectation', function() {
      env.addMatchers({
        toBeReal: function() {
          return {
            compare: function() {
              return { pass: false };
            }
          };
        }
      });

      env.expect('a').toBeReal();
    });

    var specExpectations = function(result) {
      expect(result.failedExpectations[0].message).toEqual(
        "Expected 'a' to be real."
      );
    };

    env.addReporter({ specDone: specExpectations });
    env.execute(null, done);
  });

  it('passes the expected and actual arguments to the comparison function', function(done) {
    var argumentSpy = jasmine
      .createSpy('argument spy')
      .and.returnValue({ pass: true });

    env.it('spec with an expectation', function() {
      env.addMatchers({
        toBeReal: function() {
          return { compare: argumentSpy };
        }
      });

      env.expect(true).toBeReal();
      env.expect(true).toBeReal('arg');
      env.expect(true).toBeReal('arg1', 'arg2');
    });

    var specExpectations = function() {
      expect(argumentSpy).toHaveBeenCalledWith(true);
      expect(argumentSpy).toHaveBeenCalledWith(true, 'arg');
      expect(argumentSpy).toHaveBeenCalledWith(true, 'arg1', 'arg2');
    };

    env.addReporter({ specDone: specExpectations });
    env.execute(null, done);
  });

  it('passes the jasmine utility to the matcher factory', function(done) {
    var matcherFactory = function(util) {
        return {
          compare: function() {
            return { pass: true };
          }
        };
      },
      matcherFactorySpy = jasmine
        .createSpy('matcherFactorySpy')
        .and.callFake(matcherFactory);

    env.it('spec with expectation', function() {
      env.addMatchers({
        toBeReal: matcherFactorySpy
      });

      env.expect(true).toBeReal();
    });

    var specExpectations = function() {
      expect(matcherFactorySpy).toHaveBeenCalledWith(
        jasmine.any(jasmineUnderTest.MatchersUtil)
      );
    };

    env.addReporter({ specDone: specExpectations });
    env.execute(null, done);
  });

  // TODO: remove this in the next major release.
  describe('When a matcher factory takes at least two arguments', function() {
    it('passes the jasmine utility and current equality testers to the matcher factory', function(done) {
      spyOn(env, 'deprecated');

      var matcherFactory = function(util, customTesters) {
          return {
            compare: function() {
              return { pass: true };
            }
          };
        },
        matcherFactorySpy = jasmine.createSpy(
          'matcherFactorySpy',
          matcherFactory
        ),
        customEqualityFn = function() {
          return true;
        };

      env.it('spec with expectation', function() {
        env.addCustomEqualityTester(customEqualityFn);
        env.addMatchers({
          toBeReal: matcherFactorySpy
        });

        env.expect(true).toBeReal();
      });

      var specExpectations = function() {
        expect(matcherFactorySpy).toHaveBeenCalledWith(
          jasmine.any(jasmineUnderTest.MatchersUtil),
          [customEqualityFn]
        );
      };

      env.addReporter({ specDone: specExpectations, jasmineDone: done });
      env.execute();
    });
  });

  it('provides custom equality testers to the matcher factory via matchersUtil', function(done) {
    var matcherFactory = function(matchersUtil) {
        return {
          compare: function(actual, expected) {
            return { pass: matchersUtil.equals(actual[0], expected) };
          }
        };
      },
      customEqualityFn = jasmine
        .createSpy('customEqualityFn')
        .and.callFake(function(a, b) {
          return a.toString() === b;
        });

    env.it('spec with expectation', function() {
      env.addCustomEqualityTester(customEqualityFn);
      env.addMatchers({
        toBeArrayWithFirstElement: matcherFactory
      });

      env.expect([1, 2]).toBeArrayWithFirstElement('1');
    });

    var specExpectations = function(result) {
      expect(customEqualityFn).toHaveBeenCalledWith(1, '1');
      expect(result.failedExpectations).toEqual([]);
    };

    env.addReporter({ specDone: specExpectations });
    env.execute(null, done);
  });

  it('logs a distinct deprecation per matcher if the matcher factory takes two arguments', function(done) {
    var matcherFactory = function(matchersUtil, customEqualityTesters) {
      return { compare: function() {} };
    };

    spyOn(env, 'deprecated');

    env.beforeEach(function() {
      env.addMatchers({ toBeFoo: matcherFactory });
      env.addMatchers({ toBeBar: matcherFactory });
    });

    env.it('a spec', function() {});
    env.it('another spec', function() {});

    function jasmineDone() {
      expect(env.deprecated).toHaveBeenCalledWith(
        jasmine.stringMatching(
          'The matcher factory for "toBeFoo" accepts custom equality testers, ' +
            'but this parameter will no longer be passed in a future release. ' +
            'See <https://jasmine.github.io/tutorials/upgrading_to_4.0> for details.'
        )
      );
      expect(env.deprecated).toHaveBeenCalledWith(
        jasmine.stringMatching(
          'The matcher factory for "toBeBar" accepts custom equality testers, ' +
            'but this parameter will no longer be passed in a future release. ' +
            'See <https://jasmine.github.io/tutorials/upgrading_to_4.0> for details.'
        )
      );
      done();
    }

    env.addReporter({ jasmineDone: jasmineDone });
    env.execute();
  });
});
