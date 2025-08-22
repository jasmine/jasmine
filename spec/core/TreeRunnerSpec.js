describe('TreeRunner', function() {
  describe('spec execution', function() {
    it('starts the timer, reports the spec started, and updates run state at the start of the queue', async function() {
      const timer = jasmine.createSpyObj('timer', ['start']);
      const spec = new jasmineUnderTest.Spec({
        id: 'spec1',
        queueableFn: {},
        timer
      });
      const {
        runQueue,
        currentRunableTracker,
        runableResources,
        reportDispatcher,
        suiteRunQueueArgs,
        executePromise
      } = runSingleSpecSuite(spec);
      suiteRunQueueArgs.queueableFns[0].fn();

      expect(runQueue).toHaveBeenCalledTimes(1);
      const specRunQueueArgs = runQueue.calls.mostRecent().args[0];
      const next = jasmine.createSpy('next');
      specRunQueueArgs.queueableFns[0].fn(next);

      expect(timer.start).toHaveBeenCalled();
      expect(currentRunableTracker.currentRunable()).toBe(spec);
      expect(runableResources.initForRunable).toHaveBeenCalledWith(
        spec.id,
        spec.parentSuiteId
      );
      expect(reportDispatcher.specStarted).toHaveBeenCalledWith(spec.result);
      await Promise.resolve();
      expect(reportDispatcher.specStarted).toHaveBeenCalledBefore(next);
      await expectAsync(executePromise).toBePending();
    });

    it('stops the timer, updates run state, and reports the spec done at the end of the queue', async function() {
      const timer = jasmine.createSpyObj('timer', ['start', 'elapsed']);
      const spec = new jasmineUnderTest.Spec({
        id: 'spec1',
        queueableFn: {},
        timer
      });
      const {
        runQueue,
        currentRunableTracker,
        runableResources,
        reportDispatcher,
        suiteRunQueueArgs,
        executePromise
      } = runSingleSpecSuite(spec);

      suiteRunQueueArgs.queueableFns[0].fn();

      expect(runQueue).toHaveBeenCalledTimes(1);
      const specRunQueueArgs = runQueue.calls.mostRecent().args[0];
      const next = jasmine.createSpy('next');
      timer.elapsed.and.returnValue('the elapsed time');
      currentRunableTracker.setCurrentSpec(spec);
      specRunQueueArgs.queueableFns[1].fn(next);

      expect(currentRunableTracker.currentSpec()).toBeFalsy();
      expect(runableResources.clearForRunable).toHaveBeenCalledWith(spec.id);
      expect(reportDispatcher.specDone).toHaveBeenCalledWith(spec.result);
      expect(spec.result.duration).toEqual('the elapsed time');
      expect(spec.reportedDone).toEqual(true);
      await Promise.resolve();
      await Promise.resolve();
      await Promise.resolve();
      expect(reportDispatcher.specDone).toHaveBeenCalledBefore(next);
      await expectAsync(executePromise).toBePending();
    });

    function runSingleSpecSuite(spec) {
      const topSuiteId = 'suite1';
      spec.parentSuiteId = topSuiteId;
      const topSuite = new jasmineUnderTest.Suite({ id: topSuiteId });
      topSuite.addChild(spec);
      const executionTree = {
        topSuite,
        childrenOfTopSuite() {
          return [{ spec }];
        },
        isExcluded() {
          return false;
        }
      };
      const runQueue = jasmine.createSpy('runQueue');
      const reportDispatcher = mockReportDispatcher();
      const runableResources = mockRunableResources();
      const currentRunableTracker = new jasmineUnderTest.CurrentRunableTracker();
      const subject = new jasmineUnderTest.TreeRunner({
        executionTree,
        runQueue,
        runableResources,
        reportDispatcher,
        currentRunableTracker,
        getConfig() {
          return {};
        },
        reportChildrenOfBeforeAllFailure() {}
      });

      const executePromise = subject.execute();
      expect(runQueue).toHaveBeenCalledTimes(1);
      const suiteRunQueueArgs = runQueue.calls.mostRecent().args[0];
      runQueue.calls.reset();

      return {
        runQueue,
        currentRunableTracker,
        runableResources,
        reportDispatcher,
        suiteRunQueueArgs,
        executePromise
      };
    }
  });

  function mockReportDispatcher() {
    const reportDispatcher = jasmine.createSpyObj(
      'reportDispatcher',
      jasmineUnderTest.reporterEvents
    );

    for (const k of jasmineUnderTest.reporterEvents) {
      reportDispatcher[k].and.returnValue(Promise.resolve());
    }

    return reportDispatcher;
  }

  function mockRunableResources() {
    return jasmine.createSpyObj('runableResources', [
      'initForRunable',
      'clearForRunable'
    ]);
  }
});
