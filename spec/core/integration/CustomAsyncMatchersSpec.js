/* eslint-disable compat/compat */
describe('Custom Async Matchers (Integration)', function() {
  var env;

  beforeEach(function() {
    env = new jasmineUnderTest.Env();
    env.configure({ random: false });
  });

  afterEach(function() {
    env.cleanup_();
  });

  it('passes the spec if the custom async matcher passes', function(done) {
    jasmine.getEnv().requirePromises();

    env.it('spec using custom async matcher', function() {
      env.addAsyncMatchers({
        toBeReal: function() {
          return {
            compare: function() {
              return Promise.resolve({ pass: true });
            }
          };
        }
      });

      return env.expectAsync(true).toBeReal();
    });

    var specExpectations = function(result) {
      expect(result.status).toEqual('passed');
    };

    env.addReporter({ specDone: specExpectations });
    env.execute(null, done);
  });

  it('uses the negative compare function for a negative comparison, if provided', function(done) {
    jasmine.getEnv().requirePromises();

    env.it('spec with custom negative comparison matcher', function() {
      env.addAsyncMatchers({
        toBeReal: function() {
          return {
            compare: function() {
              return Promise.resolve({ pass: true });
            },
            negativeCompare: function() {
              return Promise.resolve({ pass: true });
            }
          };
        }
      });

      return env.expectAsync(true).not.toBeReal();
    });

    var specExpectations = function(result) {
      expect(result.status).toEqual('passed');
    };

    env.addReporter({ specDone: specExpectations });
    env.execute(null, done);
  });

  it('generates messages with the same rules as built in matchers absent a custom message', function(done) {
    jasmine.getEnv().requirePromises();

    env.it('spec with an expectation', function() {
      env.addAsyncMatchers({
        toBeReal: function() {
          return {
            compare: function() {
              return Promise.resolve({ pass: false });
            }
          };
        }
      });

      return env.expectAsync('a').toBeReal();
    });

    var specExpectations = function(result) {
      expect(result.failedExpectations[0].message).toEqual(
        "Expected 'a' to be real."
      );
    };

    env.addReporter({ specDone: specExpectations });
    env.execute(null, done);
  });

  it('passes the jasmine utility to the matcher factory', function(done) {
    jasmine.getEnv().requirePromises();

    var matcherFactory = function(util) {
        return {
          compare: function() {
            return Promise.resolve({ pass: true });
          }
        };
      },
      matcherFactorySpy = jasmine.createSpy(
        'matcherFactorySpy',
        matcherFactory
      );

    env.it('spec with expectation', function() {
      env.addAsyncMatchers({
        toBeReal: matcherFactorySpy
      });

      return env.expectAsync(true).toBeReal();
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
      jasmine.getEnv().requirePromises();

      var matcherFactory = function(util, customTesters) {
          return {
            compare: function() {
              return Promise.resolve({ pass: true });
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
        env.addAsyncMatchers({
          toBeReal: matcherFactorySpy
        });

        return env.expectAsync(true).toBeReal();
      });

      var specExpectations = function() {
        expect(matcherFactorySpy).toHaveBeenCalledWith(
          jasmine.any(jasmineUnderTest.MatchersUtil),
          [customEqualityFn]
        );
      };

      spyOn(env, 'deprecated');
      env.addReporter({
        specDone: specExpectations,
        jasmineDone: function() {
          done();
        }
      });
      env.execute();
    });
  });

  it('provides custom equality testers to the matcher factory via matchersUtil', function(done) {
    jasmine.getEnv().requirePromises();

    var matcherFactory = function(matchersUtil) {
        return {
          compare: function(actual, expected) {
            return Promise.resolve({
              pass: matchersUtil.equals(actual[0], expected)
            });
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
      env.addAsyncMatchers({
        toBeArrayWithFirstElement: matcherFactory
      });

      return env.expectAsync([1, 2]).toBeArrayWithFirstElement('1');
    });

    var specExpectations = function(result) {
      expect(customEqualityFn).toHaveBeenCalledWith(1, '1');
      expect(result.failedExpectations).toEqual([]);
    };

    env.addReporter({ specDone: specExpectations });
    env.execute(null, done);
  });

  it('logs a distinct deprecation for each matcher if the matcher factory takes two arguments', function(done) {
    var matcherFactory = function(matchersUtil, customEqualityTesters) {
      return { compare: function() {} };
    };

    spyOn(env, 'deprecated');

    env.beforeEach(function() {
      env.addAsyncMatchers({ toBeFoo: matcherFactory });
      env.addAsyncMatchers({ toBeBar: matcherFactory });
    });

    env.it('a spec', function() {});
    env.it('another spec', function() {});

    function jasmineDone() {
      expect(env.deprecated).toHaveBeenCalledWith(
        jasmine.stringMatching(
          'The matcher factory for "toBeFoo" accepts custom equality testers, ' +
            'but this parameter will no longer be passed in a future release. ' +
            'See <https://jasmine.github.io/tutorials/upgrading_to_Jasmine_4.0#matchers-cet> for details.'
        )
      );
      expect(env.deprecated).toHaveBeenCalledWith(
        jasmine.stringMatching(
          'The matcher factory for "toBeBar" accepts custom equality testers, ' +
            'but this parameter will no longer be passed in a future release. ' +
            'See <https://jasmine.github.io/tutorials/upgrading_to_Jasmine_4.0#matchers-cet> for details.'
        )
      );
      done();
    }

    env.addReporter({ jasmineDone: jasmineDone });
    env.execute();
  });
});
