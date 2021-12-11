describe('Suite', function() {
  var env;

  beforeEach(function() {
    env = new jasmineUnderTest.Env();
  });

  afterEach(function() {
    env.cleanup_();
  });

  it('keeps its id', function() {
    var suite = new jasmineUnderTest.Suite({
      env: env,
      id: 456,
      description: 'I am a suite'
    });

    expect(suite.id).toEqual(456);
  });

  it('returns blank full name for top level suite', function() {
    var suite = new jasmineUnderTest.Suite({
      env: env,
      description: 'I am a suite'
    });

    expect(suite.getFullName()).toEqual('');
  });

  it('returns its full name when it has parent suites', function() {
    var parentSuite = new jasmineUnderTest.Suite({
        env: env,
        description: 'I am a parent suite',
        parentSuite: jasmine.createSpy('pretend top level suite')
      }),
      suite = new jasmineUnderTest.Suite({
        env: env,
        description: 'I am a suite',
        parentSuite: parentSuite
      });

    expect(suite.getFullName()).toEqual('I am a parent suite I am a suite');
  });

  it('adds beforeEach functions in order of needed execution', function() {
    var suite = new jasmineUnderTest.Suite({
        env: env,
        description: 'I am a suite'
      }),
      outerBefore = { fn: 'outerBeforeEach' },
      innerBefore = { fn: 'insideBeforeEach' };

    suite.beforeEach(outerBefore);
    suite.beforeEach(innerBefore);

    expect(suite.beforeFns).toEqual([
      { fn: innerBefore.fn, suite },
      { fn: outerBefore.fn, suite }
    ]);
  });

  it('adds beforeAll functions in order of needed execution', function() {
    var suite = new jasmineUnderTest.Suite({
        env: env,
        description: 'I am a suite'
      }),
      outerBefore = { fn: 'outerBeforeAll' },
      innerBefore = { fn: 'insideBeforeAll' };

    suite.beforeAll(outerBefore);
    suite.beforeAll(innerBefore);

    function sameInstance(expected) {
      return {
        asymmetricMatch: function(actual) {
          return actual === expected;
        },
        jasmineToString: function() {
          return `<same instance as ${expected}>`;
        }
      };
    }

    expect(suite.beforeAllFns).toEqual([
      { fn: outerBefore.fn, type: 'beforeAll', suite: sameInstance(suite) },
      { fn: innerBefore.fn, type: 'beforeAll', suite: sameInstance(suite) }
    ]);
  });

  it('adds afterEach functions in order of needed execution', function() {
    var suite = new jasmineUnderTest.Suite({
        env: env,
        description: 'I am a suite'
      }),
      outerAfter = { fn: 'outerAfterEach' },
      innerAfter = { fn: 'insideAfterEach' };

    suite.afterEach(outerAfter);
    suite.afterEach(innerAfter);

    expect(suite.afterFns).toEqual([
      { fn: innerAfter.fn, suite, type: 'afterEach' },
      { fn: outerAfter.fn, suite, type: 'afterEach' }
    ]);
  });

  it('adds afterAll functions in order of needed execution', function() {
    const suite = new jasmineUnderTest.Suite({
        env: env,
        description: 'I am a suite'
      }),
      outerAfter = { fn: 'outerAfterAll' },
      innerAfter = { fn: 'insideAfterAl' };

    suite.afterAll(outerAfter);
    suite.afterAll(innerAfter);

    expect(suite.afterAllFns).toEqual([
      { fn: innerAfter.fn, type: 'afterAll' },
      { fn: outerAfter.fn, type: 'afterAll' }
    ]);
  });

  it('has a status of failed if any expectations have failed', function() {
    var suite = new jasmineUnderTest.Suite({
      expectationResultFactory: function() {
        return 'hi';
      }
    });

    suite.addExpectationResult(false);
    expect(suite.status()).toBe('failed');
  });

  it('retrieves a result with updated status', function() {
    var suite = new jasmineUnderTest.Suite({});

    expect(suite.getResult().status).toBe('passed');
  });

  it('retrieves a result with pending status', function() {
    var suite = new jasmineUnderTest.Suite({});
    suite.pend();

    expect(suite.getResult().status).toBe('pending');
  });

  it('throws an ExpectationFailed when receiving a failed expectation when throwOnExpectationFailure is set', function() {
    var suite = new jasmineUnderTest.Suite({
      expectationResultFactory: function(data) {
        return data;
      },
      throwOnExpectationFailure: true
    });

    expect(function() {
      suite.addExpectationResult(false, 'failed');
    }).toThrowError(jasmineUnderTest.errors.ExpectationFailed);

    expect(suite.status()).toBe('failed');
    expect(suite.result.failedExpectations).toEqual(['failed']);
  });

  it('does not add an additional failure when an expectation fails', function() {
    var suite = new jasmineUnderTest.Suite({});

    suite.onException(new jasmineUnderTest.errors.ExpectationFailed());

    expect(suite.getResult().failedExpectations).toEqual([]);
  });

  it('calls timer to compute duration', function() {
    var suite = new jasmineUnderTest.Suite({
      env: env,
      id: 456,
      description: 'I am a suite',
      timer: jasmine.createSpyObj('timer', { start: null, elapsed: 77000 })
    });
    suite.startTimer();
    suite.endTimer();
    expect(suite.getResult().duration).toEqual(77000);
  });

  describe('#sharedUserContext', function() {
    beforeEach(function() {
      this.suite = new jasmineUnderTest.Suite({});
    });

    it('returns a UserContext', function() {
      expect(this.suite.sharedUserContext().constructor).toBe(
        jasmineUnderTest.UserContext
      );
    });
  });

  describe('attr.autoCleanClosures', function() {
    function arrangeSuite(attrs) {
      var suite = new jasmineUnderTest.Suite(attrs);
      suite.beforeAll(function() {});
      suite.beforeEach(function() {});
      suite.afterEach(function() {});
      suite.afterAll(function() {});
      return suite;
    }

    it('should clean closures when "attr.autoCleanClosures" is missing', function() {
      var suite = arrangeSuite({});
      suite.cleanupBeforeAfter();
      expect(suite.beforeAllFns[0].fn).toBe(null);
      expect(suite.beforeFns[0].fn).toBe(null);
      expect(suite.afterFns[0].fn).toBe(null);
      expect(suite.afterAllFns[0].fn).toBe(null);
    });

    it('should clean closures when "attr.autoCleanClosures" is true', function() {
      var suite = arrangeSuite({ autoCleanClosures: true });
      suite.cleanupBeforeAfter();
      expect(suite.beforeAllFns[0].fn).toBe(null);
      expect(suite.beforeFns[0].fn).toBe(null);
      expect(suite.afterFns[0].fn).toBe(null);
      expect(suite.afterAllFns[0].fn).toBe(null);
    });

    it('should NOT clean closures when "attr.autoCleanClosures" is false', function() {
      var suite = arrangeSuite({ autoCleanClosures: false });
      suite.cleanupBeforeAfter();
      expect(suite.beforeAllFns[0].fn).not.toBe(null);
      expect(suite.beforeFns[0].fn).not.toBe(null);
      expect(suite.afterFns[0].fn).not.toBe(null);
      expect(suite.afterAllFns[0].fn).not.toBe(null);
    });
  });

  describe('#reset', function() {
    it('should reset the "pending" status', function() {
      var suite = new jasmineUnderTest.Suite({});
      suite.pend();
      suite.reset();
      expect(suite.getResult().status).toBe('passed');
    });

    it('should not reset the "pending" status when the suite was excluded', function() {
      var suite = new jasmineUnderTest.Suite({});
      suite.exclude();
      suite.reset();
      expect(suite.getResult().status).toBe('pending');
    });

    it('should also reset the children', function() {
      var suite = new jasmineUnderTest.Suite({});
      var child1 = jasmine.createSpyObj(['reset']);
      var child2 = jasmine.createSpyObj(['reset']);
      suite.addChild(child1);
      suite.addChild(child2);

      suite.reset();

      expect(child1.reset).toHaveBeenCalled();
      expect(child2.reset).toHaveBeenCalled();
    });

    it('should reset the failedExpectations', function() {
      var suite = new jasmineUnderTest.Suite({
        expectationResultFactory: function(error) {
          return error;
        }
      });
      suite.onException(new Error());

      suite.reset();

      var result = suite.getResult();
      expect(result.status).toBe('passed');
      expect(result.failedExpectations).toHaveSize(0);
    });
  });

  describe('#onMultipleDone', function() {
    it('reports a special error when it is the top suite', function() {
      const onLateError = jasmine.createSpy('onLateError');
      const suite = new jasmineUnderTest.Suite({
        onLateError,
        parentSuite: null
      });

      suite.onMultipleDone();

      expect(onLateError).toHaveBeenCalledTimes(1);
      expect(onLateError.calls.argsFor(0)[0]).toBeInstanceOf(Error);
      expect(onLateError.calls.argsFor(0)[0].message).toEqual(
        'A top-level beforeAll or afterAll function called its ' +
          "'done' callback more than once."
      );
    });

    it('reports an error including the suite name when it is a normal suite', function() {
      const onLateError = jasmine.createSpy('onLateError');
      var suite = new jasmineUnderTest.Suite({
        onLateError,
        description: 'the suite',
        parentSuite: {
          description: 'the parent suite',
          parentSuite: {}
        }
      });

      suite.onMultipleDone();

      expect(onLateError).toHaveBeenCalledTimes(1);
      expect(onLateError.calls.argsFor(0)[0]).toBeInstanceOf(Error);
      expect(onLateError.calls.argsFor(0)[0].message).toEqual(
        "An asynchronous beforeAll or afterAll function called its 'done' " +
          'callback more than once.\n(in suite: the parent suite the suite)'
      );
    });
  });
});
