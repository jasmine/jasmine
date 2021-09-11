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
