describe('Runner', function() {
  describe('TreeProcessor nodeComplete callback', function() {
    it('throws if the wrong suite is passed to nodeComplete', async function() {
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
      await callWithNext(treeProcessorOpts.nodeStart, [suiteToRun]);

      expect(function() {
        const someOtherSuite = {};
        treeProcessorOpts.nodeComplete(someOtherSuite, {}, () => {});
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
      await callWithNext(treeProcessorOpts.nodeStart, [suiteToRun]);
      await callWithNext(treeProcessorOpts.nodeComplete, [suiteToRun, {}]);

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
      await callWithNext(treeProcessorOpts.nodeStart, [suiteToRun]);
      await callWithNext(treeProcessorOpts.nodeComplete, [
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
      await callWithNext(treeProcessorOpts.nodeStart, [suiteToRun]);
      await callWithNext(treeProcessorOpts.nodeComplete, [
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
      await callWithNext(treeProcessorOpts.nodeStart, [suiteToRun]);
      await callWithNext(treeProcessorOpts.nodeComplete, [
        suiteToRun,
        { status: 'passed' }
      ]);

      expect(subject.hasFailures).toBe(true);
    });

    describe('reporting', function() {
      it('reports the suiteDone event', async function() {
        const TreeProcessor = spyTreeProcessorCtor();
        const reporter = spyReporter();
        const subject = new jasmineUnderTest.Runner({
          ...defaultCtorOptions(),
          TreeProcessor,
          reporter
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
        await callWithNext(treeProcessorOpts.nodeStart, [suiteToRun]);
        await callWithNext(treeProcessorOpts.nodeComplete, [
          suiteToRun,
          { status: 'passed' }
        ]);

        expect(reporter.suiteDone).toHaveBeenCalled();
      });

      describe('when the suite had a beforeAll failure', function() {
        it('reports children before the suiteDone event', async function() {
          const TreeProcessor = spyTreeProcessorCtor();
          const reporter = spyReporter();
          const reportSpecDone = jasmine
            .createSpy('reportSpecDone')
            .and.callFake(function(child, result, next) {
              next();
            });
          const subject = new jasmineUnderTest.Runner({
            ...defaultCtorOptions(),
            TreeProcessor,
            reporter,
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
          await callWithNext(treeProcessorOpts.nodeStart, [suiteToRun]);

          suiteToRun.hadBeforeAllFailure = true;
          await callWithNext(treeProcessorOpts.nodeComplete, [
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
          expect(reportSpecDone).toHaveBeenCalledBefore(reporter.suiteDone);
          expect(reporter.specStarted).toHaveBeenCalledBefore(reportSpecDone);
        });
      });
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
    return jasmine.createSpyObj('reporter', {
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
      reporter: spyReporter(),
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
