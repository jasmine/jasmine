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

  it("runs beforeAll functions in order of needed execution", function() {
    var env = new j$.Env(),
      fakeQueueRunner = jasmine.createSpy('fake queue runner'),
      suite = new j$.Suite({
        env: env,
        description: "I am a suite",
        queueRunner: fakeQueueRunner
      }),
      firstBefore = jasmine.createSpy('outerBeforeAll'),
      lastBefore = jasmine.createSpy('insideBeforeAll'),
      fakeIt = {execute: jasmine.createSpy('it'), isExecutable: function() { return true; } };

    suite.beforeAll(firstBefore);
    suite.beforeAll(lastBefore);
    suite.addChild(fakeIt);

    suite.execute();
    var suiteFns = fakeQueueRunner.calls.mostRecent().args[0].queueableFns;

    suiteFns[0]();
    expect(firstBefore).toHaveBeenCalled();
    suiteFns[1]();
    expect(lastBefore).toHaveBeenCalled();
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

  it("runs afterAll functions in order of needed execution", function() {
    var env = new j$.Env(),
      fakeQueueRunner = jasmine.createSpy('fake queue runner'),
      suite = new j$.Suite({
        env: env,
        description: "I am a suite",
        queueRunner: fakeQueueRunner
      }),
      firstAfter = jasmine.createSpy('outerAfterAll'),
      lastAfter = jasmine.createSpy('insideAfterAll'),
      fakeIt = {execute: jasmine.createSpy('it'), isExecutable: function() { return true; } };

    suite.afterAll(firstAfter);
    suite.afterAll(lastAfter);
    suite.addChild(fakeIt);

    suite.execute();
    var suiteFns = fakeQueueRunner.calls.mostRecent().args[0].queueableFns;

    suiteFns[1]();
    expect(firstAfter).toHaveBeenCalled();
    suiteFns[2]();
    expect(lastAfter).toHaveBeenCalled();
  });

  it("can be disabled, but still calls callbacks", function() {
    var env = new j$.Env(),
      fakeQueueRunner = jasmine.createSpy('fake queue runner'),
      onStart = jasmine.createSpy('onStart'),
      resultCallback = jasmine.createSpy('resultCallback'),
      onComplete = jasmine.createSpy('onComplete'),
      suite = new j$.Suite({
        env: env,
        description: "with a child suite",
        onStart: onStart,
        resultCallback: resultCallback,
        queueRunner: fakeQueueRunner
      });

    suite.disable();

    expect(suite.disabled).toBe(true);

    suite.execute(onComplete);

    expect(fakeQueueRunner).not.toHaveBeenCalled();
    expect(onStart).toHaveBeenCalled();
    expect(resultCallback).toHaveBeenCalled();
    expect(onComplete).toHaveBeenCalled();
  });

  it("delegates execution of its specs, suites, beforeAlls, and afterAlls", function() {
    var env = new j$.Env(),
      parentSuiteDone = jasmine.createSpy('parent suite done'),
      fakeQueueRunnerForParent = jasmine.createSpy('fake parent queue runner'),
      parentSuite = new j$.Suite({
        env: env,
        description: "I am a parent suite",
        queueRunner: fakeQueueRunnerForParent
      }),
      fakeQueueRunner = jasmine.createSpy('fake queue runner'),
      suite = new j$.Suite({
        env: env,
        description: "with a child suite",
        queueRunner: fakeQueueRunner
      }),
      fakeSpec1 = {
        execute: jasmine.createSpy('fakeSpec1'),
        isExecutable: function() { return true; }
      },
      beforeAllFn = { fn: jasmine.createSpy('beforeAll') },
      afterAllFn = { fn: jasmine.createSpy('afterAll') };

    spyOn(suite, "execute");

    parentSuite.addChild(fakeSpec1);
    parentSuite.addChild(suite);
    parentSuite.beforeAll(beforeAllFn);
    parentSuite.afterAll(afterAllFn);

    parentSuite.execute(parentSuiteDone);

    var parentSuiteFns = fakeQueueRunnerForParent.calls.mostRecent().args[0].queueableFns;

    parentSuiteFns[0].fn();
    expect(beforeAllFn.fn).toHaveBeenCalled();
    parentSuiteFns[1].fn();
    expect(fakeSpec1.execute).toHaveBeenCalled();
    parentSuiteFns[2].fn();
    expect(suite.execute).toHaveBeenCalled();
    parentSuiteFns[3].fn();
    expect(afterAllFn.fn).toHaveBeenCalled();
  });

  it("does not run beforeAll or afterAll if there are no executable child specs", function() {
    var env = new j$.Env(),
        fakeQueueRunnerForParent = jasmine.createSpy('fake parent queue runner'),
        fakeQueueRunnerForChild = jasmine.createSpy('fake child queue runner'),
        parentSuite = new j$.Suite({
          env: env,
          description: "I am a suite",
          queueRunner: fakeQueueRunnerForParent
        }),
        childSuite = new j$.Suite({
          env: env,
          description: "I am a suite",
          queueRunner: fakeQueueRunnerForChild,
          parentSuite: parentSuite
        }),
        beforeAllFn = jasmine.createSpy('beforeAll'),
        afterAllFn = jasmine.createSpy('afterAll');

    parentSuite.addChild(childSuite);
    parentSuite.beforeAll(beforeAllFn);
    parentSuite.afterAll(afterAllFn);

    parentSuite.execute();
    expect(fakeQueueRunnerForParent).toHaveBeenCalledWith(jasmine.objectContaining({
      queueableFns: [{ fn: jasmine.any(Function) }]
    }));
  });

  it("calls a provided onStart callback when starting", function() {
    var env = new j$.Env(),
      suiteStarted = jasmine.createSpy('suiteStarted'),
      fakeQueueRunner = function(attrs) { attrs.onComplete(); },
      suite = new j$.Suite({
        env: env,
        description: "with a child suite",
        onStart: suiteStarted,
        queueRunner: fakeQueueRunner
      }),
      fakeSpec1 = {
        execute: jasmine.createSpy('fakeSpec1'),
        isExecutable: function() { return true; }
      };

    suite.execute();

    expect(suiteStarted).toHaveBeenCalledWith(suite);
  });

  it("calls a provided onComplete callback when done", function() {
    var env = new j$.Env(),
      suiteCompleted = jasmine.createSpy('parent suite done'),
      fakeQueueRunner = function(attrs) { attrs.onComplete(); },
      suite = new j$.Suite({
        env: env,
        description: "with a child suite",
        queueRunner: fakeQueueRunner
      }),
      fakeSpec1 = {
        execute: jasmine.createSpy('fakeSpec1')
      };

    suite.execute(suiteCompleted);

    expect(suiteCompleted).toHaveBeenCalled();
  });

  it("calls a provided result callback when done", function() {
    var env = new j$.Env(),
      suiteResultsCallback = jasmine.createSpy('suite result callback'),
      fakeQueueRunner = function(attrs) { attrs.onComplete(); },
      suite = new j$.Suite({
        env: env,
        description: "with a child suite",
        queueRunner: fakeQueueRunner,
        resultCallback: suiteResultsCallback
      }),
      fakeSpec1 = {
        execute: jasmine.createSpy('fakeSpec1')
      };

    suite.execute();

    expect(suiteResultsCallback).toHaveBeenCalledWith({
      id: suite.id,
      status: 'finished',
      description: "with a child suite",
      fullName: "with a child suite",
      failedExpectations: []
    });
  });

  it("calls a provided result callback with status being disabled when disabled and done", function() {
    var env = new j$.Env(),
      suiteResultsCallback = jasmine.createSpy('suite result callback'),
      fakeQueueRunner = function(attrs) { attrs.onComplete(); },
      suite = new j$.Suite({
        env: env,
        description: "with a child suite",
        queueRunner: fakeQueueRunner,
        resultCallback: suiteResultsCallback
      }),
      fakeSpec1 = {
        execute: jasmine.createSpy('fakeSpec1')
      };

    suite.disable();

    suite.execute();

    expect(suiteResultsCallback).toHaveBeenCalledWith({
      id: suite.id,
      status: 'disabled',
      description: "with a child suite",
      fullName: "with a child suite",
      failedExpectations: []
    });
  });

  it('has a status of failed if any afterAll expectations have failed', function() {
    var suite = new j$.Suite({
      expectationResultFactory: function() { return 'hi'; }
    });
    suite.addChild({ result: { status: 'done' } });

    suite.addExpectationResult(false);
    expect(suite.status()).toBe('failed');
  });
});
