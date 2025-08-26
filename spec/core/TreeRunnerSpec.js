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

    it('runs before and after fns', function() {
      const before = { fn: jasmine.createSpy('before') };
      const after = { fn: jasmine.createSpy('after') };
      const queueableFn = {
        fn: jasmine.createSpy('test body').and.callFake(function() {
          expect(before).toHaveBeenCalled();
          expect(after).not.toHaveBeenCalled();
        })
      };
      const spec = new jasmineUnderTest.Spec({
        queueableFn: queueableFn,
        beforeAndAfterFns: function() {
          return { befores: [before], afters: [after] };
        }
      });

      const { runQueue, suiteRunQueueArgs } = runSingleSpecSuite(spec);
      suiteRunQueueArgs.queueableFns[0].fn();
      expect(runQueue).toHaveBeenCalledTimes(1);
      const specRunQueueArgs = runQueue.calls.mostRecent().args[0];

      expect(specRunQueueArgs.queueableFns[1]).toEqual(before);
      expect(specRunQueueArgs.queueableFns[2]).toEqual(queueableFn);
      expect(specRunQueueArgs.queueableFns[3]).toEqual(after);
    });

    it('marks specs pending at runtime', function() {
      let spec;
      const queueableFn = {
        fn() {
          spec.pend();
        }
      };
      spec = new jasmineUnderTest.Spec({ queueableFn });

      const { runQueue, suiteRunQueueArgs } = runSingleSpecSuite(spec);
      suiteRunQueueArgs.queueableFns[0].fn();
      expect(runQueue).toHaveBeenCalledTimes(1);
      const specRunQueueArgs = runQueue.calls.mostRecent().args[0];

      expect(specRunQueueArgs.queueableFns[1]).toEqual(queueableFn);
      queueableFn.fn();

      expect(spec.status()).toEqual('pending');
      expect(spec.getResult().status).toEqual('pending');
      expect(spec.getResult().pendingReason).toEqual('');
    });

    it('marks specs pending at runtime with a message', function() {
      let spec;
      const queueableFn = {
        fn() {
          spec.pend('some reason');
        }
      };
      spec = new jasmineUnderTest.Spec({ queueableFn });

      const { runQueue, suiteRunQueueArgs } = runSingleSpecSuite(spec);
      suiteRunQueueArgs.queueableFns[0].fn();
      expect(runQueue).toHaveBeenCalledTimes(1);
      const specRunQueueArgs = runQueue.calls.mostRecent().args[0];

      expect(specRunQueueArgs.queueableFns[1]).toEqual(queueableFn);
      queueableFn.fn();

      expect(spec.status()).toEqual('pending');
      expect(spec.getResult().status).toEqual('pending');
      expect(spec.getResult().pendingReason).toEqual('some reason');
    });

    it('passes failSpecWithNoExp to Spec#executionFinished', async function() {
      const spec = new jasmineUnderTest.Spec({
        id: 'spec1',
        queueableFn: {}
      });
      spyOn(spec, 'executionFinished');
      const {
        runQueue,
        suiteRunQueueArgs,
        executePromise
      } = runSingleSpecSuite(spec, { failSpecWithNoExpectations: true });

      suiteRunQueueArgs.queueableFns[0].fn();

      expect(runQueue).toHaveBeenCalledTimes(1);
      const specRunQueueArgs = runQueue.calls.mostRecent().args[0];
      expect(specRunQueueArgs.queueableFns[1].type).toEqual('specCleanup');
      specRunQueueArgs.queueableFns[1].fn();

      expect(spec.executionFinished).toHaveBeenCalledWith(false, true);
      await expectAsync(executePromise).toBePending();
    });

    describe('Late promise rejection handling', function() {
      it('is enabled when the detectLateRejectionHandling param is true', function() {
        const before = jasmine.createSpy('before');
        const after = jasmine.createSpy('after');
        const queueableFn = {
          fn: jasmine.createSpy('test body').and.callFake(function() {
            expect(before).toHaveBeenCalled();
            expect(after).not.toHaveBeenCalled();
          })
        };
        const spec = new jasmineUnderTest.Spec({
          queueableFn,
          beforeAndAfterFns: function() {
            return { befores: [before], afters: [after] };
          }
        });

        const {
          runQueue,
          setTimeout,
          suiteRunQueueArgs,
          globalErrors
        } = runSingleSpecSuite(spec, { detectLateRejectionHandling: true });

        suiteRunQueueArgs.queueableFns[0].fn();
        expect(runQueue).toHaveBeenCalledTimes(1);
        const specRunQueueOpts = runQueue.calls.mostRecent().args[0];

        expect(specRunQueueOpts.queueableFns).toEqual([
          { fn: jasmine.any(Function) },
          before,
          queueableFn,
          after,
          { fn: jasmine.any(Function) },
          {
            fn: jasmine.any(Function),
            type: 'specCleanup'
          }
        ]);

        const done = jasmine.createSpy('done');
        specRunQueueOpts.queueableFns[4].fn(done);
        expect(globalErrors.reportUnhandledRejections).not.toHaveBeenCalled();
        expect(done).not.toHaveBeenCalled();

        expect(setTimeout).toHaveBeenCalledOnceWith(jasmine.any(Function));
        setTimeout.calls.argsFor(0)[0]();
        expect(globalErrors.reportUnhandledRejections).toHaveBeenCalled();
        expect(globalErrors.reportUnhandledRejections).toHaveBeenCalledBefore(
          done
        );
      });
    });

    function runSingleSpecSuite(spec, optionalConfig) {
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
      const globalErrors = mockGlobalErrors();
      const setTimeout = jasmine.createSpy('setTimeout');
      const currentRunableTracker = new jasmineUnderTest.CurrentRunableTracker();
      const subject = new jasmineUnderTest.TreeRunner({
        executionTree,
        runQueue,
        globalErrors,
        setTimeout,
        runableResources,
        reportDispatcher,
        currentRunableTracker,
        getConfig() {
          return optionalConfig || {};
        },
        reportChildrenOfBeforeAllFailure() {}
      });

      const executePromise = subject.execute();
      expect(runQueue).toHaveBeenCalledTimes(1);
      const suiteRunQueueArgs = runQueue.calls.mostRecent().args[0];
      runQueue.calls.reset();

      return {
        runQueue,
        globalErrors,
        setTimeout,
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

  function mockGlobalErrors() {
    return jasmine.createSpyObj('globalErrors', ['reportUnhandledRejections']);
  }
});
