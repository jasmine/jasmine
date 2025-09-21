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
      expect(reportDispatcher.specStarted).toHaveBeenCalledWith(
        spec.startedEvent()
      );
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
      expect(reportDispatcher.specDone).toHaveBeenCalledWith(spec.doneEvent());
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
  });

  describe('Suite execution', function() {
    it('reports the duration of the suite', async function() {
      const timer = jasmine.createSpyObj('timer', ['start', 'elapsed']);
      const topSuite = new jasmineUnderTest.Suite({ id: 'topSuite' });
      const suite = new jasmineUnderTest.Suite({
        id: 'suite1',
        parentSuite: topSuite,
        timer
      });
      topSuite.addChild(suite);
      const executionTree = {
        topSuite,
        childrenOfTopSuite() {
          return [{ suite }];
        },
        childrenOfSuiteSegment() {
          return [];
        },
        isExcluded() {
          return false;
        }
      };
      const runQueue = jasmine.createSpy('runQueue');
      const reportDispatcher = mockReportDispatcher();
      const subject = new jasmineUnderTest.TreeRunner({
        executionTree,
        runQueue,
        globalErrors: mockGlobalErrors(),
        runableResources: mockRunableResources(),
        reportDispatcher,
        currentRunableTracker: new jasmineUnderTest.CurrentRunableTracker(),
        getConfig() {
          return {};
        },
        reportChildrenOfBeforeAllFailure() {}
      });

      const executePromise = subject.execute();
      expect(runQueue).toHaveBeenCalledTimes(1);
      const topSuiteRunQueueOpts = runQueue.calls.mostRecent().args[0];
      runQueue.calls.reset();
      topSuiteRunQueueOpts.queueableFns[0].fn(function() {});

      expect(runQueue).toHaveBeenCalledTimes(1);
      expect(timer.start).not.toHaveBeenCalled();
      const suiteRunQueueOpts = runQueue.calls.mostRecent().args[0];
      suiteRunQueueOpts.queueableFns[0].fn();
      expect(timer.start).toHaveBeenCalled();
      expect(timer.elapsed).not.toHaveBeenCalled();

      timer.elapsed.and.returnValue('the duration');
      suiteRunQueueOpts.onComplete();
      expect(timer.elapsed).toHaveBeenCalled();
      const result = suite.getResult();
      expect(result.duration).toEqual('the duration');
      expect(reportDispatcher.suiteDone).toHaveBeenCalledWith(result);

      await expectAsync(executePromise).toBePending();
    });

    it('returns false if a suite failed', async function() {
      const topSuite = new jasmineUnderTest.Suite({ id: 'topSuite' });
      const failingSuite = new jasmineUnderTest.Suite({
        id: 'failingSuite',
        parentSuite: topSuite
      });
      const passingSuite = new jasmineUnderTest.Suite({
        id: 'passingSuite',
        parentSuite: topSuite
      });
      const executionTree = {
        topSuite,
        childrenOfTopSuite() {
          return [{ suite: failingSuite }, { suite: passingSuite }];
        },
        childrenOfSuiteSegment() {
          return [];
        },
        isExcluded() {
          return false;
        }
      };
      const runQueue = jasmine.createSpy('runQueue');
      const reportDispatcher = mockReportDispatcher();
      const subject = new jasmineUnderTest.TreeRunner({
        executionTree,
        runQueue,
        globalErrors: mockGlobalErrors(),
        runableResources: mockRunableResources(),
        reportDispatcher,
        currentRunableTracker: new jasmineUnderTest.CurrentRunableTracker(),
        getConfig() {
          return {};
        },
        reportChildrenOfBeforeAllFailure() {}
      });

      const executePromise = subject.execute();
      expect(runQueue).toHaveBeenCalledTimes(1);
      const topSuiteRunQueueOpts = runQueue.calls.mostRecent().args[0];
      runQueue.calls.reset();
      topSuiteRunQueueOpts.queueableFns[0].fn(function() {});

      // Fail the first suite.
      expect(runQueue).toHaveBeenCalledTimes(1);
      const failingSuiteRunQueueOpts = runQueue.calls.mostRecent().args[0];
      runQueue.calls.reset();
      failingSuiteRunQueueOpts.queueableFns[0].fn();
      failingSuite.addExpectationResult(false, {});
      failingSuiteRunQueueOpts.onComplete();

      // Passing the second suite should not reset the overall result.
      topSuiteRunQueueOpts.queueableFns[1].fn(function() {});
      expect(runQueue).toHaveBeenCalledTimes(1);
      const passingSuiteRunQueueOpts = runQueue.calls.mostRecent().args[0];
      passingSuiteRunQueueOpts.queueableFns[0].fn();
      passingSuiteRunQueueOpts.onComplete();

      topSuiteRunQueueOpts.onComplete();

      const result = await executePromise;
      expect(result.hasFailures).toEqual(true);
    });

    it('reports children when there is a beforeAll failure', async function() {
      const topSuite = new jasmineUnderTest.Suite({ id: 'topSuite' });
      const suite = new jasmineUnderTest.Suite({
        id: 'suite',
        parentSuite: topSuite
      });
      suite.beforeAll({ fn() {} });
      const spec = new jasmineUnderTest.Spec({
        id: 'spec',
        parentSuite: suite,
        queueableFn: { fn() {} }
      });
      suite.addChild(spec);
      topSuite.addChild(suite);
      const executionTree = {
        topSuite,
        childrenOfTopSuite() {
          return [{ suite }];
        },
        childrenOfSuiteSegment() {
          return [{ spec }];
        },
        isExcluded() {
          return false;
        }
      };
      const runQueue = jasmine.createSpy('runQueue');
      const reportDispatcher = mockReportDispatcher();
      const reportChildrenOfBeforeAllFailure = jasmine
        .createSpy('reportChildrenOfBeforeAllFailure')
        .and.returnValue(Promise.resolve());
      const subject = new jasmineUnderTest.TreeRunner({
        executionTree,
        runQueue,
        globalErrors: mockGlobalErrors(),
        runableResources: mockRunableResources(),
        reportDispatcher,
        currentRunableTracker: new jasmineUnderTest.CurrentRunableTracker(),
        reportChildrenOfBeforeAllFailure,
        getConfig() {
          return {};
        }
      });

      const executePromise = subject.execute();
      expect(runQueue).toHaveBeenCalledTimes(1);
      const topSuiteRunQueueOpts = runQueue.calls.mostRecent().args[0];
      runQueue.calls.reset();
      topSuiteRunQueueOpts.queueableFns[0].fn(function() {});

      expect(runQueue).toHaveBeenCalledTimes(1);
      const suiteRunQueueOpts = runQueue.calls.mostRecent().args[0];
      suiteRunQueueOpts.queueableFns[0].fn();
      suite.hadBeforeAllFailure = true;
      suiteRunQueueOpts.onComplete();

      while (reportDispatcher.suiteDone.calls.count() === 0) {
        await Promise.resolve();
      }

      expect(reportDispatcher.specDone).toHaveBeenCalledBefore(
        reportDispatcher.suiteDone
      );
      await expectAsync(executePromise).toBePending();
    });

    it('throws if the wrong suite is completed', async function() {
      const topSuite = new jasmineUnderTest.Suite({ id: 'topSuite' });
      const suite = new jasmineUnderTest.Suite({
        id: 'suite',
        parentSuite: topSuite
      });
      const spec = new jasmineUnderTest.Spec({
        id: 'spec',
        parentSuite: suite,
        queueableFn: { fn() {} }
      });
      const executionTree = {
        topSuite,
        childrenOfTopSuite() {
          return [{ suite }];
        },
        childrenOfSuiteSegment() {
          return [{ spec }];
        },
        isExcluded() {
          return false;
        }
      };
      const runQueue = jasmine.createSpy('runQueue');
      const reportDispatcher = mockReportDispatcher();
      const subject = new jasmineUnderTest.TreeRunner({
        executionTree,
        runQueue,
        globalErrors: mockGlobalErrors(),
        runableResources: mockRunableResources(),
        reportDispatcher,
        currentRunableTracker: new jasmineUnderTest.CurrentRunableTracker(),
        getConfig() {
          return {};
        },
        reportChildrenOfBeforeAllFailure() {}
      });

      const executePromise = subject.execute();
      expect(runQueue).toHaveBeenCalledTimes(1);
      const topSuiteRunQueueOpts = runQueue.calls.mostRecent().args[0];
      runQueue.calls.reset();
      topSuiteRunQueueOpts.queueableFns[0].fn(function() {});

      expect(runQueue).toHaveBeenCalledTimes(1);
      const suiteRunQueueOpts = runQueue.calls.mostRecent().args[0];

      // Complete the suite without starting it
      expect(function() {
        suiteRunQueueOpts.onComplete();
      }).toThrowError('Tried to complete the wrong suite');

      await expectAsync(executePromise).toBePending();
    });
  });

  it('does not remove before and after fns from the top suite', async function() {
    const topSuite = new jasmineUnderTest.Suite({ id: 'topSuite' });
    spyOn(topSuite, 'cleanupBeforeAfter');
    const executionTree = {
      topSuite,
      childrenOfTopSuite() {
        return [];
      },
      isExcluded() {
        return false;
      }
    };
    const runQueue = jasmine.createSpy('runQueue');
    const subject = new jasmineUnderTest.TreeRunner({
      executionTree,
      runQueue,
      globalErrors: mockGlobalErrors(),
      runableResources: mockRunableResources(),
      reportDispatcher: mockReportDispatcher(),
      currentRunableTracker: new jasmineUnderTest.CurrentRunableTracker(),
      getConfig() {
        return {};
      }
    });

    const executePromise = subject.execute();
    expect(runQueue).toHaveBeenCalledTimes(1);
    const topSuiteRunQueueOpts = runQueue.calls.mostRecent().args[0];
    runQueue.calls.reset();

    for (const qfn of topSuiteRunQueueOpts.queueableFns) {
      qfn.fn();
    }
    topSuiteRunQueueOpts.onComplete();

    await expectAsync(executePromise).toBeResolved();
    expect(topSuite.cleanupBeforeAfter).not.toHaveBeenCalled();
  });

  describe('Late promise rejection handling', function() {
    it('works for specs when the detectLateRejectionHandling param is true', function() {
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

    it('works for beforeAll when the detectLateRejectionHandling param is true', async function() {
      const topSuite = new jasmineUnderTest.Suite({ id: 'topSuite' });
      const suite = new jasmineUnderTest.Suite({
        id: 'suite',
        parentSuite: topSuite
      });
      suite.beforeAll(function() {});
      const spec = new jasmineUnderTest.Spec({
        queueableFn: { fn() {} },
        parentSuite: suite
      });
      const executionTree = {
        topSuite,
        childrenOfTopSuite() {
          return [{ suite }];
        },
        childrenOfSuiteSegment() {
          return [{ spec }];
        },
        isExcluded() {
          return false;
        }
      };
      const runQueue = jasmine.createSpy('runQueue');
      const reportDispatcher = mockReportDispatcher();
      const globalErrors = mockGlobalErrors();
      const setTimeout = jasmine.createSpy('setTimeout');
      const subject = new jasmineUnderTest.TreeRunner({
        executionTree,
        runQueue,
        globalErrors,
        runableResources: mockRunableResources(),
        reportDispatcher,
        setTimeout,
        currentRunableTracker: new jasmineUnderTest.CurrentRunableTracker(),
        getConfig() {
          return { detectLateRejectionHandling: true };
        },
        reportChildrenOfBeforeAllFailure() {}
      });

      const executePromise = subject.execute();
      expect(runQueue).toHaveBeenCalledTimes(1);
      const topSuiteRunQueueOpts = runQueue.calls.mostRecent().args[0];
      runQueue.calls.reset();
      topSuiteRunQueueOpts.queueableFns[0].fn(function() {});

      expect(runQueue).toHaveBeenCalledTimes(1);
      const suiteRunQueueOpts = runQueue.calls.mostRecent().args[0];
      expect(suiteRunQueueOpts.queueableFns).toEqual([
        { fn: jasmine.any(Function) }, // onStart
        jasmine.objectContaining({ type: 'beforeAll' }),
        { fn: jasmine.any(Function) }, // detect late rejection handling
        { fn: jasmine.any(Function) } // spec
      ]);
      suiteRunQueueOpts.queueableFns[0].fn();
      const done = jasmine.createSpy('done');
      suiteRunQueueOpts.queueableFns[2].fn(done);
      expect(globalErrors.reportUnhandledRejections).not.toHaveBeenCalled();

      expect(setTimeout).toHaveBeenCalledOnceWith(jasmine.any(Function));
      setTimeout.calls.argsFor(0)[0]();
      expect(globalErrors.reportUnhandledRejections).toHaveBeenCalledBefore(
        done
      );

      await expectAsync(executePromise).toBePending();
    });

    it('works for afterAll when the detectLateRejectionHandling param is true', async function() {
      const topSuite = new jasmineUnderTest.Suite({ id: 'topSuite' });
      const suite = new jasmineUnderTest.Suite({
        id: 'suite',
        parentSuite: topSuite
      });
      suite.afterAll(function() {});
      const spec = new jasmineUnderTest.Spec({
        queueableFn: { fn() {} },
        parentSuite: suite
      });
      const executionTree = {
        topSuite,
        childrenOfTopSuite() {
          return [{ suite }];
        },
        childrenOfSuiteSegment() {
          return [{ spec }];
        },
        isExcluded() {
          return false;
        }
      };
      const runQueue = jasmine.createSpy('runQueue');
      const reportDispatcher = mockReportDispatcher();
      const globalErrors = mockGlobalErrors();
      const setTimeout = jasmine.createSpy('setTimeout');
      const subject = new jasmineUnderTest.TreeRunner({
        executionTree,
        runQueue,
        globalErrors,
        runableResources: mockRunableResources(),
        reportDispatcher,
        setTimeout,
        currentRunableTracker: new jasmineUnderTest.CurrentRunableTracker(),
        getConfig() {
          return { detectLateRejectionHandling: true };
        },
        reportChildrenOfBeforeAllFailure() {}
      });

      const executePromise = subject.execute();
      expect(runQueue).toHaveBeenCalledTimes(1);
      const topSuiteRunQueueOpts = runQueue.calls.mostRecent().args[0];
      runQueue.calls.reset();
      topSuiteRunQueueOpts.queueableFns[0].fn(function() {});

      expect(runQueue).toHaveBeenCalledTimes(1);
      const suiteRunQueueOpts = runQueue.calls.mostRecent().args[0];
      expect(suiteRunQueueOpts.queueableFns).toEqual([
        { fn: jasmine.any(Function) }, // onStart
        { fn: jasmine.any(Function) }, // spec
        jasmine.objectContaining({ type: 'afterAll' }),
        { fn: jasmine.any(Function) } // detect late rejection handling
      ]);
      suiteRunQueueOpts.queueableFns[0].fn();
      const done = jasmine.createSpy('done');
      suiteRunQueueOpts.queueableFns[3].fn(done);
      expect(globalErrors.reportUnhandledRejections).not.toHaveBeenCalled();

      expect(setTimeout).toHaveBeenCalledOnceWith(jasmine.any(Function));
      setTimeout.calls.argsFor(0)[0]();
      expect(globalErrors.reportUnhandledRejections).toHaveBeenCalledBefore(
        done
      );

      await expectAsync(executePromise).toBePending();
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
