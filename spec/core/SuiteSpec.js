describe('Suite', function() {
  let env;

  beforeEach(function() {
    env = new privateUnderTest.Env();
  });

  afterEach(function() {
    env.cleanup_();
  });

  it('keeps its id', function() {
    const suite = new privateUnderTest.Suite({
      env: env,
      id: 456,
      description: 'I am a suite'
    });

    expect(suite.id).toEqual(456);
  });

  it('returns blank full name for top level suite', function() {
    const suite = new privateUnderTest.Suite({
      env: env,
      description: 'I am a suite'
    });

    expect(suite.getFullName()).toEqual('');
  });

  it('returns its full name when it has parent suites', function() {
    const parentSuite = new privateUnderTest.Suite({
        env: env,
        description: 'I am a parent suite',
        parentSuite: jasmine.createSpy('pretend top level suite')
      }),
      suite = new privateUnderTest.Suite({
        env: env,
        description: 'I am a suite',
        parentSuite: parentSuite
      });

    expect(suite.getFullName()).toEqual('I am a parent suite I am a suite');
  });

  it('adds beforeEach functions in order of needed execution', function() {
    const suite = new privateUnderTest.Suite({
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
    const suite = new privateUnderTest.Suite({
        env: env,
        description: 'I am a suite'
      }),
      outerBefore = { fn: 'outerBeforeAll' },
      innerBefore = { fn: 'insideBeforeAll' };

    suite.beforeAll(outerBefore);
    suite.beforeAll(innerBefore);

    expect(suite.beforeAllFns).toEqual([
      { fn: outerBefore.fn, type: 'beforeAll', suite: jasmine.is(suite) },
      { fn: innerBefore.fn, type: 'beforeAll', suite: jasmine.is(suite) }
    ]);
  });

  it('adds afterEach functions in order of needed execution', function() {
    const suite = new privateUnderTest.Suite({
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
    const suite = new privateUnderTest.Suite({
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
    const suite = new privateUnderTest.Suite({});

    suite.addExpectationResult(false, {});
    expect(suite.doneEvent().status).toBe('failed');
  });

  it('retrieves a result with updated status', function() {
    const suite = new privateUnderTest.Suite({});

    expect(suite.doneEvent().status).toBe('passed');
  });

  it('retrieves a result with pending status', function() {
    const suite = new privateUnderTest.Suite({});
    suite.pend();

    expect(suite.doneEvent().status).toBe('pending');
  });

  it('throws an ExpectationFailed when receiving a failed expectation when throwOnExpectationFailure is set', function() {
    const suite = new privateUnderTest.Suite({
      throwOnExpectationFailure: true
    });

    expect(function() {
      suite.addExpectationResult(false, { message: 'failed' });
    }).toThrowError(jasmineUnderTest.private.errors.ExpectationFailed);

    expect(suite.doneEvent().status).toBe('failed');
    expect(suite.doneEvent().failedExpectations).toEqual([
      jasmine.objectContaining({ message: 'failed' })
    ]);
  });

  it('does not add an additional failure when an expectation fails', function() {
    const suite = new privateUnderTest.Suite({});

    suite.handleException(
      new jasmineUnderTest.private.errors.ExpectationFailed()
    );

    expect(suite.doneEvent().failedExpectations).toEqual([]);
  });

  it('forwards late expectation failures to onLateError', function() {
    const onLateError = jasmine.createSpy('onLateError');
    const suite = new privateUnderTest.Suite({ onLateError });
    const data = {
      matcherName: '',
      passed: false,
      expected: '',
      actual: '',
      error: new Error('nope')
    };

    suite.reportedDone = true;
    suite.addExpectationResult(false, data, true);

    expect(onLateError).toHaveBeenCalledWith(
      jasmine.objectContaining({
        message: jasmine.stringMatching(/^Error: nope/)
      })
    );
    expect(suite.doneEvent().failedExpectations).toEqual([]);
  });

  it('does not forward non-late expectation failures to onLateError', function() {
    const onLateError = jasmine.createSpy('onLateError');
    const suite = new privateUnderTest.Suite({
      onLateError
    });
    const data = {
      matcherName: '',
      passed: false,
      expected: '',
      actual: '',
      error: new Error('nope')
    };

    suite.addExpectationResult(false, data, true);

    expect(onLateError).not.toHaveBeenCalled();
    expect(suite.doneEvent().failedExpectations.length).toEqual(1);
  });

  it('forwards late handleException calls to onLateError', function() {
    const onLateError = jasmine.createSpy('onLateError');
    const suite = new privateUnderTest.Suite({
      onLateError
    });
    const error = new Error('oops');

    suite.reportedDone = true;
    suite.handleException(error);

    expect(onLateError).toHaveBeenCalledWith(
      jasmine.objectContaining({
        message: jasmine.stringMatching(/^Error: oops/)
      })
    );
    expect(suite.doneEvent().failedExpectations).toEqual([]);
  });

  it('does not forward non-late handleException calls to onLateError', function() {
    const onLateError = jasmine.createSpy('onLateError');
    const suite = new privateUnderTest.Suite({
      onLateError
    });
    const error = new Error('oops');

    suite.handleException(error);

    expect(onLateError).not.toHaveBeenCalled();
    expect(suite.doneEvent().failedExpectations.length).toEqual(1);
  });

  it('clears the reportedDone flag when reset', function() {
    const suite = new privateUnderTest.Suite({
      queueableFn: { fn: function() {} }
    });
    suite.reportedDone = true;

    suite.reset();

    expect(suite.reportedDone).toBeFalse();
  });

  it('calls timer to compute duration', function() {
    const suite = new privateUnderTest.Suite({
      env: env,
      id: 456,
      description: 'I am a suite',
      timer: jasmine.createSpyObj('timer', { start: null, elapsed: 77000 })
    });
    suite.startTimer();
    suite.endTimer();
    expect(suite.doneEvent().duration).toEqual(77000);
  });

  describe('#sharedUserContext', function() {
    beforeEach(function() {
      this.suite = new privateUnderTest.Suite({});
    });

    it('returns a UserContext', function() {
      expect(this.suite.sharedUserContext().constructor).toBe(
        privateUnderTest.UserContext
      );
    });
  });

  describe('attr.autoCleanClosures', function() {
    function arrangeSuite(attrs) {
      const suite = new privateUnderTest.Suite(attrs);
      suite.beforeAll(function() {});
      suite.beforeEach(function() {});
      suite.afterEach(function() {});
      suite.afterAll(function() {});
      return suite;
    }

    it('should clean closures when "attr.autoCleanClosures" is missing', function() {
      const suite = arrangeSuite({});
      suite.cleanupBeforeAfter();
      expect(suite.beforeAllFns[0].fn).toBe(null);
      expect(suite.beforeFns[0].fn).toBe(null);
      expect(suite.afterFns[0].fn).toBe(null);
      expect(suite.afterAllFns[0].fn).toBe(null);
    });

    it('should clean closures when "attr.autoCleanClosures" is true', function() {
      const suite = arrangeSuite({ autoCleanClosures: true });
      suite.cleanupBeforeAfter();
      expect(suite.beforeAllFns[0].fn).toBe(null);
      expect(suite.beforeFns[0].fn).toBe(null);
      expect(suite.afterFns[0].fn).toBe(null);
      expect(suite.afterAllFns[0].fn).toBe(null);
    });

    it('should NOT clean closures when "attr.autoCleanClosures" is false', function() {
      const suite = arrangeSuite({ autoCleanClosures: false });
      suite.cleanupBeforeAfter();
      expect(suite.beforeAllFns[0].fn).not.toBe(null);
      expect(suite.beforeFns[0].fn).not.toBe(null);
      expect(suite.afterFns[0].fn).not.toBe(null);
      expect(suite.afterAllFns[0].fn).not.toBe(null);
    });
  });

  describe('#reset', function() {
    it('should reset the "pending" status', function() {
      const suite = new privateUnderTest.Suite({});
      suite.pend();
      suite.reset();
      expect(suite.doneEvent().status).toBe('passed');
    });

    it('should not reset the "pending" status when the suite was excluded', function() {
      const suite = new privateUnderTest.Suite({});
      suite.exclude();
      suite.reset();
      expect(suite.doneEvent().status).toBe('pending');
    });

    it('should also reset the children', function() {
      const suite = new privateUnderTest.Suite({});
      const child1 = jasmine.createSpyObj(['reset']);
      const child2 = jasmine.createSpyObj(['reset']);
      suite.addChild(child1);
      suite.addChild(child2);

      suite.reset();

      expect(child1.reset).toHaveBeenCalled();
      expect(child2.reset).toHaveBeenCalled();
    });

    it('should reset the failedExpectations', function() {
      const suite = new privateUnderTest.Suite({});
      suite.handleException(new Error());

      suite.reset();

      const result = suite.doneEvent();
      expect(result.status).toBe('passed');
      expect(result.failedExpectations).toHaveSize(0);
    });
  });

  describe('#onMultipleDone', function() {
    it('reports a special error when it is the top suite', function() {
      const onLateError = jasmine.createSpy('onLateError');
      const suite = new privateUnderTest.Suite({
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
      const suite = new privateUnderTest.Suite({
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

  describe('#hasChildWithDescription', function() {
    it('returns true if there is a child with the given description', function() {
      const subject = new privateUnderTest.Suite({});
      const description = 'a spec';
      subject.addChild({ description });

      expect(subject.hasChildWithDescription(description)).toBeTrue();
    });

    it('returns false if there is no child with the given description', function() {
      const subject = new privateUnderTest.Suite({});
      subject.addChild({ description: 'a different spec' });

      expect(subject.hasChildWithDescription('a spec')).toBeFalse();
    });

    it('does not recurse into child suites', function() {
      const subject = new privateUnderTest.Suite({});
      const childSuite = new privateUnderTest.Suite({});
      subject.addChild(childSuite);
      const description = 'a spec';
      childSuite.addChild(description);

      expect(subject.hasChildWithDescription('a spec')).toBeFalse();
    });
  });

  describe('#setSuiteProperty', function() {
    it('throws if the key is not structured-cloneable', function() {
      const suite = new privateUnderTest.Suite({});

      expect(function() {
        suite.setSuiteProperty(new Promise(() => {}), '');
      }).toThrowError("Key can't be cloned");
    });

    it('throws if the value is not structured-cloneable', function() {
      const suite = new privateUnderTest.Suite({});

      expect(function() {
        suite.setSuiteProperty('k', new Promise(() => {}));
      }).toThrowError("Value can't be cloned");
    });
  });

  describe('#startedEvent', function() {
    it('includes only properties that are known before execution', function() {
      const topSuite = new privateUnderTest.Suite({});
      const parentSuite = new privateUnderTest.Suite({
        id: 'suite1',
        parentSuite: topSuite,
        description: 'a parent suite'
      });
      const suite = new privateUnderTest.Suite({
        id: 'suite2',
        parentSuite,
        reportedParentSuiteId: parentSuite.id,
        description: 'a suite',
        filename: 'somefile.js',
        getPath() {
          return ['a parent suite', 'a spec'];
        },
        queueableFn: { fn: () => {} }
      });

      expect(suite.startedEvent()).toEqual({
        id: 'suite2',
        parentSuiteId: 'suite1',
        description: 'a suite',
        fullName: 'a parent suite a suite',
        filename: 'somefile.js'
      });
    });
  });
});
