describe('TreeProcessor', function() {
  var nodeNumber = 0,
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
    var leaf = new Leaf(),
      processor = new jasmineUnderTest.TreeProcessor({
        tree: leaf,
        runnableIds: [leaf.id]
      }),
      result = processor.processTree();

    expect(result.valid).toBe(true);

    expect(result[leaf.id]).toEqual({
      excluded: false,
      willExecute: true,
      segments: jasmine.any(Array)
    });
  });

  it('processes a single pending leaf', function() {
    var leaf = new Leaf({ markedPending: true }),
      processor = new jasmineUnderTest.TreeProcessor({
        tree: leaf,
        runnableIds: [leaf.id]
      }),
      result = processor.processTree();

    expect(result.valid).toBe(true);

    expect(result[leaf.id]).toEqual({
      excluded: false,
      willExecute: false,
      segments: jasmine.any(Array)
    });
  });

  it('processes a single non-specified leaf', function() {
    var leaf = new Leaf(),
      processor = new jasmineUnderTest.TreeProcessor({
        tree: leaf,
        runnableIds: []
      }),
      result = processor.processTree();

    expect(result.valid).toBe(true);

    expect(result[leaf.id]).toEqual({
      excluded: true,
      willExecute: false,
      segments: jasmine.any(Array)
    });
  });

  it('processes a single excluded leaf', function() {
    var leaf = new Leaf(),
      processor = new jasmineUnderTest.TreeProcessor({
        tree: leaf,
        runnableIds: [leaf.id],
        excludeNode: function(node) {
          return true;
        }
      }),
      result = processor.processTree();

    expect(result.valid).toBe(true);

    expect(result[leaf.id]).toEqual({
      excluded: true,
      willExecute: false,
      segments: jasmine.any(Array)
    });
  });

  it('processes a tree with a single leaf with the root specified', function() {
    var leaf = new Leaf(),
      parent = new Node({ children: [leaf] }),
      processor = new jasmineUnderTest.TreeProcessor({
        tree: parent,
        runnableIds: [parent.id]
      }),
      result = processor.processTree();

    expect(result.valid).toBe(true);

    expect(result[parent.id]).toEqual({
      excluded: false,
      willExecute: true,
      segments: jasmine.any(Array)
    });

    expect(result[leaf.id]).toEqual({
      excluded: false,
      willExecute: true,
      segments: jasmine.any(Array)
    });
  });

  it('processes a tree with a single pending leaf, with the root specified', function() {
    var leaf = new Leaf({ markedPending: true }),
      parent = new Node({ children: [leaf] }),
      processor = new jasmineUnderTest.TreeProcessor({
        tree: parent,
        runnableIds: [parent.id]
      }),
      result = processor.processTree();

    expect(result.valid).toBe(true);

    expect(result[parent.id]).toEqual({
      excluded: false,
      willExecute: false,
      segments: jasmine.any(Array)
    });

    expect(result[leaf.id]).toEqual({
      excluded: false,
      willExecute: false,
      segments: jasmine.any(Array)
    });
  });

  it('processes a complicated tree with the root specified', function() {
    var pendingLeaf = new Leaf({ markedPending: true }),
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
      }),
      result = processor.processTree();

    expect(result.valid).toBe(true);

    expect(result[root.id]).toEqual({
      excluded: false,
      willExecute: true,
      segments: jasmine.any(Array)
    });

    expect(result[parentOfPendings.id]).toEqual({
      excluded: false,
      willExecute: false,
      segments: jasmine.any(Array)
    });

    expect(result[childless.id]).toEqual({
      excluded: false,
      willExecute: false,
      segments: jasmine.any(Array)
    });

    expect(result[pendingLeaf.id]).toEqual({
      excluded: false,
      willExecute: false,
      segments: jasmine.any(Array)
    });

    expect(result[executableLeaf.id]).toEqual({
      excluded: false,
      willExecute: true,
      segments: jasmine.any(Array)
    });

    expect(result[parent.id]).toEqual({
      excluded: false,
      willExecute: true,
      segments: jasmine.any(Array)
    });

    expect(result[pendingNode.id]).toEqual({
      excluded: false,
      willExecute: false,
      segments: jasmine.any(Array)
    });

    expect(result[childOfPending.id]).toEqual({
      excluded: false,
      willExecute: false,
      segments: jasmine.any(Array)
    });
  });

  it('marks the run order invalid if it would re-enter a node that does not allow re-entry', function() {
    var leaf1 = new Leaf(),
      leaf2 = new Leaf(),
      leaf3 = new Leaf(),
      reentered = new Node({ noReenter: true, children: [leaf1, leaf2] }),
      root = new Node({ children: [reentered, leaf3] }),
      processor = new jasmineUnderTest.TreeProcessor({
        tree: root,
        runnableIds: [leaf1.id, leaf3.id, leaf2.id]
      }),
      result = processor.processTree();

    expect(result).toEqual({ valid: false });
  });

  it('marks the run order valid if a node being re-entered allows re-entry', function() {
    var leaf1 = new Leaf(),
      leaf2 = new Leaf(),
      leaf3 = new Leaf(),
      reentered = new Node({ children: [leaf1, leaf2] }),
      root = new Node({ children: [reentered, leaf3] }),
      processor = new jasmineUnderTest.TreeProcessor({
        tree: root,
        runnableIds: [leaf1.id, leaf3.id, leaf2.id]
      }),
      result = processor.processTree();

    expect(result.valid).toBe(true);
  });

  it("marks the run order valid if a node which can't be re-entered is only entered once", function() {
    var leaf1 = new Leaf(),
      leaf2 = new Leaf(),
      leaf3 = new Leaf(),
      noReentry = new Node({ noReenter: true }),
      root = new Node({ children: [noReentry] }),
      processor = new jasmineUnderTest.TreeProcessor({
        tree: root,
        runnableIds: [leaf2.id, leaf1.id, leaf3.id]
      }),
      result = processor.processTree();

    expect(result.valid).toBe(true);
  });

  it("marks the run order valid if a node which can't be re-entered is run directly", function() {
    var noReentry = new Node({ noReenter: true }),
      root = new Node({ children: [noReentry] }),
      processor = new jasmineUnderTest.TreeProcessor({
        tree: root,
        runnableIds: [root.id]
      }),
      result = processor.processTree();

    expect(result.valid).toBe(true);
  });

  it('runs a single leaf', function() {
    var leaf = new Leaf(),
      node = new Node({ children: [leaf], userContext: { root: 'context' } }),
      queueRunner = jasmine.createSpy('queueRunner'),
      processor = new jasmineUnderTest.TreeProcessor({
        tree: node,
        runnableIds: [leaf.id],
        queueRunnerFactory: queueRunner
      }),
      treeComplete = jasmine.createSpy('treeComplete');

    processor.execute(treeComplete);

    expect(queueRunner).toHaveBeenCalledWith({
      onComplete: treeComplete,
      onException: jasmine.any(Function),
      userContext: { root: 'context' },
      queueableFns: [{ fn: jasmine.any(Function) }],
      onMultipleDone: null
    });

    queueRunner.calls.mostRecent().args[0].queueableFns[0].fn('foo');

    expect(leaf.execute).toHaveBeenCalledWith('foo', false, false);
  });

  it('runs a node with no children', function() {
    var node = new Node({ userContext: { node: 'context' } }),
      root = new Node({ children: [node], userContext: { root: 'context' } }),
      nodeStart = jasmine.createSpy('nodeStart'),
      nodeComplete = jasmine.createSpy('nodeComplete'),
      queueRunner = jasmine.createSpy('queueRunner'),
      processor = new jasmineUnderTest.TreeProcessor({
        tree: root,
        runnableIds: [node.id],
        nodeStart: nodeStart,
        nodeComplete: nodeComplete,
        queueRunnerFactory: queueRunner
      }),
      treeComplete = jasmine.createSpy('treeComplete'),
      nodeDone = jasmine.createSpy('nodeDone');

    processor.execute(treeComplete);

    expect(queueRunner).toHaveBeenCalledWith({
      onComplete: treeComplete,
      onException: jasmine.any(Function),
      userContext: { root: 'context' },
      queueableFns: [{ fn: jasmine.any(Function) }],
      onMultipleDone: null
    });

    queueRunner.calls.mostRecent().args[0].queueableFns[0].fn(nodeDone);

    expect(queueRunner).toHaveBeenCalledWith({
      onComplete: jasmine.any(Function),
      onMultipleDone: null,
      queueableFns: [{ fn: jasmine.any(Function) }],
      userContext: { node: 'context' },
      onException: jasmine.any(Function),
      onMultipleDone: null
    });

    queueRunner.calls.mostRecent().args[0].queueableFns[0].fn('foo');
    expect(nodeStart).toHaveBeenCalledWith(node, 'foo');

    node.getResult.and.returnValue({ my: 'result' });

    queueRunner.calls.mostRecent().args[0].onComplete();
    expect(nodeComplete).toHaveBeenCalledWith(
      node,
      { my: 'result' },
      jasmine.any(Function)
    );
  });

  it('runs a node with children', function() {
    var leaf1 = new Leaf(),
      leaf2 = new Leaf(),
      node = new Node({ children: [leaf1, leaf2] }),
      root = new Node({ children: [node] }),
      queueRunner = jasmine.createSpy('queueRunner'),
      processor = new jasmineUnderTest.TreeProcessor({
        tree: root,
        runnableIds: [node.id],
        queueRunnerFactory: queueRunner
      }),
      treeComplete = jasmine.createSpy('treeComplete'),
      nodeDone = jasmine.createSpy('nodeDone');

    processor.execute(treeComplete);
    var queueableFns = queueRunner.calls.mostRecent().args[0].queueableFns;
    queueableFns[0].fn(nodeDone);

    queueableFns = queueRunner.calls.mostRecent().args[0].queueableFns;
    expect(queueableFns.length).toBe(3);

    queueableFns[1].fn('foo');
    expect(leaf1.execute).toHaveBeenCalledWith('foo', false, false);

    queueableFns[2].fn('bar');
    expect(leaf2.execute).toHaveBeenCalledWith('bar', false, false);
  });

  it('cascades errors up the tree', function() {
    var leaf = new Leaf(),
      node = new Node({ children: [leaf] }),
      root = new Node({ children: [node] }),
      queueRunner = jasmine.createSpy('queueRunner'),
      nodeComplete = jasmine.createSpy('nodeComplete'),
      processor = new jasmineUnderTest.TreeProcessor({
        tree: root,
        runnableIds: [node.id],
        nodeComplete: nodeComplete,
        queueRunnerFactory: queueRunner
      }),
      treeComplete = jasmine.createSpy('treeComplete'),
      nodeDone = jasmine.createSpy('nodeDone');

    processor.execute(treeComplete);
    var queueableFns = queueRunner.calls.mostRecent().args[0].queueableFns;
    queueableFns[0].fn(nodeDone);

    queueableFns = queueRunner.calls.mostRecent().args[0].queueableFns;
    expect(queueableFns.length).toBe(2);

    queueableFns[1].fn('foo');
    expect(leaf.execute).toHaveBeenCalledWith('foo', false, false);

    queueRunner.calls.mostRecent().args[0].onComplete('things');
    expect(nodeComplete).toHaveBeenCalled();
    nodeComplete.calls.mostRecent().args[2]();
    expect(nodeDone).toHaveBeenCalledWith('things');
  });

  it('runs an excluded node with leaf', function() {
    var leaf1 = new Leaf(),
      node = new Node({ children: [leaf1] }),
      root = new Node({ children: [node] }),
      queueRunner = jasmine.createSpy('queueRunner'),
      nodeStart = jasmine.createSpy('nodeStart'),
      nodeComplete = jasmine.createSpy('nodeComplete'),
      processor = new jasmineUnderTest.TreeProcessor({
        tree: root,
        runnableIds: [],
        queueRunnerFactory: queueRunner,
        nodeStart: nodeStart,
        nodeComplete: nodeComplete
      }),
      treeComplete = jasmine.createSpy('treeComplete'),
      nodeDone = jasmine.createSpy('nodeDone');

    processor.execute(treeComplete);
    var queueableFns = queueRunner.calls.mostRecent().args[0].queueableFns;
    queueableFns[0].fn(nodeDone);

    queueableFns = queueRunner.calls.mostRecent().args[0].queueableFns;
    expect(queueableFns.length).toBe(2);

    queueableFns[0].fn('bar');
    expect(nodeStart).toHaveBeenCalledWith(node, 'bar');

    queueableFns[1].fn('foo');
    expect(leaf1.execute).toHaveBeenCalledWith('foo', true, false);

    node.getResult.and.returnValue({ im: 'disabled' });

    queueRunner.calls.mostRecent().args[0].onComplete();
    expect(nodeComplete).toHaveBeenCalledWith(
      node,
      { im: 'disabled' },
      jasmine.any(Function)
    );
  });

  it('should execute node with correct arguments when failSpecWithNoExpectations option is set', function() {
    var leaf = new Leaf(),
      node = new Node({ children: [leaf] }),
      root = new Node({ children: [node] }),
      queueRunner = jasmine.createSpy('queueRunner'),
      nodeStart = jasmine.createSpy('nodeStart'),
      nodeComplete = jasmine.createSpy('nodeComplete'),
      processor = new jasmineUnderTest.TreeProcessor({
        tree: root,
        runnableIds: [],
        queueRunnerFactory: queueRunner,
        nodeStart: nodeStart,
        nodeComplete: nodeComplete,
        failSpecWithNoExpectations: true
      }),
      treeComplete = jasmine.createSpy('treeComplete'),
      nodeDone = jasmine.createSpy('nodeDone');

    processor.execute(treeComplete);
    var queueableFns = queueRunner.calls.mostRecent().args[0].queueableFns;
    queueableFns[0].fn(nodeDone);

    queueableFns = queueRunner.calls.mostRecent().args[0].queueableFns;
    expect(queueableFns.length).toBe(2);

    queueableFns[1].fn('foo');
    expect(leaf.execute).toHaveBeenCalledWith('foo', true, true);
  });

  it('runs beforeAlls for a node with children', function() {
    var leaf = new Leaf(),
      node = new Node({
        children: [leaf],
        beforeAllFns: [
          { fn: 'beforeAll1', timeout: 1 },
          { fn: 'beforeAll2', timeout: 2 }
        ]
      }),
      root = new Node({ children: [node] }),
      queueRunner = jasmine.createSpy('queueRunner'),
      processor = new jasmineUnderTest.TreeProcessor({
        tree: root,
        runnableIds: [node.id],
        queueRunnerFactory: queueRunner
      }),
      treeComplete = jasmine.createSpy('treeComplete'),
      nodeDone = jasmine.createSpy('nodeDone');

    processor.execute(treeComplete);
    var queueableFns = queueRunner.calls.mostRecent().args[0].queueableFns;
    queueableFns[0].fn(nodeDone);

    queueableFns = queueRunner.calls.mostRecent().args[0].queueableFns;

    expect(queueableFns).toEqual([
      { fn: jasmine.any(Function) },
      { fn: 'beforeAll1', timeout: 1 },
      { fn: 'beforeAll2', timeout: 2 },
      { fn: jasmine.any(Function) }
    ]);
  });

  it('runs afterAlls for a node with children', function() {
    var leaf = new Leaf(),
      afterAllFns = [{ fn: 'afterAll1' }, { fn: 'afterAll2' }],
      node = new Node({
        children: [leaf],
        afterAllFns
      }),
      root = new Node({ children: [node] }),
      queueRunner = jasmine.createSpy('queueRunner'),
      processor = new jasmineUnderTest.TreeProcessor({
        tree: root,
        runnableIds: [node.id],
        queueRunnerFactory: queueRunner
      }),
      treeComplete = jasmine.createSpy('treeComplete'),
      nodeDone = jasmine.createSpy('nodeDone');

    processor.execute(treeComplete);
    var queueableFns = queueRunner.calls.mostRecent().args[0].queueableFns;
    queueableFns[0].fn(nodeDone);

    queueableFns = queueRunner.calls.mostRecent().args[0].queueableFns;

    expect(queueableFns).toEqual([
      { fn: jasmine.any(Function) },
      { fn: jasmine.any(Function) },
      afterAllFns[0],
      afterAllFns[1]
    ]);
  });

  it('does not run beforeAlls or afterAlls for a node with no children', function() {
    var node = new Node({
        beforeAllFns: [{ fn: 'before' }],
        afterAllFns: [{ fn: 'after' }]
      }),
      root = new Node({ children: [node] }),
      queueRunner = jasmine.createSpy('queueRunner'),
      processor = new jasmineUnderTest.TreeProcessor({
        tree: root,
        runnableIds: [node.id],
        queueRunnerFactory: queueRunner
      }),
      treeComplete = jasmine.createSpy('treeComplete'),
      nodeDone = jasmine.createSpy('nodeDone');

    processor.execute(treeComplete);
    var queueableFns = queueRunner.calls.mostRecent().args[0].queueableFns;
    queueableFns[0].fn(nodeDone);

    queueableFns = queueRunner.calls.mostRecent().args[0].queueableFns;

    expect(queueableFns).toEqual([{ fn: jasmine.any(Function) }]);
  });

  it('does not run beforeAlls or afterAlls for a node with only pending children', function() {
    var leaf = new Leaf({ markedPending: true }),
      node = new Node({
        children: [leaf],
        beforeAllFns: [{ fn: 'before' }],
        afterAllFns: [{ fn: 'after' }],
        markedPending: false
      }),
      root = new Node({ children: [node] }),
      queueRunner = jasmine.createSpy('queueRunner'),
      processor = new jasmineUnderTest.TreeProcessor({
        tree: root,
        runnableIds: [node.id],
        queueRunnerFactory: queueRunner
      }),
      treeComplete = jasmine.createSpy('treeComplete'),
      nodeDone = jasmine.createSpy('nodeDone');

    processor.execute(treeComplete);
    var queueableFns = queueRunner.calls.mostRecent().args[0].queueableFns;
    queueableFns[0].fn(nodeDone);

    queueableFns = queueRunner.calls.mostRecent().args[0].queueableFns;

    expect(queueableFns).toEqual([
      { fn: jasmine.any(Function) },
      { fn: jasmine.any(Function) }
    ]);
  });

  it('runs leaves in the order specified', function() {
    var leaf1 = new Leaf(),
      leaf2 = new Leaf(),
      root = new Node({ children: [leaf1, leaf2] }),
      queueRunner = jasmine.createSpy('queueRunner'),
      processor = new jasmineUnderTest.TreeProcessor({
        tree: root,
        runnableIds: [leaf2.id, leaf1.id],
        queueRunnerFactory: queueRunner
      }),
      treeComplete = jasmine.createSpy('treeComplete');

    processor.execute(treeComplete);
    var queueableFns = queueRunner.calls.mostRecent().args[0].queueableFns;
    queueableFns[0].fn();

    expect(leaf1.execute).not.toHaveBeenCalled();
    expect(leaf2.execute).toHaveBeenCalled();

    queueableFns[1].fn();

    expect(leaf1.execute).toHaveBeenCalled();
  });

  it('runs specified leaves before non-specified leaves within a parent node', function() {
    var specified = new Leaf(),
      nonSpecified = new Leaf(),
      root = new Node({ children: [nonSpecified, specified] }),
      queueRunner = jasmine.createSpy('queueRunner'),
      processor = new jasmineUnderTest.TreeProcessor({
        tree: root,
        runnableIds: [specified.id],
        queueRunnerFactory: queueRunner
      }),
      treeComplete = jasmine.createSpy('treeComplete');

    processor.execute(treeComplete);
    var queueableFns = queueRunner.calls.mostRecent().args[0].queueableFns;
    queueableFns[0].fn();

    expect(nonSpecified.execute).not.toHaveBeenCalled();
    expect(specified.execute).toHaveBeenCalledWith(undefined, false, false);

    queueableFns[1].fn();

    expect(nonSpecified.execute).toHaveBeenCalledWith(undefined, true, false);
  });

  it('runs nodes and leaves with a specified order', function() {
    var specifiedLeaf = new Leaf(),
      childLeaf = new Leaf(),
      specifiedNode = new Node({ children: [childLeaf] }),
      root = new Node({ children: [specifiedLeaf, specifiedNode] }),
      queueRunner = jasmine.createSpy('queueRunner'),
      processor = new jasmineUnderTest.TreeProcessor({
        tree: root,
        runnableIds: [specifiedNode.id, specifiedLeaf.id],
        queueRunnerFactory: queueRunner
      });

    processor.execute();
    var queueableFns = queueRunner.calls.mostRecent().args[0].queueableFns;
    queueableFns[0].fn();

    expect(specifiedLeaf.execute).not.toHaveBeenCalled();
    var nodeQueueableFns = queueRunner.calls.mostRecent().args[0].queueableFns;
    nodeQueueableFns[1].fn();

    expect(childLeaf.execute).toHaveBeenCalled();

    queueableFns[1].fn();

    expect(specifiedLeaf.execute).toHaveBeenCalled();
  });

  it('runs a node multiple times if the order specified leaves and re-enters it', function() {
    var leaf1 = new Leaf(),
      leaf2 = new Leaf(),
      leaf3 = new Leaf(),
      leaf4 = new Leaf(),
      leaf5 = new Leaf(),
      reentered = new Node({ children: [leaf1, leaf2, leaf3] }),
      root = new Node({ children: [reentered, leaf4, leaf5] }),
      queueRunner = jasmine.createSpy('queueRunner'),
      processor = new jasmineUnderTest.TreeProcessor({
        tree: root,
        runnableIds: [leaf1.id, leaf4.id, leaf2.id, leaf5.id, leaf3.id],
        queueRunnerFactory: queueRunner
      });

    processor.execute();
    var queueableFns = queueRunner.calls.mostRecent().args[0].queueableFns;
    expect(queueableFns.length).toBe(5);

    queueableFns[0].fn();
    expect(queueRunner.calls.mostRecent().args[0].queueableFns.length).toBe(2);
    queueRunner.calls.mostRecent().args[0].queueableFns[1].fn();
    expect(leaf1.execute).toHaveBeenCalled();

    queueableFns[1].fn();
    expect(leaf4.execute).toHaveBeenCalled();

    queueableFns[2].fn();
    expect(queueRunner.calls.count()).toBe(3);
    expect(queueRunner.calls.mostRecent().args[0].queueableFns.length).toBe(2);
    queueRunner.calls.mostRecent().args[0].queueableFns[1].fn();
    expect(leaf2.execute).toHaveBeenCalled();

    queueableFns[3].fn();
    expect(leaf5.execute).toHaveBeenCalled();

    queueableFns[4].fn();
    expect(queueRunner.calls.count()).toBe(4);
    expect(queueRunner.calls.mostRecent().args[0].queueableFns.length).toBe(2);
    queueRunner.calls.mostRecent().args[0].queueableFns[1].fn();
    expect(leaf3.execute).toHaveBeenCalled();
  });

  it('runs a parent of a node with segments correctly', function() {
    var leaf1 = new Leaf(),
      leaf2 = new Leaf(),
      leaf3 = new Leaf(),
      leaf4 = new Leaf(),
      leaf5 = new Leaf(),
      parent = new Node({ children: [leaf1, leaf2, leaf3] }),
      grandparent = new Node({ children: [parent] }),
      root = new Node({ children: [grandparent, leaf4, leaf5] }),
      queueRunner = jasmine.createSpy('queueRunner'),
      processor = new jasmineUnderTest.TreeProcessor({
        tree: root,
        runnableIds: [leaf1.id, leaf4.id, leaf2.id, leaf5.id, leaf3.id],
        queueRunnerFactory: queueRunner
      });

    processor.execute();
    var queueableFns = queueRunner.calls.mostRecent().args[0].queueableFns;
    expect(queueableFns.length).toBe(5);

    queueableFns[0].fn();
    expect(queueRunner.calls.count()).toBe(2);
    expect(queueRunner.calls.mostRecent().args[0].queueableFns.length).toBe(2);

    queueRunner.calls.mostRecent().args[0].queueableFns[1].fn();
    expect(queueRunner.calls.count()).toBe(3);

    queueRunner.calls.mostRecent().args[0].queueableFns[1].fn();
    expect(leaf1.execute).toHaveBeenCalled();

    queueableFns[1].fn();
    expect(leaf4.execute).toHaveBeenCalled();

    queueableFns[2].fn();
    expect(queueRunner.calls.count()).toBe(4);
    expect(queueRunner.calls.mostRecent().args[0].queueableFns.length).toBe(2);

    queueRunner.calls.mostRecent().args[0].queueableFns[1].fn();
    expect(queueRunner.calls.count()).toBe(5);

    queueRunner.calls.mostRecent().args[0].queueableFns[1].fn();
    expect(leaf2.execute).toHaveBeenCalled();

    queueableFns[3].fn();
    expect(leaf5.execute).toHaveBeenCalled();

    queueableFns[4].fn();
    expect(queueRunner.calls.count()).toBe(6);
    expect(queueRunner.calls.mostRecent().args[0].queueableFns.length).toBe(2);

    queueRunner.calls.mostRecent().args[0].queueableFns[1].fn();
    expect(queueRunner.calls.count()).toBe(7);

    queueRunner.calls.mostRecent().args[0].queueableFns[1].fn();
    expect(leaf3.execute).toHaveBeenCalled();
  });

  it('runs nodes in the order they were declared', function() {
    var leaf1 = new Leaf(),
      leaf2 = new Leaf(),
      leaf3 = new Leaf(),
      parent = new Node({ children: [leaf2, leaf3] }),
      root = new Node({ children: [leaf1, parent] }),
      queueRunner = jasmine.createSpy('queueRunner'),
      processor = new jasmineUnderTest.TreeProcessor({
        tree: root,
        runnableIds: [root.id],
        queueRunnerFactory: queueRunner
      });

    processor.execute();
    var queueableFns = queueRunner.calls.mostRecent().args[0].queueableFns;
    expect(queueableFns.length).toBe(2);

    queueableFns[0].fn();
    expect(leaf1.execute).toHaveBeenCalled();

    queueableFns[1].fn();

    var childFns = queueRunner.calls.mostRecent().args[0].queueableFns;
    expect(childFns.length).toBe(3);
    childFns[1].fn();
    expect(leaf2.execute).toHaveBeenCalled();

    childFns[2].fn();
    expect(leaf3.execute).toHaveBeenCalled();
  });

  it('runs large segments of nodes in the order they were declared', function() {
    var leaf1 = new Leaf(),
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
      queueRunner = jasmine.createSpy('queueRunner'),
      processor = new jasmineUnderTest.TreeProcessor({
        tree: root,
        runnableIds: [root.id],
        queueRunnerFactory: queueRunner
      });

    processor.execute();
    var queueableFns = queueRunner.calls.mostRecent().args[0].queueableFns;
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
    var leaf1 = new Leaf(),
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
      queueRunner = jasmine.createSpy('queueRunner'),
      processor = new jasmineUnderTest.TreeProcessor({
        tree: root,
        runnableIds: [root.id],
        queueRunnerFactory: queueRunner,
        orderChildren: function(node) {
          var children = node.children.slice();
          return children.reverse();
        }
      });

    processor.execute();
    var queueableFns = queueRunner.calls.mostRecent().args[0].queueableFns;
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
