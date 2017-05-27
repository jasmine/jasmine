describe("Suite", function() {

  it("keeps its id", function() {
    var env = new jasmineUnderTest.Env(),
      suite = new jasmineUnderTest.Suite({
        env: env,
        id: 456,
        description: "I am a suite"
      });

    expect(suite.id).toEqual(456);
  });

  it("returns blank full name for top level suite", function() {
    var env = new jasmineUnderTest.Env(),
      suite = new jasmineUnderTest.Suite({
        env: env,
        description: "I am a suite"
      });

    expect(suite.getFullName()).toEqual("");
  });

  it("returns its full name when it has parent suites", function() {
    var env = new jasmineUnderTest.Env(),
      parentSuite = new jasmineUnderTest.Suite({
        env: env,
        description: "I am a parent suite",
        parentSuite: jasmine.createSpy('pretend top level suite')
      }),
      suite = new jasmineUnderTest.Suite({
        env: env,
        description: "I am a suite",
        parentSuite: parentSuite
      });

    expect(suite.getFullName()).toEqual("I am a parent suite I am a suite");
  });

  it("adds before functions in order of needed execution", function() {
    var env = new jasmineUnderTest.Env(),
      suite = new jasmineUnderTest.Suite({
        env: env,
        description: "I am a suite"
      }),
      outerBefore = jasmine.createSpy('outerBeforeEach'),
      innerBefore = jasmine.createSpy('insideBeforeEach');

    suite.beforeEach(outerBefore);
    suite.beforeEach(innerBefore);

    expect(suite.beforeFns).toEqual([innerBefore, outerBefore]);
  });

  it("adds after functions in order of needed execution", function() {
    var env = new jasmineUnderTest.Env(),
      suite = new jasmineUnderTest.Suite({
        env: env,
        description: "I am a suite"
      }),
      outerAfter = jasmine.createSpy('outerAfterEach'),
      innerAfter = jasmine.createSpy('insideAfterEach');

    suite.afterEach(outerAfter);
    suite.afterEach(innerAfter);

    expect(suite.afterFns).toEqual([innerAfter, outerAfter]);
  });

  it('has a status of failed if any afterAll expectations have failed', function() {
    var suite = new jasmineUnderTest.Suite({
      expectationResultFactory: function() { return 'hi'; }
    });
    suite.addChild({ result: { status: 'done' } });

    suite.addExpectationResult(false);
    expect(suite.status()).toBe('failed');
  });

  it("retrieves a result with updated status", function() {
    var suite = new jasmineUnderTest.Suite({});

    expect(suite.getResult().status).toBe('finished');
  });

  it("retrieves a result with pending status", function() {
    var suite = new jasmineUnderTest.Suite({});
    suite.pend();

    expect(suite.getResult().status).toBe('pending');
    expect(suite.getResult().pendingReason).toBe('');
  });

  it("should set the pendingReason", function() {
    var suite = new jasmineUnderTest.Suite({});
    suite.pend('custom message');

    expect(suite.getResult().status).toBe('pending');
    expect(suite.getResult().pendingReason).toBe('custom message');
  });

  it("is executable if not pending", function() {
    var suite = new jasmineUnderTest.Suite({});

    expect(suite.isExecutable()).toBe(true);
  });

  it("is not executable if pending", function() {
    var suite = new jasmineUnderTest.Suite({});
    suite.pend();

    expect(suite.isExecutable()).toBe(false);
  });

  it("tells all children about expectation failures, even if one throws", function() {
    var suite = new jasmineUnderTest.Suite({}),
      child1 = { addExpectationResult: jasmine.createSpy('child1#expectationResult'), result: {} },
      child2 = { addExpectationResult: jasmine.createSpy('child2#expectationResult'), result: {} };

    suite.addChild(child1);
    suite.addChild(child2);

    child1.addExpectationResult.and.throwError('foo');

    suite.addExpectationResult('stuff');

    expect(child1.addExpectationResult).toHaveBeenCalledWith('stuff');
    expect(child2.addExpectationResult).toHaveBeenCalledWith('stuff');
  });

  it("throws an ExpectationFailed when receiving a failed expectation in an afterAll when throwOnExpectationFailure is set", function() {
    var suite = new jasmineUnderTest.Suite({
      expectationResultFactory: function(data) { return data; },
      throwOnExpectationFailure: true
    });
    suite.addChild({ result: { status: 'done' } });

    expect(function() {
      suite.addExpectationResult(false, 'failed');
    }).toThrowError(jasmineUnderTest.errors.ExpectationFailed);

    expect(suite.status()).toBe('failed');
    expect(suite.result.failedExpectations).toEqual(['failed']);
  });

  it("does not add an additional failure when an expectation fails in an afterAll", function(){
    var suite = new jasmineUnderTest.Suite({});
    suite.addChild({ result: { status: 'done' } });

    suite.onException(new jasmineUnderTest.errors.ExpectationFailed());

    expect(suite.getResult().failedExpectations).toEqual([]);
  })
});
