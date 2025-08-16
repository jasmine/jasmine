describe('TreeProcessor', function() {
  let nodeNumber = 0,
    leafNumber = 0;

  function Node(attrs) {
    attrs = attrs || {};
    this.id = 'node' + nodeNumber++;
    this.children = attrs.children || [];
    this.canBeReentered = function() {
      return !attrs.noReenter;
    };
    this.markedPending = attrs.markedPending || false;
    this.sharedUserContext = function() {
      return attrs.userContext || {};
    };
    this.getResult = jasmine.createSpy(this.id + '#execute');
    this.beforeAllFns = attrs.beforeAllFns || [];
    this.afterAllFns = attrs.afterAllFns || [];
    this.cleanupBeforeAfter = function() {};
  }

  function Leaf(attrs) {
    attrs = attrs || {};
    this.id = 'leaf' + leafNumber++;
    this.markedPending = attrs.markedPending || false;
    this.execute = jasmine.createSpy(this.id + '#execute');
  }

  it('processes a single leaf', function() {
    const leaf = new Leaf(),
      processor = new jasmineUnderTest.TreeProcessor({
        tree: leaf,
        runnableIds: [leaf.id]
      });

    processor.processTree();

    expect(processor.isExcluded(leaf)).toEqual(false);
  });

  it('processes a single pending leaf', function() {
    const leaf = new Leaf({ markedPending: true }),
      processor = new jasmineUnderTest.TreeProcessor({
        tree: leaf,
        runnableIds: [leaf.id]
      });

    processor.processTree();

    expect(processor.isExcluded(leaf)).toEqual(false);
  });

  it('processes a single non-specified leaf', function() {
    const leaf = new Leaf(),
      processor = new jasmineUnderTest.TreeProcessor({
        tree: leaf,
        runnableIds: []
      });

    processor.processTree();

    expect(processor.isExcluded(leaf)).toEqual(true);
  });

  it('processes a single excluded leaf', function() {
    const leaf = new Leaf(),
      processor = new jasmineUnderTest.TreeProcessor({
        tree: leaf,
        runnableIds: [leaf.id],
        excludeNode: function() {
          return true;
        }
      });

    processor.processTree();

    expect(processor.isExcluded(leaf)).toEqual(true);
  });

  it('processes a tree with a single leaf with the root specified', function() {
    const leaf = new Leaf(),
      parent = new Node({ children: [leaf] }),
      processor = new jasmineUnderTest.TreeProcessor({
        tree: parent,
        runnableIds: [parent.id]
      });

    processor.processTree();

    expect(processor.isExcluded(parent)).toEqual(false);
    expect(processor.childrenOfTopSuite()).toEqual([{ spec: leaf }]);
    expect(processor.isExcluded(leaf)).toEqual(false);
  });

  it('processes a tree with a single pending leaf, with the root specified', function() {
    const leaf = new Leaf({ markedPending: true }),
      parent = new Node({ children: [leaf] }),
      processor = new jasmineUnderTest.TreeProcessor({
        tree: parent,
        runnableIds: [parent.id]
      });

    processor.processTree();

    expect(processor.isExcluded(parent)).toEqual(true);
    expect(processor.childrenOfTopSuite()).toEqual([{ spec: leaf }]);
    expect(processor.isExcluded(leaf)).toEqual(false);
  });

  it('processes a complicated tree with the root specified', function() {
    const pendingLeaf = new Leaf({ markedPending: true }),
      executableLeaf = new Leaf({ markedPending: false }),
      parent = new Node({ children: [pendingLeaf, executableLeaf] }),
      childless = new Node(),
      childOfPending = new Leaf({ markedPending: true }),
      pendingNode = new Node({
        markedPending: true,
        children: [childOfPending]
      }),
      parentOfPendings = new Node({
        markedPending: false,
        children: [childless, pendingNode]
      }),
      root = new Node({ children: [parent, parentOfPendings] }),
      processor = new jasmineUnderTest.TreeProcessor({
        tree: root,
        runnableIds: [root.id]
      });

    processor.processTree();

    expect(processor.isExcluded(parent)).toEqual(false);
    expect(processor.childrenOfTopSuite()).toEqual([
      { suite: parent, segmentNumber: 0 },
      { suite: parentOfPendings, segmentNumber: 0 }
    ]);

    expect(processor.isExcluded(parentOfPendings)).toEqual(true);
    expect(processor.childrenOfSuiteSegment(parentOfPendings, 0)).toEqual([
      { suite: childless, segmentNumber: 0 },
      { suite: pendingNode, segmentNumber: 0 }
    ]);

    expect(processor.isExcluded(childless)).toEqual(true);
    expect(processor.childrenOfSuiteSegment(childless, 0)).toEqual([]);

    expect(processor.isExcluded(pendingLeaf)).toEqual(false);
    expect(processor.isExcluded(executableLeaf)).toEqual(false);

    expect(processor.isExcluded(parent)).toEqual(false);
    expect(processor.childrenOfSuiteSegment(parent, 0)).toEqual([
      { spec: pendingLeaf },
      { spec: executableLeaf }
    ]);

    expect(processor.isExcluded(pendingNode)).toEqual(true);
    expect(processor.childrenOfSuiteSegment(pendingNode, 0)).toEqual([
      { spec: childOfPending }
    ]);

    expect(processor.isExcluded(childOfPending)).toEqual(false);
  });

  it('throws if the specified order would re-enter a node that does not allow re-entry', function() {
    const leaf1 = new Leaf(),
      leaf2 = new Leaf(),
      leaf3 = new Leaf(),
      reentered = new Node({ noReenter: true, children: [leaf1, leaf2] }),
      root = new Node({ children: [reentered, leaf3] }),
      processor = new jasmineUnderTest.TreeProcessor({
        tree: root,
        runnableIds: [leaf1.id, leaf3.id, leaf2.id]
      });

    expect(function() {
      processor.processTree();
    }).toThrowError(
      'Invalid order: would cause a beforeAll or afterAll to be run multiple times'
    );
  });

  it('does not throw if a node being re-entered allows re-entry', function() {
    const leaf1 = new Leaf();
    const leaf2 = new Leaf();
    const leaf3 = new Leaf();
    const reentered = new Node({ children: [leaf1, leaf2] });
    const root = new Node({ children: [reentered, leaf3] });
    const processor = new jasmineUnderTest.TreeProcessor({
      tree: root,
      runnableIds: [leaf1.id, leaf3.id, leaf2.id]
    });
    const env = jasmineUnderTest.getEnv();
    spyOn(env, 'deprecated');

    processor.processTree();

    expect(env.deprecated).toHaveBeenCalledWith(
      'The specified spec/suite order splits up a suite, running unrelated specs in the middle of it. This will become an error in a future release.'
    );
  });

  it("does not throw if a node which can't be re-entered is only entered once", function() {
    const leaf1 = new Leaf(),
      leaf2 = new Leaf(),
      leaf3 = new Leaf(),
      noReentry = new Node({ noReenter: true }),
      root = new Node({ children: [noReentry] }),
      processor = new jasmineUnderTest.TreeProcessor({
        tree: root,
        runnableIds: [leaf2.id, leaf1.id, leaf3.id]
      });

    processor.processTree();
  });

  it("does not throw if a node which can't be re-entered is run directly", function() {
    const noReentry = new Node({ noReenter: true }),
      root = new Node({ children: [noReentry] }),
      processor = new jasmineUnderTest.TreeProcessor({
        tree: root,
        runnableIds: [root.id]
      });

    processor.processTree();
  });

  // TODO: Replace these with corresponding unit tests elsewhere, once things stabilize
  xdescribe('#execute', function() {
    it('runs a single leaf', async function() {
      const leaf = new Leaf();
      const node = new Node({
        children: [leaf],
        userContext: { root: 'context' }
      });
      const runQueue = jasmine.createSpy('runQueue');
      const globalErrors = 'the globalErrors instance';
      const detectLateRejectionHandling = true;
      const processor = new jasmineUnderTest.TreeProcessor({
        tree: node,
        runnableIds: [leaf.id],
        runQueue,
        globalErrors,
        detectLateRejectionHandling
      });

      const promise = processor.execute();

      expect(runQueue).toHaveBeenCalledWith({
        onComplete: jasmine.any(Function),
        onException: jasmine.any(Function),
        userContext: { root: 'context' },
        queueableFns: [{ fn: jasmine.any(Function) }],
        onMultipleDone: null
      });

      const runQueueArgs = runQueue.calls.mostRecent().args[0];
      runQueueArgs.queueableFns[0].fn('foo');
      expect(leaf.execute).toHaveBeenCalledWith(
        runQueue,
        globalErrors,
        'foo',
        false,
        false,
        detectLateRejectionHandling
      );

      runQueueArgs.onComplete();
      await expectAsync(promise).toBeResolvedTo(undefined);
    });

    it('runs a node with no children', async function() {
      const node = new Node({ userContext: { node: 'context' } }),
        root = new Node({ children: [node], userContext: { root: 'context' } }),
        nodeStart = jasmine.createSpy('nodeStart'),
        nodeComplete = jasmine.createSpy('nodeComplete'),
        runQueue = jasmine.createSpy('runQueue'),
        processor = new jasmineUnderTest.TreeProcessor({
          tree: root,
          runnableIds: [node.id],
          nodeStart: nodeStart,
          nodeComplete: nodeComplete,
          runQueue
        }),
        nodeDone = jasmine.createSpy('nodeDone');

      const promise = processor.execute();

      expect(runQueue).toHaveBeenCalledWith({
        onComplete: jasmine.any(Function),
        onException: jasmine.any(Function),
        userContext: { root: 'context' },
        queueableFns: [{ fn: jasmine.any(Function) }],
        onMultipleDone: null
      });

      const runQueueArgs = runQueue.calls.mostRecent().args[0];
      runQueueArgs.queueableFns[0].fn(nodeDone);
      expect(runQueue).toHaveBeenCalledWith({
        onComplete: jasmine.any(Function),
        onMultipleDone: null,
        queueableFns: [{ fn: jasmine.any(Function) }],
        userContext: { node: 'context' },
        onException: jasmine.any(Function),
        onMultipleDone: null
      });

      runQueue.calls.mostRecent().args[0].queueableFns[0].fn('foo');
      expect(nodeStart).toHaveBeenCalledWith(node, 'foo');

      node.getResult.and.returnValue({ my: 'result' });

      runQueue.calls.mostRecent().args[0].onComplete();
      expect(nodeComplete).toHaveBeenCalledWith(
        node,
        { my: 'result' },
        jasmine.any(Function)
      );

      runQueueArgs.onComplete();
      await expectAsync(promise).toBeResolvedTo(undefined);
    });

    it('runs a node with children', function() {
      const leaf1 = new Leaf();
      const leaf2 = new Leaf();
      const node = new Node({ children: [leaf1, leaf2] });
      const root = new Node({ children: [node] });
      const runQueue = jasmine.createSpy('runQueue');
      const globalErrors = 'the globalErrors instance';
      const detectLateRejectionHandling = false;
      const processor = new jasmineUnderTest.TreeProcessor({
        tree: root,
        runnableIds: [node.id],
        runQueue,
        globalErrors,
        detectLateRejectionHandling
      });
      const treeComplete = jasmine.createSpy('treeComplete');
      const nodeDone = jasmine.createSpy('nodeDone');

      processor.execute(treeComplete);
      let queueableFns = runQueue.calls.mostRecent().args[0].queueableFns;
      queueableFns[0].fn(nodeDone);

      queueableFns = runQueue.calls.mostRecent().args[0].queueableFns;
      expect(queueableFns.length).toBe(3);

      queueableFns[1].fn('foo');
      expect(leaf1.execute).toHaveBeenCalledWith(
        runQueue,
        globalErrors,
        'foo',
        false,
        false,
        detectLateRejectionHandling
      );

      queueableFns[2].fn('bar');
      expect(leaf2.execute).toHaveBeenCalledWith(
        runQueue,
        globalErrors,
        'bar',
        false,
        false,
        detectLateRejectionHandling
      );
    });

    it('cascades errors up the tree', function() {
      const leaf = new Leaf();
      const node = new Node({ children: [leaf] });
      const root = new Node({ children: [node] });
      const runQueue = jasmine.createSpy('runQueue');
      const globalErrors = 'the globalErrors instance';
      const detectLateRejectionHandling = false;
      const nodeComplete = jasmine.createSpy('nodeComplete');
      const processor = new jasmineUnderTest.TreeProcessor({
        tree: root,
        runnableIds: [node.id],
        nodeComplete: nodeComplete,
        runQueue,
        globalErrors,
        detectLateRejectionHandling
      });
      const treeComplete = jasmine.createSpy('treeComplete');
      const nodeDone = jasmine.createSpy('nodeDone');

      processor.execute(treeComplete);
      let queueableFns = runQueue.calls.mostRecent().args[0].queueableFns;
      queueableFns[0].fn(nodeDone);

      queueableFns = runQueue.calls.mostRecent().args[0].queueableFns;
      expect(queueableFns.length).toBe(2);

      queueableFns[1].fn('foo');
      expect(leaf.execute).toHaveBeenCalledWith(
        runQueue,
        globalErrors,
        'foo',
        false,
        false,
        detectLateRejectionHandling
      );

      runQueue.calls.mostRecent().args[0].onComplete('things');
      expect(nodeComplete).toHaveBeenCalled();
      nodeComplete.calls.mostRecent().args[2]();
      expect(nodeDone).toHaveBeenCalledWith('things');
    });

    it('runs an excluded node with leaf', function() {
      const leaf1 = new Leaf();
      const node = new Node({ children: [leaf1] });
      const root = new Node({ children: [node] });
      const runQueue = jasmine.createSpy('runQueue');
      const globalErrors = 'the globalErrors instance';
      const detectLateRejectionHandling = false;
      const nodeStart = jasmine.createSpy('nodeStart');
      const nodeComplete = jasmine.createSpy('nodeComplete');
      const processor = new jasmineUnderTest.TreeProcessor({
        tree: root,
        runnableIds: [],
        runQueue,
        nodeStart: nodeStart,
        nodeComplete: nodeComplete,
        globalErrors,
        detectLateRejectionHandling
      });
      const treeComplete = jasmine.createSpy('treeComplete');
      const nodeDone = jasmine.createSpy('nodeDone');

      processor.execute(treeComplete);
      let queueableFns = runQueue.calls.mostRecent().args[0].queueableFns;
      queueableFns[0].fn(nodeDone);

      queueableFns = runQueue.calls.mostRecent().args[0].queueableFns;
      expect(queueableFns.length).toBe(2);

      queueableFns[0].fn('bar');
      expect(nodeStart).toHaveBeenCalledWith(node, 'bar');

      queueableFns[1].fn('foo');
      expect(leaf1.execute).toHaveBeenCalledWith(
        runQueue,
        globalErrors,
        'foo',
        true,
        false,
        detectLateRejectionHandling
      );

      node.getResult.and.returnValue({ im: 'disabled' });

      runQueue.calls.mostRecent().args[0].onComplete();
      expect(nodeComplete).toHaveBeenCalledWith(
        node,
        { im: 'disabled' },
        jasmine.any(Function)
      );
    });

    it('should execute node with correct arguments when failSpecWithNoExpectations option is set', function() {
      const leaf = new Leaf();
      const node = new Node({ children: [leaf] });
      const root = new Node({ children: [node] });
      const runQueue = jasmine.createSpy('runQueue');
      const globalErrors = 'the globalErrors instance';
      const detectLateRejectionHandling = false;
      const nodeStart = jasmine.createSpy('nodeStart');
      const nodeComplete = jasmine.createSpy('nodeComplete');
      const processor = new jasmineUnderTest.TreeProcessor({
        tree: root,
        runnableIds: [],
        runQueue,
        nodeStart: nodeStart,
        nodeComplete: nodeComplete,
        globalErrors,
        detectLateRejectionHandling,
        failSpecWithNoExpectations: true
      });
      const treeComplete = jasmine.createSpy('treeComplete');
      const nodeDone = jasmine.createSpy('nodeDone');

      processor.execute(treeComplete);
      let queueableFns = runQueue.calls.mostRecent().args[0].queueableFns;
      queueableFns[0].fn(nodeDone);

      queueableFns = runQueue.calls.mostRecent().args[0].queueableFns;
      expect(queueableFns.length).toBe(2);

      queueableFns[1].fn('foo');
      expect(leaf.execute).toHaveBeenCalledWith(
        runQueue,
        globalErrors,
        'foo',
        true,
        true,
        detectLateRejectionHandling
      );
    });

    it('runs beforeAlls for a node with children', function() {
      const leaf = new Leaf(),
        node = new Node({
          children: [leaf],
          beforeAllFns: [
            { fn: 'beforeAll1', timeout: 1 },
            { fn: 'beforeAll2', timeout: 2 }
          ]
        }),
        root = new Node({ children: [node] }),
        runQueue = jasmine.createSpy('runQueue'),
        processor = new jasmineUnderTest.TreeProcessor({
          tree: root,
          runnableIds: [node.id],
          runQueue
        }),
        treeComplete = jasmine.createSpy('treeComplete'),
        nodeDone = jasmine.createSpy('nodeDone');

      processor.execute(treeComplete);
      let queueableFns = runQueue.calls.mostRecent().args[0].queueableFns;
      queueableFns[0].fn(nodeDone);

      queueableFns = runQueue.calls.mostRecent().args[0].queueableFns;

      expect(queueableFns).toEqual([
        { fn: jasmine.any(Function) },
        { fn: 'beforeAll1', timeout: 1 },
        { fn: 'beforeAll2', timeout: 2 },
        { fn: jasmine.any(Function) }
      ]);
    });

    it('runs afterAlls for a node with children', function() {
      const leaf = new Leaf(),
        afterAllFns = [{ fn: 'afterAll1' }, { fn: 'afterAll2' }],
        node = new Node({
          children: [leaf],
          afterAllFns
        }),
        root = new Node({ children: [node] }),
        runQueue = jasmine.createSpy('runQueue'),
        processor = new jasmineUnderTest.TreeProcessor({
          tree: root,
          runnableIds: [node.id],
          runQueue
        }),
        treeComplete = jasmine.createSpy('treeComplete'),
        nodeDone = jasmine.createSpy('nodeDone');

      processor.execute(treeComplete);
      let queueableFns = runQueue.calls.mostRecent().args[0].queueableFns;
      queueableFns[0].fn(nodeDone);

      queueableFns = runQueue.calls.mostRecent().args[0].queueableFns;

      expect(queueableFns).toEqual([
        { fn: jasmine.any(Function) },
        { fn: jasmine.any(Function) },
        afterAllFns[0],
        afterAllFns[1]
      ]);
    });

    it('does not run beforeAlls or afterAlls for a node with no children', function() {
      const node = new Node({
          beforeAllFns: [{ fn: 'before' }],
          afterAllFns: [{ fn: 'after' }]
        }),
        root = new Node({ children: [node] }),
        runQueue = jasmine.createSpy('runQueue'),
        processor = new jasmineUnderTest.TreeProcessor({
          tree: root,
          runnableIds: [node.id],
          runQueue
        }),
        treeComplete = jasmine.createSpy('treeComplete'),
        nodeDone = jasmine.createSpy('nodeDone');

      processor.execute(treeComplete);
      let queueableFns = runQueue.calls.mostRecent().args[0].queueableFns;
      queueableFns[0].fn(nodeDone);

      queueableFns = runQueue.calls.mostRecent().args[0].queueableFns;

      expect(queueableFns).toEqual([{ fn: jasmine.any(Function) }]);
    });

    it('does not run beforeAlls or afterAlls for a node with only pending children', function() {
      const leaf = new Leaf({ markedPending: true }),
        node = new Node({
          children: [leaf],
          beforeAllFns: [{ fn: 'before' }],
          afterAllFns: [{ fn: 'after' }],
          markedPending: false
        }),
        root = new Node({ children: [node] }),
        runQueue = jasmine.createSpy('runQueue'),
        processor = new jasmineUnderTest.TreeProcessor({
          tree: root,
          runnableIds: [node.id],
          runQueue
        }),
        treeComplete = jasmine.createSpy('treeComplete'),
        nodeDone = jasmine.createSpy('nodeDone');

      processor.execute(treeComplete);
      let queueableFns = runQueue.calls.mostRecent().args[0].queueableFns;
      queueableFns[0].fn(nodeDone);

      queueableFns = runQueue.calls.mostRecent().args[0].queueableFns;

      expect(queueableFns).toEqual([
        { fn: jasmine.any(Function) },
        { fn: jasmine.any(Function) }
      ]);
    });

    it('runs leaves in the order specified', function() {
      const leaf1 = new Leaf(),
        leaf2 = new Leaf(),
        root = new Node({ children: [leaf1, leaf2] }),
        runQueue = jasmine.createSpy('runQueue'),
        processor = new jasmineUnderTest.TreeProcessor({
          tree: root,
          runnableIds: [leaf2.id, leaf1.id],
          runQueue
        }),
        treeComplete = jasmine.createSpy('treeComplete');

      processor.execute(treeComplete);
      const queueableFns = runQueue.calls.mostRecent().args[0].queueableFns;
      queueableFns[0].fn();

      expect(leaf1.execute).not.toHaveBeenCalled();
      expect(leaf2.execute).toHaveBeenCalled();

      queueableFns[1].fn();

      expect(leaf1.execute).toHaveBeenCalled();
    });

    it('runs specified leaves before non-specified leaves within a parent node', function() {
      const specified = new Leaf();
      const nonSpecified = new Leaf();
      const root = new Node({ children: [nonSpecified, specified] });
      const runQueue = jasmine.createSpy('runQueue');
      const globalErrors = 'the globalErrors instance';
      const detectLateRejectionHandling = false;
      const processor = new jasmineUnderTest.TreeProcessor({
        tree: root,
        runnableIds: [specified.id],
        runQueue,
        globalErrors,
        detectLateRejectionHandling
      });
      const treeComplete = jasmine.createSpy('treeComplete');

      processor.execute(treeComplete);
      const queueableFns = runQueue.calls.mostRecent().args[0].queueableFns;
      queueableFns[0].fn();

      expect(nonSpecified.execute).not.toHaveBeenCalled();
      expect(specified.execute).toHaveBeenCalledWith(
        runQueue,
        globalErrors,
        undefined,
        false,
        false,
        detectLateRejectionHandling
      );

      queueableFns[1].fn();

      expect(nonSpecified.execute).toHaveBeenCalledWith(
        runQueue,
        globalErrors,
        undefined,
        true,
        false,
        detectLateRejectionHandling
      );
    });

    it('runs nodes and leaves with a specified order', function() {
      const specifiedLeaf = new Leaf(),
        childLeaf = new Leaf(),
        specifiedNode = new Node({ children: [childLeaf] }),
        root = new Node({ children: [specifiedLeaf, specifiedNode] }),
        runQueue = jasmine.createSpy('runQueue'),
        processor = new jasmineUnderTest.TreeProcessor({
          tree: root,
          runnableIds: [specifiedNode.id, specifiedLeaf.id],
          runQueue
        });

      processor.execute();
      const queueableFns = runQueue.calls.mostRecent().args[0].queueableFns;
      queueableFns[0].fn();

      expect(specifiedLeaf.execute).not.toHaveBeenCalled();
      const nodeQueueableFns = runQueue.calls.mostRecent().args[0].queueableFns;
      nodeQueueableFns[1].fn();

      expect(childLeaf.execute).toHaveBeenCalled();

      queueableFns[1].fn();

      expect(specifiedLeaf.execute).toHaveBeenCalled();
    });

    it('runs a node multiple times if the order specified leaves and re-enters it', function() {
      const leaf1 = new Leaf(),
        leaf2 = new Leaf(),
        leaf3 = new Leaf(),
        leaf4 = new Leaf(),
        leaf5 = new Leaf(),
        reentered = new Node({ children: [leaf1, leaf2, leaf3] }),
        root = new Node({ children: [reentered, leaf4, leaf5] }),
        runQueue = jasmine.createSpy('runQueue'),
        processor = new jasmineUnderTest.TreeProcessor({
          tree: root,
          runnableIds: [leaf1.id, leaf4.id, leaf2.id, leaf5.id, leaf3.id],
          runQueue
        });

      spyOn(jasmineUnderTest.getEnv(), 'deprecated');
      processor.execute();
      const queueableFns = runQueue.calls.mostRecent().args[0].queueableFns;
      expect(queueableFns.length).toBe(5);

      queueableFns[0].fn();
      expect(runQueue.calls.mostRecent().args[0].queueableFns.length).toBe(2);
      runQueue.calls.mostRecent().args[0].queueableFns[1].fn();
      expect(leaf1.execute).toHaveBeenCalled();

      queueableFns[1].fn();
      expect(leaf4.execute).toHaveBeenCalled();

      queueableFns[2].fn();
      expect(runQueue.calls.count()).toBe(3);
      expect(runQueue.calls.mostRecent().args[0].queueableFns.length).toBe(2);
      runQueue.calls.mostRecent().args[0].queueableFns[1].fn();
      expect(leaf2.execute).toHaveBeenCalled();

      queueableFns[3].fn();
      expect(leaf5.execute).toHaveBeenCalled();

      queueableFns[4].fn();
      expect(runQueue.calls.count()).toBe(4);
      expect(runQueue.calls.mostRecent().args[0].queueableFns.length).toBe(2);
      runQueue.calls.mostRecent().args[0].queueableFns[1].fn();
      expect(leaf3.execute).toHaveBeenCalled();
    });

    it('runs a parent of a node with segments correctly', function() {
      const leaf1 = new Leaf(),
        leaf2 = new Leaf(),
        leaf3 = new Leaf(),
        leaf4 = new Leaf(),
        leaf5 = new Leaf(),
        parent = new Node({ children: [leaf1, leaf2, leaf3] }),
        grandparent = new Node({ children: [parent] }),
        root = new Node({ children: [grandparent, leaf4, leaf5] }),
        runQueue = jasmine.createSpy('runQueue'),
        processor = new jasmineUnderTest.TreeProcessor({
          tree: root,
          runnableIds: [leaf1.id, leaf4.id, leaf2.id, leaf5.id, leaf3.id],
          runQueue
        });

      spyOn(jasmineUnderTest.getEnv(), 'deprecated');
      processor.execute();
      const queueableFns = runQueue.calls.mostRecent().args[0].queueableFns;
      expect(queueableFns.length).toBe(5);

      queueableFns[0].fn();
      expect(runQueue.calls.count()).toBe(2);
      expect(runQueue.calls.mostRecent().args[0].queueableFns.length).toBe(2);

      runQueue.calls.mostRecent().args[0].queueableFns[1].fn();
      expect(runQueue.calls.count()).toBe(3);

      runQueue.calls.mostRecent().args[0].queueableFns[1].fn();
      expect(leaf1.execute).toHaveBeenCalled();

      queueableFns[1].fn();
      expect(leaf4.execute).toHaveBeenCalled();

      queueableFns[2].fn();
      expect(runQueue.calls.count()).toBe(4);
      expect(runQueue.calls.mostRecent().args[0].queueableFns.length).toBe(2);

      runQueue.calls.mostRecent().args[0].queueableFns[1].fn();
      expect(runQueue.calls.count()).toBe(5);

      runQueue.calls.mostRecent().args[0].queueableFns[1].fn();
      expect(leaf2.execute).toHaveBeenCalled();

      queueableFns[3].fn();
      expect(leaf5.execute).toHaveBeenCalled();

      queueableFns[4].fn();
      expect(runQueue.calls.count()).toBe(6);
      expect(runQueue.calls.mostRecent().args[0].queueableFns.length).toBe(2);

      runQueue.calls.mostRecent().args[0].queueableFns[1].fn();
      expect(runQueue.calls.count()).toBe(7);

      runQueue.calls.mostRecent().args[0].queueableFns[1].fn();
      expect(leaf3.execute).toHaveBeenCalled();
    });

    it('runs nodes in the order they were declared', function() {
      const leaf1 = new Leaf(),
        leaf2 = new Leaf(),
        leaf3 = new Leaf(),
        parent = new Node({ children: [leaf2, leaf3] }),
        root = new Node({ children: [leaf1, parent] }),
        runQueue = jasmine.createSpy('runQueue'),
        processor = new jasmineUnderTest.TreeProcessor({
          tree: root,
          runnableIds: [root.id],
          runQueue
        });

      processor.execute();
      const queueableFns = runQueue.calls.mostRecent().args[0].queueableFns;
      expect(queueableFns.length).toBe(2);

      queueableFns[0].fn();
      expect(leaf1.execute).toHaveBeenCalled();

      queueableFns[1].fn();

      const childFns = runQueue.calls.mostRecent().args[0].queueableFns;
      expect(childFns.length).toBe(3);
      childFns[1].fn();
      expect(leaf2.execute).toHaveBeenCalled();

      childFns[2].fn();
      expect(leaf3.execute).toHaveBeenCalled();
    });

    it('runs large segments of nodes in the order they were declared', function() {
      const leaf1 = new Leaf(),
        leaf2 = new Leaf(),
        leaf3 = new Leaf(),
        leaf4 = new Leaf(),
        leaf5 = new Leaf(),
        leaf6 = new Leaf(),
        leaf7 = new Leaf(),
        leaf8 = new Leaf(),
        leaf9 = new Leaf(),
        leaf10 = new Leaf(),
        leaf11 = new Leaf(),
        root = new Node({
          children: [
            leaf1,
            leaf2,
            leaf3,
            leaf4,
            leaf5,
            leaf6,
            leaf7,
            leaf8,
            leaf9,
            leaf10,
            leaf11
          ]
        }),
        runQueue = jasmine.createSpy('runQueue'),
        processor = new jasmineUnderTest.TreeProcessor({
          tree: root,
          runnableIds: [root.id],
          runQueue
        });

      processor.execute();
      const queueableFns = runQueue.calls.mostRecent().args[0].queueableFns;
      expect(queueableFns.length).toBe(11);

      queueableFns[0].fn();
      expect(leaf1.execute).toHaveBeenCalled();

      queueableFns[1].fn();
      expect(leaf2.execute).toHaveBeenCalled();

      queueableFns[2].fn();
      expect(leaf3.execute).toHaveBeenCalled();

      queueableFns[3].fn();
      expect(leaf4.execute).toHaveBeenCalled();

      queueableFns[4].fn();
      expect(leaf5.execute).toHaveBeenCalled();

      queueableFns[5].fn();
      expect(leaf6.execute).toHaveBeenCalled();

      queueableFns[6].fn();
      expect(leaf7.execute).toHaveBeenCalled();

      queueableFns[7].fn();
      expect(leaf8.execute).toHaveBeenCalled();

      queueableFns[8].fn();
      expect(leaf9.execute).toHaveBeenCalled();

      queueableFns[9].fn();
      expect(leaf10.execute).toHaveBeenCalled();

      queueableFns[10].fn();
      expect(leaf11.execute).toHaveBeenCalled();
    });

    it('runs nodes in a custom order when orderChildren is overridden', function() {
      const leaf1 = new Leaf(),
        leaf2 = new Leaf(),
        leaf3 = new Leaf(),
        leaf4 = new Leaf(),
        leaf5 = new Leaf(),
        leaf6 = new Leaf(),
        leaf7 = new Leaf(),
        leaf8 = new Leaf(),
        leaf9 = new Leaf(),
        leaf10 = new Leaf(),
        leaf11 = new Leaf(),
        root = new Node({
          children: [
            leaf1,
            leaf2,
            leaf3,
            leaf4,
            leaf5,
            leaf6,
            leaf7,
            leaf8,
            leaf9,
            leaf10,
            leaf11
          ]
        }),
        runQueue = jasmine.createSpy('runQueue'),
        processor = new jasmineUnderTest.TreeProcessor({
          tree: root,
          runnableIds: [root.id],
          runQueue,
          orderChildren: function(node) {
            const children = node.children.slice();
            return children.reverse();
          }
        });

      processor.execute();
      const queueableFns = runQueue.calls.mostRecent().args[0].queueableFns;
      expect(queueableFns.length).toBe(11);

      queueableFns[0].fn();
      expect(leaf11.execute).toHaveBeenCalled();

      queueableFns[1].fn();
      expect(leaf10.execute).toHaveBeenCalled();

      queueableFns[2].fn();
      expect(leaf9.execute).toHaveBeenCalled();

      queueableFns[3].fn();
      expect(leaf8.execute).toHaveBeenCalled();

      queueableFns[4].fn();
      expect(leaf7.execute).toHaveBeenCalled();

      queueableFns[5].fn();
      expect(leaf6.execute).toHaveBeenCalled();

      queueableFns[6].fn();
      expect(leaf5.execute).toHaveBeenCalled();

      queueableFns[7].fn();
      expect(leaf4.execute).toHaveBeenCalled();

      queueableFns[8].fn();
      expect(leaf3.execute).toHaveBeenCalled();

      queueableFns[9].fn();
      expect(leaf2.execute).toHaveBeenCalled();

      queueableFns[10].fn();
      expect(leaf1.execute).toHaveBeenCalled();
    });
  });
});
