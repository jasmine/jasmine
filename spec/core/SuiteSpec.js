describe("Suite", function() {

  it("keeps its id", function() {
    var env = new j$.Env(),
      suite = new j$.Suite({
        env: env,
        id: 456,
        description: "I am a suite"
      });

    expect(suite.id).toEqual(456);
  });

  it("returns its full name", function() {
    var env = new j$.Env(),
      suite = new j$.Suite({
        env: env,
        description: "I am a suite"
      });

    expect(suite.getFullName()).toEqual("I am a suite");
  });

  it("returns its full name when it has parent suites", function() {
    var env = new j$.Env(),
      parentSuite = new j$.Suite({
        env: env,
        description: "I am a parent suite",
        parentSuite: jasmine.createSpy('pretend top level suite')
      }),
      suite = new j$.Suite({
        env: env,
        description: "I am a suite",
        parentSuite: parentSuite
      });

    expect(suite.getFullName()).toEqual("I am a parent suite I am a suite");
  });

  it("adds before functions in order of needed execution", function() {
    var env = new j$.Env(),
      suite = new j$.Suite({
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
    var env = new j$.Env(),
      suite = new j$.Suite({
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
    var suite = new j$.Suite({
      expectationResultFactory: function() { return 'hi'; }
    });
    suite.addChild({ result: { status: 'done' } });

    suite.addExpectationResult(false);
    expect(suite.status()).toBe('failed');
  });

  it("retrieves a result with updated status", function() {
    var suite = new j$.Suite({});

    expect(suite.getResult().status).toBe('finished');
  });

  it("retrives a result with disabled status", function() {
    var suite = new j$.Suite({});
    suite.disable();

    expect(suite.getResult().status).toBe('disabled');
  });

  it("is executable if not disabled", function() {
    var suite = new j$.Suite({});

    expect(suite.isExecutable()).toBe(true);
  });

  it("is not executable if disabled", function() {
    var suite = new j$.Suite({});
    suite.disable();

    expect(suite.isExecutable()).toBe(false);
  });
});
