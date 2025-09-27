describe('Runner', function() {
  describe('Integration with TreeProcessor and TreeRunner', function() {
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
        privateUnderTest.reporterEvents
      );

      for (const k of privateUnderTest.reporterEvents) {
        reportDispatcher[k].and.returnValue(Promise.resolve());
      }

      // Reasonable defaults, may be overridden in some cases
      failSpecWithNoExpectations = false;
      detectLateRejectionHandling = false;

      spyOn(privateUnderTest.TreeRunner.prototype, '_executeSpec');
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
      this.beforeAndAfterFns = () => ({ befores: [], afters: [] });
      this.userContext = () => ({});
      this.getFullName = () => '';
      this.queueableFn = () => {};
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
        TreeProcessor: privateUnderTest.TreeProcessor,
        runableResources: {
          initForRunable: () => {},
          clearForRunable: () => {}
        },
        reportDispatcher,
        globalErrors,
        runQueue
      };
      return new privateUnderTest.Runner({
        ...defaultOptions,
        topSuite
      });
    }

    function arrayNotContaining(item) {
      return {
        asymmetricMatch(other, matchersUtil) {
          if (!jasmine.private.isArray(other)) {
            return false;
          }

          for (const x of other) {
            if (matchersUtil.equals(x, item)) {
              return false;
            }
          }

          return true;
        }
      };
    }

    // Precondition: privateUnderTest.TreeRunner.prototype._executeSpec is a spy
    function verifyAndFinishSpec(spec, queueableFn, shouldBeExcluded) {
      const ex = privateUnderTest.TreeRunner.prototype._executeSpec;
      ex.withArgs(spec, 'onComplete').and.callThrough();

      queueableFn.fn('onComplete');
      expect(ex).toHaveBeenCalledWith(spec, 'onComplete');

      expect(runQueue).toHaveBeenCalledWith(
        jasmine.objectContaining({
          isLeaf: true,
          SkipPolicy: privateUnderTest.CompleteOnFirstErrorSkipPolicy,
          queueableFns: shouldBeExcluded
            ? arrayNotContaining(spec.queueableFn)
            : jasmine.arrayContaining([spec.queueableFn])
        })
      );
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
        SkipPolicy: privateUnderTest.SkipAfterBeforeAllErrorPolicy
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
        SkipPolicy: privateUnderTest.SkipAfterBeforeAllErrorPolicy
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
        SkipPolicy: privateUnderTest.SkipAfterBeforeAllErrorPolicy
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
      expect(
        privateUnderTest.TreeRunner.prototype._executeSpec
      ).toHaveBeenCalledWith(spec, 'foo');

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
      queueableFns[0].fn('done');

      expect(
        privateUnderTest.TreeRunner.prototype._executeSpec
      ).not.toHaveBeenCalledWith(specs[0], jasmine.anything());
      expect(
        privateUnderTest.TreeRunner.prototype._executeSpec
      ).toHaveBeenCalledWith(specs[1], 'done');

      queueableFns[1].fn('done');

      expect(
        privateUnderTest.TreeRunner.prototype._executeSpec
      ).toHaveBeenCalledWith(specs[0], 'done');

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
      queueableFns[0].fn('done');

      expect(
        privateUnderTest.TreeRunner.prototype._executeSpec
      ).not.toHaveBeenCalledWith(nonSpecified, jasmine.anything());
      expect(
        privateUnderTest.TreeRunner.prototype._executeSpec
      ).toHaveBeenCalledWith(specified, 'done');

      queueableFns[1].fn('done');

      expect(
        privateUnderTest.TreeRunner.prototype._executeSpec
      ).toHaveBeenCalledWith(nonSpecified, 'done');

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
      nodeQueueableFns[1].fn('done');
      expect(
        privateUnderTest.TreeRunner.prototype._executeSpec
      ).toHaveBeenCalledWith(nonSpecifiedSpec, 'done');

      queueableFns[1].fn('done');
      expect(
        privateUnderTest.TreeRunner.prototype._executeSpec
      ).toHaveBeenCalledWith(specifiedSpec, 'done');

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

      queueableFns[0].fn('done');
      expect(
        privateUnderTest.TreeRunner.prototype._executeSpec
      ).toHaveBeenCalledWith(spec1, 'done');

      queueableFns[1].fn();
      const childFns = runQueue.calls.mostRecent().args[0].queueableFns;
      expect(childFns.length).toBe(3);
      childFns[1].fn('done');
      expect(
        privateUnderTest.TreeRunner.prototype._executeSpec
      ).toHaveBeenCalledWith(spec2, 'done');

      childFns[2].fn('done');
      expect(
        privateUnderTest.TreeRunner.prototype._executeSpec
      ).toHaveBeenCalledWith(spec3, 'done');

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
      runQueue.calls.mostRecent().args[0].queueableFns[1].fn('done');
      expect(
        privateUnderTest.TreeRunner.prototype._executeSpec
      ).toHaveBeenCalledWith(spec1, 'done');

      queueableFns[1].fn('done');
      expect(
        privateUnderTest.TreeRunner.prototype._executeSpec
      ).toHaveBeenCalledWith(spec4, 'done');

      queueableFns[2].fn();
      expect(runQueue.calls.count()).toBe(3);
      expect(runQueue.calls.mostRecent().args[0].queueableFns.length).toBe(2);
      runQueue.calls.mostRecent().args[0].queueableFns[1].fn('done');
      expect(
        privateUnderTest.TreeRunner.prototype._executeSpec
      ).toHaveBeenCalledWith(spec2, 'done');

      queueableFns[3].fn('done');
      expect(
        privateUnderTest.TreeRunner.prototype._executeSpec
      ).toHaveBeenCalledWith(spec5, 'done');

      queueableFns[4].fn();
      expect(runQueue.calls.count()).toBe(4);
      expect(runQueue.calls.mostRecent().args[0].queueableFns.length).toBe(2);
      runQueue.calls.mostRecent().args[0].queueableFns[1].fn('done');
      expect(
        privateUnderTest.TreeRunner.prototype._executeSpec
      ).toHaveBeenCalledWith(spec3, 'done');

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

      runQueue.calls.mostRecent().args[0].queueableFns[1].fn('done');
      expect(
        privateUnderTest.TreeRunner.prototype._executeSpec
      ).toHaveBeenCalledWith(spec1, 'done');

      queueableFns[1].fn('done');
      expect(
        privateUnderTest.TreeRunner.prototype._executeSpec
      ).toHaveBeenCalledWith(spec4, 'done');

      queueableFns[2].fn();
      expect(runQueue.calls.count()).toBe(4);
      expect(runQueue.calls.mostRecent().args[0].queueableFns.length).toBe(2);

      runQueue.calls.mostRecent().args[0].queueableFns[1].fn();
      expect(runQueue.calls.count()).toBe(5);

      runQueue.calls.mostRecent().args[0].queueableFns[1].fn('done');
      expect(
        privateUnderTest.TreeRunner.prototype._executeSpec
      ).toHaveBeenCalledWith(spec2, 'done');

      queueableFns[3].fn('done');
      expect(
        privateUnderTest.TreeRunner.prototype._executeSpec
      ).toHaveBeenCalledWith(spec5, 'done');

      queueableFns[4].fn();
      expect(runQueue.calls.count()).toBe(6);
      expect(runQueue.calls.mostRecent().args[0].queueableFns.length).toBe(2);

      runQueue.calls.mostRecent().args[0].queueableFns[1].fn();
      expect(runQueue.calls.count()).toBe(7);

      runQueue.calls.mostRecent().args[0].queueableFns[1].fn('done');
      expect(
        privateUnderTest.TreeRunner.prototype._executeSpec
      ).toHaveBeenCalledWith(spec3, 'done');

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
        queueableFns[i].fn('done');
        expect(
          privateUnderTest.TreeRunner.prototype._executeSpec
        ).toHaveBeenCalledWith(specs[i], 'done');
      }

      await expectAsync(promise).toBePending();
    });
  });
});
