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

  it('provides custom equality testers to the matcher factory via matchersUtil', function(done) {
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
});
