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

  it('adds before functions in order of needed execution', function() {
    var suite = new jasmineUnderTest.Suite({
        env: env,
        description: 'I am a suite'
      }),
      outerBefore = jasmine.createSpy('outerBeforeEach'),
      innerBefore = jasmine.createSpy('insideBeforeEach');

    suite.beforeEach(outerBefore);
    suite.beforeEach(innerBefore);

    expect(suite.beforeFns).toEqual([innerBefore, outerBefore]);
  });

  it('adds after functions in order of needed execution', function() {
    var suite = new jasmineUnderTest.Suite({
        env: env,
        description: 'I am a suite'
      }),
      outerAfter = jasmine.createSpy('outerAfterEach'),
      innerAfter = jasmine.createSpy('insideAfterEach');

    suite.afterEach(outerAfter);
    suite.afterEach(innerAfter);

    expect(suite.afterFns).toEqual([innerAfter, outerAfter]);
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
    it('logs a special deprecation when it is the top suite', function() {
      var env = jasmine.createSpyObj('env', ['deprecated']);
      var suite = new jasmineUnderTest.Suite({ env: env, parentSuite: null });

      suite.onMultipleDone();

      expect(env.deprecated).toHaveBeenCalledWith(
        'A top-level beforeAll or afterAll function called its ' +
          "'done' callback more than once. This is a bug in the beforeAll " +
          'or afterAll function in question. This will be treated as an ' +
          'error in a future version. See' +
          '<https://jasmine.github.io/tutorials/upgrading_to_Jasmine_4.0#deprecations-due-to-calling-done-multiple-times> ' +
          'for more information.',
        { ignoreRunnable: true }
      );
    });

    it('logs a deprecation including the suite name when it is a normal suite', function() {
      var env = jasmine.createSpyObj('env', ['deprecated']);
      var suite = new jasmineUnderTest.Suite({
        env: env,
        description: 'the suite',
        parentSuite: {
          description: 'the parent suite',
          parentSuite: {}
        }
      });

      suite.onMultipleDone();

      expect(env.deprecated).toHaveBeenCalledWith(
        "An asynchronous function called its 'done' callback more than " +
          'once. This is a bug in the spec, beforeAll, beforeEach, afterAll, ' +
          'or afterEach function in question. This will be treated as an error ' +
          'in a future version. See' +
          '<https://jasmine.github.io/tutorials/upgrading_to_Jasmine_4.0#deprecations-due-to-calling-done-multiple-times> ' +
          'for more information.\n' +
          '(in suite: the parent suite the suite)',
        { ignoreRunnable: true }
      );
    });
  });
});
