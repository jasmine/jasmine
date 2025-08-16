describe('Runner', function() {
  // TODO: Update and re-enable these once things stabilize
  xdescribe('TreeProcessor suiteSegmentComplete callback', function() {
    it('throws if the wrong suite is passed to suiteSegmentComplete', async function() {
      const TreeProcessor = spyTreeProcessorCtor();
      const subject = new jasmineUnderTest.Runner({
        ...defaultCtorOptions(),
        TreeProcessor
      });

      const promise = subject.execute();
      expect(TreeProcessor).toHaveBeenCalled();
      await checkImmediateRejection(promise);

      const treeProcessorOpts = TreeProcessor.calls.argsFor(0)[0];
      const suiteToRun = {
        parentSuite: stubSuite(),
        startTimer: () => {}
      };
      await callWithNext(treeProcessorOpts.suiteSegmentStart, [suiteToRun]);

      expect(function() {
        const someOtherSuite = {};
        treeProcessorOpts.suiteSegmentComplete(someOtherSuite, {}, () => {});
      }).toThrowError('Tried to complete the wrong suite');
    });

    it("ends the suite's timer", async function() {
      const TreeProcessor = spyTreeProcessorCtor();
      const subject = new jasmineUnderTest.Runner({
        ...defaultCtorOptions(),
        TreeProcessor
      });

      const promise = subject.execute();
      expect(TreeProcessor).toHaveBeenCalled();
      await checkImmediateRejection(promise);

      const treeProcessorOpts = TreeProcessor.calls.argsFor(0)[0];
      const suiteToRun = {
        parentSuite: stubSuite(),
        startTimer: () => {},
        endTimer: jasmine.createSpy('suiteToRun.endTimer')
      };
      await callWithNext(treeProcessorOpts.suiteSegmentStart, [suiteToRun]);
      await callWithNext(treeProcessorOpts.suiteSegmentComplete, [
        suiteToRun,
        {}
      ]);

      expect(suiteToRun.endTimer).toHaveBeenCalled();
    });

    it('sets hasFailures to true when the suite fails', async function() {
      const TreeProcessor = spyTreeProcessorCtor();
      const subject = new jasmineUnderTest.Runner({
        ...defaultCtorOptions(),
        TreeProcessor
      });

      const promise = subject.execute();
      expect(TreeProcessor).toHaveBeenCalled();
      await checkImmediateRejection(promise);

      const treeProcessorOpts = TreeProcessor.calls.argsFor(0)[0];
      const suiteToRun = {
        parentSuite: stubSuite(),
        startTimer: () => {},
        endTimer: jasmine.createSpy('suiteToRun.endTimer')
      };
      await callWithNext(treeProcessorOpts.suiteSegmentStart, [suiteToRun]);
      await callWithNext(treeProcessorOpts.suiteSegmentComplete, [
        suiteToRun,
        { status: 'failed' }
      ]);

      expect(subject.hasFailures).toBe(true);
    });

    it('does not set hasFailures to true when the suite passes', async function() {
      const TreeProcessor = spyTreeProcessorCtor();
      const subject = new jasmineUnderTest.Runner({
        ...defaultCtorOptions(),
        TreeProcessor
      });

      const promise = subject.execute();
      expect(TreeProcessor).toHaveBeenCalled();
      await checkImmediateRejection(promise);

      const treeProcessorOpts = TreeProcessor.calls.argsFor(0)[0];
      const suiteToRun = {
        parentSuite: stubSuite(),
        startTimer: () => {},
        endTimer: jasmine.createSpy('suiteToRun.endTimer')
      };
      await callWithNext(treeProcessorOpts.suiteSegmentStart, [suiteToRun]);
      await callWithNext(treeProcessorOpts.suiteSegmentComplete, [
        suiteToRun,
        { status: 'passed' }
      ]);

      expect(subject.hasFailures).toBe(false);
    });

    it('does not set hasFailures to false when the suite passes', async function() {
      const TreeProcessor = spyTreeProcessorCtor();
      const subject = new jasmineUnderTest.Runner({
        ...defaultCtorOptions(),
        TreeProcessor
      });

      const promise = subject.execute();
      expect(TreeProcessor).toHaveBeenCalled();
      await checkImmediateRejection(promise);

      const treeProcessorOpts = TreeProcessor.calls.argsFor(0)[0];
      subject.hasFailures = true;
      const suiteToRun = {
        parentSuite: stubSuite(),
        startTimer: () => {},
        endTimer: jasmine.createSpy('suiteToRun.endTimer')
      };
      await callWithNext(treeProcessorOpts.suiteSegmentStart, [suiteToRun]);
      await callWithNext(treeProcessorOpts.suiteSegmentComplete, [
        suiteToRun,
        { status: 'passed' }
      ]);

      expect(subject.hasFailures).toBe(true);
    });

    describe('reporting', function() {
      it('reports the suiteDone event', async function() {
        const TreeProcessor = spyTreeProcessorCtor();
        const reportDispatcher = spyReporter();
        const subject = new jasmineUnderTest.Runner({
          ...defaultCtorOptions(),
          TreeProcessor,
          reportDispatcher
        });

        const promise = subject.execute();
        expect(TreeProcessor).toHaveBeenCalled();
        await checkImmediateRejection(promise);

        const treeProcessorOpts = TreeProcessor.calls.argsFor(0)[0];
        const suiteToRun = {
          parentSuite: stubSuite(),
          startTimer: () => {},
          endTimer: jasmine.createSpy('suiteToRun.endTimer')
        };
        await callWithNext(treeProcessorOpts.suiteSegmentStart, [suiteToRun]);
        await callWithNext(treeProcessorOpts.suiteSegmentComplete, [
          suiteToRun,
          { status: 'passed' }
        ]);

        expect(reportDispatcher.suiteDone).toHaveBeenCalled();
      });

      describe('when the suite had a beforeAll failure', function() {
        it('reports children before the suiteDone event', async function() {
          const TreeProcessor = spyTreeProcessorCtor();
          const reportDispatcher = spyReporter();
          const reportSpecDone = jasmine
            .createSpy('reportSpecDone')
            .and.callFake(function(child, result, next) {
              next();
            });
          const subject = new jasmineUnderTest.Runner({
            ...defaultCtorOptions(),
            TreeProcessor,
            reportDispatcher,
            reportSpecDone
          });

          const promise = subject.execute();
          expect(TreeProcessor).toHaveBeenCalled();
          await checkImmediateRejection(promise);

          const treeProcessorOpts = TreeProcessor.calls.argsFor(0)[0];
          const suiteToRun = {
            parentSuite: stubSuite(),
            children: [
              {
                result: { description: 'a spec' },
                addExpectationResult: jasmine.createSpy('addExpectationResult')
              }
            ],
            startTimer: () => {},
            endTimer: jasmine.createSpy('suiteToRun.endTimer')
          };
          await callWithNext(treeProcessorOpts.suiteSegmentStart, [suiteToRun]);

          suiteToRun.hadBeforeAllFailure = true;
          await callWithNext(treeProcessorOpts.suiteSegmentComplete, [
            suiteToRun,
            { status: 'passed' }
          ]);

          expect(
            suiteToRun.children[0].addExpectationResult
          ).toHaveBeenCalledWith(
            false,
            {
              passed: false,
              message:
                'Not run because a beforeAll function failed. The beforeAll failure will be reported on the suite that caused it.'
            },
            true
          );
          expect(
            suiteToRun.children[0].addExpectationResult
          ).toHaveBeenCalledBefore(reportSpecDone);
          expect(reportSpecDone).toHaveBeenCalledBefore(
            reportDispatcher.suiteDone
          );
          expect(reportDispatcher.specStarted).toHaveBeenCalledBefore(
            reportSpecDone
          );
        });
      });
    });
  });

  describe('Integration with TreeProcessor', function() {
    let suiteNumber,
      specNumber,
      runQueue,
      globalErrors,
      reportDispatcher,
      failSpecWithNoExpectations,
      detectLateRejectionHandling;

    beforeEach(function() {
      suiteNumber = 0;
      specNumber = 0;
      runQueue = jasmine.createSpy('runQueue');
      globalErrors = 'the global errors instance';
      reportDispatcher = jasmine.createSpyObj(
        'reportDispatcher',
        jasmineUnderTest.reporterEvents
      );

      for (const k of jasmineUnderTest.reporterEvents) {
        reportDispatcher[k].and.returnValue(Promise.resolve());
      }

      // Reasonable defaults, may be overridden in some cases
      failSpecWithNoExpectations = false;
      detectLateRejectionHandling = false;
    });

    function StubSuite(attrs) {
      attrs = attrs || {};
      this.id = 'suite' + suiteNumber++;
      this.children = attrs.children || [];
      this.canBeReentered = function() {
        return !attrs.noReenter;
      };
      this.markedPending = attrs.markedPending || false;
      this.sharedUserContext = function() {
        return attrs.userContext || {};
      };
      this.result = {
        id: this.id,
        failedExpectations: []
      };
      this.getResult = jasmine.createSpy('getResult');
      this.beforeAllFns = attrs.beforeAllFns || [];
      this.afterAllFns = attrs.afterAllFns || [];
      this.cleanupBeforeAfter = function() {};
      this.startTimer = function() {};
      this.endTimer = function() {};
    }

    function StubSpec(attrs) {
      attrs = attrs || {};
      this.id = 'spec' + specNumber++;
      this.markedPending = attrs.markedPending || false;
      this.execute = jasmine.createSpy(this.id + '#execute');
    }

    function makeRunner(topSuite) {
      const defaultOptions = {
        getConfig: () => ({
          specFilter: () => true,
          failSpecWithNoExpectations,
          detectLateRejectionHandling
        }),
        focusedRunables: () => [],
        totalSpecsDefined: () => 1,
        TreeProcessor: jasmineUnderTest.TreeProcessor,
        runableResources: {
          initForRunable: () => {},
          clearForRunable: () => {}
        },
        reportDispatcher,
        globalErrors,
        runQueue
      };
      return new jasmineUnderTest.Runner({
        ...defaultOptions,
        topSuite
      });
    }

    function verifyAndFinishSpec(spec, queueableFn, shouldBeExcluded) {
      queueableFn.fn('onComplete');
      expect(spec.execute).toHaveBeenCalledWith(
        jasmine.any(Function),
        globalErrors,
        'onComplete',
        shouldBeExcluded,
        failSpecWithNoExpectations,
        detectLateRejectionHandling
      );
      spec.execute.calls.mostRecent().args[0]({ for: spec.id, isLeaf: true });
      expect(runQueue).toHaveBeenCalledWith({
        for: spec.id,
        isLeaf: true,
        SkipPolicy: jasmineUnderTest.CompleteOnFirstErrorSkipPolicy
      });
    }

    it('runs a single spec', async function() {
      const spec = new StubSpec();
      const topSuite = new StubSuite({
        children: [spec],
        userContext: { root: 'context' }
      });
      detectLateRejectionHandling = true;
      const subject = makeRunner(topSuite);

      const promise = subject.execute();
      await Promise.resolve();

      expect(runQueue).toHaveBeenCalledWith({
        onComplete: jasmine.any(Function),
        onException: jasmine.any(Function),
        userContext: { root: 'context' },
        queueableFns: [{ fn: jasmine.any(Function) }],
        onMultipleDone: null,
        SkipPolicy: jasmineUnderTest.SkipAfterBeforeAllErrorPolicy
      });

      const runQueueArgs = runQueue.calls.mostRecent().args[0];
      verifyAndFinishSpec(spec, runQueueArgs.queueableFns[0], false);
      runQueueArgs.onComplete();
      await promise;
    });

    it('runs an empty suite', async function() {
      const suite = new StubSuite({ userContext: { for: 'suite' } });
      const topSuite = new StubSuite({
        children: [suite],
        userContext: { for: 'topSuite' }
      });
      suite.parentSuite = topSuite;
      const subject = makeRunner(topSuite);

      const promise = subject.execute();
      await Promise.resolve();

      expect(runQueue).toHaveBeenCalledWith({
        onComplete: jasmine.any(Function),
        onException: jasmine.any(Function),
        userContext: { for: 'topSuite' },
        queueableFns: [{ fn: jasmine.any(Function) }],
        onMultipleDone: null,
        SkipPolicy: jasmineUnderTest.SkipAfterBeforeAllErrorPolicy
      });

      const runQueueArgs = runQueue.calls.mostRecent().args[0];
      const nodeDone = jasmine.createSpy('nodeDone');
      runQueueArgs.queueableFns[0].fn(nodeDone);
      expect(runQueue).toHaveBeenCalledWith({
        onComplete: jasmine.any(Function),
        onMultipleDone: null,
        queueableFns: [{ fn: jasmine.any(Function) }],
        userContext: { for: 'suite' },
        onException: jasmine.any(Function),
        onMultipleDone: null,
        SkipPolicy: jasmineUnderTest.SkipAfterBeforeAllErrorPolicy
      });

      runQueue.calls.mostRecent().args[0].queueableFns[0].fn('foo');
      expect(reportDispatcher.suiteStarted).toHaveBeenCalledWith(suite.result);

      suite.getResult.and.returnValue({ my: 'result' });

      runQueue.calls.mostRecent().args[0].onComplete();
      expect(reportDispatcher.suiteDone).toHaveBeenCalledWith({ my: 'result' });

      runQueueArgs.onComplete();
      await promise;
    });

    it('runs a non-empty suite', async function() {
      const spec1 = new StubSpec();
      const spec2 = new StubSpec();
      const suite = new StubSuite({ children: [spec1, spec2] });
      const topSuite = new StubSuite({ children: [suite] });
      const subject = makeRunner(topSuite);

      const promise = subject.execute();
      await Promise.resolve();
      expect(runQueue).toHaveBeenCalledTimes(1);
      let queueableFns = runQueue.calls.mostRecent().args[0].queueableFns;
      queueableFns[0].fn(function() {});

      expect(runQueue).toHaveBeenCalledTimes(2);
      queueableFns = runQueue.calls.mostRecent().args[0].queueableFns;
      expect(queueableFns.length).toBe(3);

      verifyAndFinishSpec(spec1, queueableFns[1], false);
      verifyAndFinishSpec(spec2, queueableFns[2], false);
      await expectAsync(promise).toBePending();
    });

    it('"runs" an excluded suite', async function() {
      const spec = new StubSpec();
      const parent = new StubSuite({ children: [spec] });
      const topSuite = new StubSuite({ children: [parent] });
      parent.parentSuite = topSuite;
      const subject = makeRunner(topSuite);

      // Empty list of runable IDs excludes everything
      const promise = subject.execute([]);
      await Promise.resolve();
      expect(runQueue).toHaveBeenCalledTimes(1);
      let queueableFns = runQueue.calls.mostRecent().args[0].queueableFns;
      queueableFns[0].fn(function() {});

      queueableFns = runQueue.calls.mostRecent().args[0].queueableFns;
      expect(queueableFns.length).toBe(2);

      queueableFns[0].fn();
      expect(reportDispatcher.suiteStarted).toHaveBeenCalledWith(parent.result);

      verifyAndFinishSpec(spec, queueableFns[1], true);

      parent.getResult.and.returnValue(parent.result);
      runQueue.calls.argsFor(1)[0].onComplete();
      expect(reportDispatcher.suiteDone).toHaveBeenCalledWith(parent.result);
      await expectAsync(promise).toBePending();
    });

    it('handles the failSpecWithNoExpectations option', async function() {
      failSpecWithNoExpectations = true;
      const spec = new StubSpec();
      const parent = new StubSuite({ children: [spec] });
      const topSuite = new StubSuite({ children: [parent] });
      parent.parentSuite = topSuite;
      const subject = makeRunner(topSuite);

      const promise = subject.execute();
      await Promise.resolve();
      expect(runQueue).toHaveBeenCalledTimes(1);
      let queueableFns = runQueue.calls.mostRecent().args[0].queueableFns;
      queueableFns[0].fn(function() {});

      queueableFns = runQueue.calls.mostRecent().args[0].queueableFns;
      expect(queueableFns.length).toBe(2);

      queueableFns[1].fn('foo');
      expect(spec.execute).toHaveBeenCalledWith(
        jasmine.any(Function),
        globalErrors,
        'foo',
        false,
        true,
        detectLateRejectionHandling
      );

      await expectAsync(promise).toBePending();
    });

    it('runs beforeAlls and afterAlls for a suite with children', async function() {
      const spec = new StubSpec();
      const target = new StubSuite({
        children: [spec],
        beforeAllFns: [
          { fn: 'beforeAll1', timeout: 1 },
          { fn: 'beforeAll2', timeout: 2 }
        ],
        afterAllFns: [
          { fn: 'afterAll1', timeout: 3 },
          { fn: 'afterAll2', timeout: 4 }
        ]
      });
      const topSuite = new StubSuite({ children: [target] });
      const subject = makeRunner(topSuite);

      const promise = subject.execute();
      await Promise.resolve();
      expect(runQueue).toHaveBeenCalledTimes(1);
      const queueableFns = runQueue.calls.mostRecent().args[0].queueableFns;
      queueableFns[0].fn(function() {});

      expect(runQueue.calls.mostRecent().args[0].queueableFns).toEqual([
        { fn: jasmine.any(Function) },
        { fn: 'beforeAll1', timeout: 1 },
        { fn: 'beforeAll2', timeout: 2 },
        { fn: jasmine.any(Function) },
        { fn: 'afterAll1', timeout: 3 },
        { fn: 'afterAll2', timeout: 4 }
      ]);

      await expectAsync(promise).toBePending();
    });

    it('does not run beforeAlls or afterAlls for a suite with no children', async function() {
      const target = new StubSuite({
        beforeAllFns: [{ fn: 'before' }],
        afterAllFns: [{ fn: 'after' }]
      });
      const topSuite = new StubSuite({ children: [target] });
      const subject = makeRunner(topSuite);

      const promise = subject.execute();
      await Promise.resolve();
      expect(runQueue).toHaveBeenCalledTimes(1);
      const queueableFns = runQueue.calls.mostRecent().args[0].queueableFns;
      queueableFns[0].fn(function() {});

      expect(runQueue.calls.mostRecent().args[0].queueableFns.length).toEqual(
        1
      );

      await expectAsync(promise).toBePending();
    });

    it('does not run beforeAlls or afterAlls for a suite with only pending children', async function() {
      const spec = new StubSpec({ markedPending: true });
      const target = new StubSuite({
        children: [spec],
        beforeAllFns: [{ fn: 'before' }],
        afterAllFns: [{ fn: 'after' }]
      });
      const topSuite = new StubSuite({ children: [target] });
      const subject = makeRunner(topSuite);

      const promise = subject.execute();
      await Promise.resolve();
      expect(runQueue).toHaveBeenCalledTimes(1);
      const queueableFns = runQueue.calls.mostRecent().args[0].queueableFns;
      queueableFns[0].fn(function() {});

      expect(runQueue.calls.mostRecent().args[0].queueableFns.length).toEqual(
        2
      );

      await expectAsync(promise).toBePending();
    });

    it('runs specs in the order specified', async function() {
      const specs = [new StubSpec(), new StubSpec()];
      const topSuite = new StubSuite({ children: specs });
      const subject = makeRunner(topSuite);

      const promise = subject.execute([specs[1].id, specs[0].id]);
      await Promise.resolve();
      expect(runQueue).toHaveBeenCalledTimes(1);
      const queueableFns = runQueue.calls.mostRecent().args[0].queueableFns;
      queueableFns[0].fn();

      expect(specs[0].execute).not.toHaveBeenCalled();
      expect(specs[1].execute).toHaveBeenCalled();

      queueableFns[1].fn();

      expect(specs[0].execute).toHaveBeenCalled();

      await expectAsync(promise).toBePending();
    });

    it('runs specified specs before non-specified specs within a suite', async function() {
      const specified = new StubSpec();
      const nonSpecified = new StubSpec();
      const topSuite = new StubSuite({ children: [nonSpecified, specified] });
      const subject = makeRunner(topSuite);

      const promise = subject.execute([specified.id]);
      await Promise.resolve();
      expect(runQueue).toHaveBeenCalledTimes(1);
      const queueableFns = runQueue.calls.mostRecent().args[0].queueableFns;
      queueableFns[0].fn();

      expect(nonSpecified.execute).not.toHaveBeenCalled();
      expect(specified.execute).toHaveBeenCalledWith(
        jasmine.any(Function),
        globalErrors,
        undefined,
        false,
        false,
        detectLateRejectionHandling
      );

      queueableFns[1].fn();

      expect(nonSpecified.execute).toHaveBeenCalledWith(
        jasmine.any(Function),
        globalErrors,
        undefined,
        true,
        false,
        detectLateRejectionHandling
      );

      await expectAsync(promise).toBePending();
    });

    it('runs suites and specs with a specified order', async function() {
      const specifiedSpec = new StubSpec();
      const nonSpecifiedSpec = new StubSpec();
      const specifiedSuite = new StubSuite({ children: [nonSpecifiedSpec] });
      const topSuite = new StubSuite({
        children: [specifiedSpec, specifiedSuite]
      });
      const subject = makeRunner(topSuite);

      const promise = subject.execute([specifiedSuite.id, specifiedSpec.id]);
      await Promise.resolve();
      expect(runQueue).toHaveBeenCalledTimes(1);
      const queueableFns = runQueue.calls.mostRecent().args[0].queueableFns;
      queueableFns[0].fn();

      expect(specifiedSpec.execute).not.toHaveBeenCalled();
      const nodeQueueableFns = runQueue.calls.mostRecent().args[0].queueableFns;
      nodeQueueableFns[1].fn();
      expect(nonSpecifiedSpec.execute).toHaveBeenCalled();

      queueableFns[1].fn();
      expect(specifiedSpec.execute).toHaveBeenCalled();

      await expectAsync(promise).toBePending();
    });

    it('runs suites and specs in the order they were declared', async function() {
      const spec1 = new StubSpec();
      const spec2 = new StubSpec();
      const spec3 = new StubSpec();
      const parent = new StubSuite({ children: [spec2, spec3] });
      const topSuite = new StubSuite({ children: [spec1, parent] });
      const subject = makeRunner(topSuite);

      const promise = subject.execute();
      await Promise.resolve();
      expect(runQueue).toHaveBeenCalledTimes(1);
      const queueableFns = runQueue.calls.mostRecent().args[0].queueableFns;
      expect(queueableFns.length).toBe(2);

      queueableFns[0].fn();
      expect(spec1.execute).toHaveBeenCalled();

      queueableFns[1].fn();
      const childFns = runQueue.calls.mostRecent().args[0].queueableFns;
      expect(childFns.length).toBe(3);
      childFns[1].fn();
      expect(spec2.execute).toHaveBeenCalled();

      childFns[2].fn();
      expect(spec3.execute).toHaveBeenCalled();

      await expectAsync(promise).toBePending();
    });

    it('runs a suite multiple times if the order specified leaves and re-enters it', async function() {
      const spec1 = new StubSpec();
      const spec2 = new StubSpec();
      const spec3 = new StubSpec();
      const spec4 = new StubSpec();
      const spec5 = new StubSpec();
      const reentered = new StubSuite({ children: [spec1, spec2, spec3] });
      const topSuite = new StubSuite({ children: [reentered, spec4, spec5] });
      const subject = makeRunner(topSuite);

      spyOn(jasmineUnderTest.getEnv(), 'deprecated');
      const promise = subject.execute([
        spec1.id,
        spec4.id,
        spec2.id,
        spec5.id,
        spec3.id
      ]);
      await Promise.resolve();
      expect(runQueue).toHaveBeenCalledTimes(1);
      const queueableFns = runQueue.calls.mostRecent().args[0].queueableFns;

      queueableFns[0].fn();
      expect(runQueue.calls.mostRecent().args[0].queueableFns.length).toBe(2);
      runQueue.calls.mostRecent().args[0].queueableFns[1].fn();
      expect(spec1.execute).toHaveBeenCalled();

      queueableFns[1].fn();
      expect(spec4.execute).toHaveBeenCalled();

      queueableFns[2].fn();
      expect(runQueue.calls.count()).toBe(3);
      expect(runQueue.calls.mostRecent().args[0].queueableFns.length).toBe(2);
      runQueue.calls.mostRecent().args[0].queueableFns[1].fn();
      expect(spec2.execute).toHaveBeenCalled();

      queueableFns[3].fn();
      expect(spec5.execute).toHaveBeenCalled();

      queueableFns[4].fn();
      expect(runQueue.calls.count()).toBe(4);
      expect(runQueue.calls.mostRecent().args[0].queueableFns.length).toBe(2);
      runQueue.calls.mostRecent().args[0].queueableFns[1].fn();
      expect(spec3.execute).toHaveBeenCalled();

      await expectAsync(promise).toBePending();
    });

    it('runs a parent of a suite with multiple segments correctly', async function() {
      const spec1 = new StubSpec();
      const spec2 = new StubSpec();
      const spec3 = new StubSpec();
      const spec4 = new StubSpec();
      const spec5 = new StubSpec();
      const parent = new StubSuite({ children: [spec1, spec2, spec3] });
      const grandparent = new StubSuite({ children: [parent] });
      const topSuite = new StubSuite({ children: [grandparent, spec4, spec5] });
      const subject = makeRunner(topSuite);

      spyOn(jasmineUnderTest.getEnv(), 'deprecated');
      const promise = subject.execute([
        spec1.id,
        spec4.id,
        spec2.id,
        spec5.id,
        spec3.id
      ]);
      await Promise.resolve();
      expect(runQueue).toHaveBeenCalledTimes(1);
      const queueableFns = runQueue.calls.mostRecent().args[0].queueableFns;
      expect(queueableFns.length).toBe(5);

      queueableFns[0].fn();
      expect(runQueue.calls.count()).toBe(2);
      expect(runQueue.calls.mostRecent().args[0].queueableFns.length).toBe(2);

      runQueue.calls.mostRecent().args[0].queueableFns[1].fn();
      expect(runQueue.calls.count()).toBe(3);

      runQueue.calls.mostRecent().args[0].queueableFns[1].fn();
      expect(spec1.execute).toHaveBeenCalled();

      queueableFns[1].fn();
      expect(spec4.execute).toHaveBeenCalled();

      queueableFns[2].fn();
      expect(runQueue.calls.count()).toBe(4);
      expect(runQueue.calls.mostRecent().args[0].queueableFns.length).toBe(2);

      runQueue.calls.mostRecent().args[0].queueableFns[1].fn();
      expect(runQueue.calls.count()).toBe(5);

      runQueue.calls.mostRecent().args[0].queueableFns[1].fn();
      expect(spec2.execute).toHaveBeenCalled();

      queueableFns[3].fn();
      expect(spec5.execute).toHaveBeenCalled();

      queueableFns[4].fn();
      expect(runQueue.calls.count()).toBe(6);
      expect(runQueue.calls.mostRecent().args[0].queueableFns.length).toBe(2);

      runQueue.calls.mostRecent().args[0].queueableFns[1].fn();
      expect(runQueue.calls.count()).toBe(7);

      runQueue.calls.mostRecent().args[0].queueableFns[1].fn();
      expect(spec3.execute).toHaveBeenCalled();

      await expectAsync(promise).toBePending();
    });

    it('runs large segments of nodes in the order they were declared', async function() {
      const specs = [];

      for (let i = 0; i < 11; i++) {
        specs.push(new StubSpec());
      }

      const topSuite = new StubSuite({ children: specs });
      const subject = makeRunner(topSuite);

      const promise = subject.execute();
      await Promise.resolve();
      expect(runQueue).toHaveBeenCalledTimes(1);
      const queueableFns = runQueue.calls.mostRecent().args[0].queueableFns;
      expect(queueableFns.length).toBe(11);

      for (let i = 0; i < 11; i++) {
        queueableFns[i].fn();
        expect(specs[i].execute).toHaveBeenCalled();
      }

      await expectAsync(promise).toBePending();
    });
  });

  async function callWithNext(fn, args) {
    let next;
    const nextPromise = new Promise(function(resolve) {
      next = resolve;
    });
    fn.apply(null, [...args, next]);
    await nextPromise;
  }

  // Check whether promise has already been rejected
  async function checkImmediateRejection(promise) {
    await Promise.race([promise, Promise.resolve()]);
  }

  function spyTreeProcessorCtor() {
    return jasmine.createSpy('TreeProcessor ctor').and.returnValue({
      execute: () => {},
      processTree: () => ({ valid: true })
    });
  }

  function spyReporter() {
    return jasmine.createSpyObj('reportDispatcher', {
      jasmineStarted: Promise.resolve(),
      jasmineDone: Promise.resolve(),
      suiteStarted: Promise.resolve(),
      suiteDone: Promise.resolve(),
      specStarted: Promise.resolve(),
      specDone: Promise.resolve()
    });
  }

  function defaultCtorOptions() {
    return {
      topSuite: stubSuite(),
      runableResources: {
        initForRunable: () => {},
        clearForRunable: () => {}
      },
      reportDispatcher: spyReporter(),
      focusedRunables: () => [],
      getConfig: () => ({}),
      totalSpecsDefined: () => 1
    };
  }

  function stubSuite() {
    return {
      result: {
        failedExpectations: []
      }
    };
  }
});
