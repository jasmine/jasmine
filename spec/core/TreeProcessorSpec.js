describe("TreeProcessor", function() {
  var nodeNumber = 0, leafNumber = 0;

  function Node(attrs) {
    attrs = attrs || {};
    this.id = 'node' + nodeNumber++;
    this.children = attrs.children || [];
    this.canBeReentered = function() {
      return !attrs.noReenter;
    };
    this.isExecutable = function() {
      return attrs.executable !== false;
    };
    this.sharedUserContext = function() {
      return attrs.userContext || {};
    };
    this.getResult = jasmine.createSpy(this.id + '#execute');
    this.beforeAllFns = attrs.beforeAllFns || [];
    this.afterAllFns = attrs.afterAllFns || [];
  }

  function Leaf(attrs) {
    attrs = attrs || {};
    this.id = 'leaf' + leafNumber++;
    this.isExecutable = function() {
      return attrs.executable !== false;
    };
    this.execute = jasmine.createSpy(this.id + '#execute');
  }

  it("processes a single executable leaf", function() {
    var leaf = new Leaf(),
        processor = new j$.TreeProcessor({ tree: leaf, runnableIds: [leaf.id] }),
        result = processor.processTree();

    expect(result.valid).toBe(true);

    expect(result[leaf.id]).toEqual({
      executable: true,
      segments: jasmine.any(Array)
    });
  });

  it("processes a single non-executable leaf", function() {
    var leaf = new Leaf({ executable: false }),
        processor = new j$.TreeProcessor({ tree: leaf, runnableIds: [leaf.id] }),
        result = processor.processTree();

    expect(result.valid).toBe(true);

    expect(result[leaf.id]).toEqual({
      executable: false,
      segments: jasmine.any(Array)
    });
  });

  it("processes a single non-specified leaf", function() {
    var leaf = new Leaf(),
        processor = new j$.TreeProcessor({ tree: leaf, runnableIds: [] }),
        result = processor.processTree();

    expect(result.valid).toBe(true);

    expect(result[leaf.id]).toEqual({
      executable: false,
      segments: jasmine.any(Array)
    });
  });

  it("processes a tree with a single leaf with the root specified", function() {
    var leaf = new Leaf(),
        parent = new Node({ children: [leaf] }),
        processor = new j$.TreeProcessor({ tree: parent, runnableIds: [parent.id] }),
        result = processor.processTree();

    expect(result.valid).toBe(true);

    expect(result[parent.id]).toEqual({
      executable: true,
      segments: jasmine.any(Array)
    });

    expect(result[leaf.id]).toEqual({
      executable: true,
      segments: jasmine.any(Array)
    });
  });

  it("processes a tree with a single non-executable leaf, with the root specified", function() {
    var leaf = new Leaf({ executable: false }),
        parent = new Node({ children: [leaf] }),
        processor = new j$.TreeProcessor({ tree: parent, runnableIds: [parent.id] }),
        result = processor.processTree();

    expect(result.valid).toBe(true);

    expect(result[parent.id]).toEqual({
      executable: false,
      segments: jasmine.any(Array)
    });

    expect(result[leaf.id]).toEqual({
      executable: false,
      segments: jasmine.any(Array)
    });
  });

  it("processes a complicated tree with the root specified", function() {
    var nonExecutable = new Leaf({ executable: false }),
        executable = new Leaf({ executable: true }),
        parent = new Node({ children: [nonExecutable, executable] }),
        childless = new Node(),
        childOfDisabled = new Leaf({ executable: true }),
        disabledNode = new Node({ executable: false, children: [childOfDisabled] }),
        root = new Node({ children: [parent, childless, disabledNode] }),
        processor = new j$.TreeProcessor({ tree: root, runnableIds: [root.id] }),
        result = processor.processTree();

    expect(result.valid).toBe(true);

    expect(result[root.id]).toEqual({
      executable: true,
      segments: jasmine.any(Array)
    });

    expect(result[childless.id]).toEqual({
      executable: false,
      segments: jasmine.any(Array)
    });

    expect(result[nonExecutable.id]).toEqual({
      executable: false,
      segments: jasmine.any(Array)
    });

    expect(result[executable.id]).toEqual({
      executable: true,
      segments: jasmine.any(Array)
    });

    expect(result[parent.id]).toEqual({
      executable: true,
      segments: jasmine.any(Array)
    });

    expect(result[disabledNode.id]).toEqual({
      executable: false,
      segments: jasmine.any(Array)
    });

    expect(result[childOfDisabled.id]).toEqual({
      executable: false,
      segments: jasmine.any(Array)
    });
  });

  it("marks the run order invalid if it would re-enter a node that does not allow re-entry", function() {
    var leaf1 = new Leaf(),
        leaf2 = new Leaf(),
        leaf3 = new Leaf(),
        reentered = new Node({ noReenter: true, children: [leaf1, leaf2] }),
        root = new Node({ children: [reentered, leaf3] }),
        processor = new j$.TreeProcessor({ tree: root, runnableIds: [leaf1.id, leaf3.id, leaf2.id] }),
        result = processor.processTree();

    expect(result).toEqual({ valid: false });
  });

  it("marks the run order valid if a node being re-entered allows re-entry", function() {
    var leaf1 = new Leaf(),
        leaf2 = new Leaf(),
        leaf3 = new Leaf(),
        reentered = new Node({ children: [leaf1, leaf2] }),
        root = new Node({ children: [reentered, leaf3] }),
        processor = new j$.TreeProcessor({ tree: root, runnableIds: [leaf1.id, leaf3.id, leaf2.id] }),
        result = processor.processTree();

    expect(result.valid).toBe(true);
  });

  it("marks the run order valid if a node which can't be re-entered is only entered once", function() {
    var leaf1 = new Leaf(),
        leaf2 = new Leaf(),
        leaf3 = new Leaf(),
        noReentry = new Node({ noReenter: true }),
        root = new Node({ children: [noReentry] }),
        processor = new j$.TreeProcessor({ tree: root, runnableIds: [leaf2.id, leaf1.id, leaf3.id] }),
        result = processor.processTree();

    expect(result.valid).toBe(true);
  });

  it("marks the run order valid if a node which can't be re-entered is run directly", function() {
    var leaf1 = new Leaf(),
        noReentry = new Node({ noReenter: true }),
        root = new Node({ children: [noReentry] }),
        processor = new j$.TreeProcessor({ tree: root, runnableIds: [root.id] }),
        result = processor.processTree();

    expect(result.valid).toBe(true);
  });

  it("runs a single leaf", function() {
    var leaf = new Leaf(),
        node = new Node({ children: [leaf] }),
        queueRunner = jasmine.createSpy('queueRunner'),
        processor = new j$.TreeProcessor({ tree: node, runnableIds: [leaf.id], queueRunnerFactory: queueRunner }),
        treeComplete = jasmine.createSpy('treeComplete');

    processor.execute(treeComplete);

    expect(queueRunner).toHaveBeenCalledWith({
      onComplete: treeComplete,
      onException: jasmine.any(Function),
      queueableFns: [{ fn: jasmine.any(Function) }]
    });

    queueRunner.calls.mostRecent().args[0].queueableFns[0].fn('foo');

    expect(leaf.execute).toHaveBeenCalledWith('foo', true);
  });

  it("runs a node with no children", function() {
    var node = new Node({ userContext: { node: 'context' } }),
        root = new Node({ children: [node] }),
        nodeStart = jasmine.createSpy('nodeStart'),
        nodeComplete = jasmine.createSpy('nodeComplete'),
        queueRunner = jasmine.createSpy('queueRunner'),
        processor = new j$.TreeProcessor({
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
      queueableFns: [{ fn: jasmine.any(Function) }]
    });

    queueRunner.calls.mostRecent().args[0].queueableFns[0].fn(nodeDone);

    expect(nodeStart).toHaveBeenCalledWith(node);
    expect(queueRunner).toHaveBeenCalledWith({
      onComplete: jasmine.any(Function),
      queueableFns: [],
      userContext: { node: 'context' },
      onException: jasmine.any(Function)
    });

    node.getResult.and.returnValue({ my: 'result' });

    queueRunner.calls.mostRecent().args[0].onComplete();
    expect(nodeComplete).toHaveBeenCalledWith(node, { my: 'result' });
    expect(nodeDone).toHaveBeenCalled();
  });

  it("runs a node with children", function() {
    var leaf1 = new Leaf(),
        leaf2 = new Leaf(),
        node = new Node({ children: [leaf1, leaf2] }),
        root = new Node({ children: [node] }),
        queueRunner = jasmine.createSpy('queueRunner'),
        processor = new j$.TreeProcessor({
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
    expect(queueableFns.length).toBe(2);

    queueableFns[0].fn('foo');
    expect(leaf1.execute).toHaveBeenCalledWith('foo', true);

    queueableFns[1].fn('bar');
    expect(leaf2.execute).toHaveBeenCalledWith('bar', true);
  });

  it("runs a disabled node", function() {
    var leaf1 = new Leaf(),
        node = new Node({ children: [leaf1], executable: false }),
        root = new Node({ children: [node] }),
        queueRunner = jasmine.createSpy('queueRunner'),
        nodeStart = jasmine.createSpy('nodeStart'),
        nodeComplete = jasmine.createSpy('nodeComplete'),
        processor = new j$.TreeProcessor({
          tree: root,
          runnableIds: [node.id],
          queueRunnerFactory: queueRunner,
          nodeStart: nodeStart,
          nodeComplete: nodeComplete
        }),
        treeComplete = jasmine.createSpy('treeComplete'),
        nodeDone = jasmine.createSpy('nodeDone');

    processor.execute(treeComplete);
    var queueableFns = queueRunner.calls.mostRecent().args[0].queueableFns;
    queueableFns[0].fn(nodeDone);

    expect(nodeStart).toHaveBeenCalledWith(node);

    queueableFns = queueRunner.calls.mostRecent().args[0].queueableFns;
    expect(queueableFns.length).toBe(1);

    queueableFns[0].fn('foo');
    expect(leaf1.execute).toHaveBeenCalledWith('foo', false);

    node.getResult.and.returnValue({ im: 'disabled' });

    queueRunner.calls.mostRecent().args[0].onComplete();
    expect(nodeComplete).toHaveBeenCalledWith(node, { im: 'disabled' });
  });

  it("runs beforeAlls for a node with children", function() {
    var leaf = new Leaf(),
        node = new Node({
          children: [leaf],
          beforeAllFns: ['beforeAll1', 'beforeAll2']
        }),
        root = new Node({ children: [node] }),
        queueRunner = jasmine.createSpy('queueRunner'),
        processor = new j$.TreeProcessor({
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

    expect(queueableFns).toEqual(['beforeAll1', 'beforeAll2', { fn: jasmine.any(Function) }]);
  });

  it("runs afterAlls for a node with children", function() {
    var leaf = new Leaf(),
        node = new Node({
          children: [leaf],
          afterAllFns: ['afterAll1', 'afterAll2']
        }),
        root = new Node({ children: [node] }),
        queueRunner = jasmine.createSpy('queueRunner'),
        processor = new j$.TreeProcessor({
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

    expect(queueableFns).toEqual([{ fn: jasmine.any(Function) }, 'afterAll1', 'afterAll2']);
  });

  it("does not run beforeAlls or afterAlls for a node with no children", function() {
    var node = new Node({
          beforeAllFns: ['before'],
          afterAllFns: ['after']
        }),
        root = new Node({ children: [node] }),
        queueRunner = jasmine.createSpy('queueRunner'),
        processor = new j$.TreeProcessor({
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

    expect(queueableFns).toEqual([]);
  });

  it("does not run beforeAlls or afterAlls for a disabled node", function() {
    var leaf = new Leaf(),
        node = new Node({
          children: [leaf],
          beforeAllFns: ['before'],
          afterAllFns: ['after'],
          executable: false
        }),
        root = new Node({ children: [node] }),
        queueRunner = jasmine.createSpy('queueRunner'),
        processor = new j$.TreeProcessor({
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

  it("runs leaves in the order specified", function() {
    var leaf1 = new Leaf(),
        leaf2 = new Leaf(),
        root = new Node({ children: [leaf1, leaf2] }),
        queueRunner = jasmine.createSpy('queueRunner'),
        processor = new j$.TreeProcessor({
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

  it("runs specified leaves before non-specified leaves", function() {
    var specified = new Leaf(),
        nonSpecified = new Leaf(),
        root = new Node({ children: [nonSpecified, specified] }),
        queueRunner = jasmine.createSpy('queueRunner'),
        processor = new j$.TreeProcessor({
          tree: root,
          runnableIds: [specified.id],
          queueRunnerFactory: queueRunner
        }),
        treeComplete = jasmine.createSpy('treeComplete');

    processor.execute(treeComplete);
    var queueableFns = queueRunner.calls.mostRecent().args[0].queueableFns;
    queueableFns[0].fn();

    expect(nonSpecified.execute).not.toHaveBeenCalled();
    expect(specified.execute).toHaveBeenCalledWith(undefined, true);

    queueableFns[1].fn();

    expect(nonSpecified.execute).toHaveBeenCalledWith(undefined, false);
  });

  it("runs nodes and leaves with a specified order", function() {
    var specifiedLeaf = new Leaf(),
        childLeaf = new Leaf(),
        specifiedNode = new Node({ children: [childLeaf] }),
        root = new Node({ children: [specifiedLeaf, specifiedNode] }),
        queueRunner = jasmine.createSpy('queueRunner'),
        processor = new j$.TreeProcessor({
          tree: root,
          runnableIds: [specifiedNode.id, specifiedLeaf.id],
          queueRunnerFactory: queueRunner
        });

    processor.execute();
    var queueableFns = queueRunner.calls.mostRecent().args[0].queueableFns;
    queueableFns[0].fn();

    expect(specifiedLeaf.execute).not.toHaveBeenCalled();
    var nodeQueueableFns = queueRunner.calls.mostRecent().args[0].queueableFns;
    nodeQueueableFns[0].fn();

    expect(childLeaf.execute).toHaveBeenCalled();

    queueableFns[1].fn();

    expect(specifiedLeaf.execute).toHaveBeenCalled();
  });

  it("runs a node multiple times if the order specified leaves and re-enters it", function() {
    var leaf1 = new Leaf(),
        leaf2 = new Leaf(),
        leaf3 = new Leaf(),
        leaf4 = new Leaf(),
        leaf5 = new Leaf(),
        reentered = new Node({ children: [leaf1, leaf2, leaf3] }),
        root = new Node({ children: [reentered, leaf4, leaf5] }),
        queueRunner = jasmine.createSpy('queueRunner'),
        processor = new j$.TreeProcessor({
          tree: root,
          runnableIds: [leaf1.id, leaf4.id, leaf2.id, leaf5.id, leaf3.id],
          queueRunnerFactory: queueRunner
        });

    processor.execute();
    var queueableFns = queueRunner.calls.mostRecent().args[0].queueableFns;
    expect(queueableFns.length).toBe(5);

    queueableFns[0].fn();
    expect(queueRunner.calls.mostRecent().args[0].queueableFns.length).toBe(1);
    queueRunner.calls.mostRecent().args[0].queueableFns[0].fn();
    expect(leaf1.execute).toHaveBeenCalled();

    queueableFns[1].fn();
    expect(leaf4.execute).toHaveBeenCalled();

    queueableFns[2].fn();
    expect(queueRunner.calls.count()).toBe(3);
    expect(queueRunner.calls.mostRecent().args[0].queueableFns.length).toBe(1);
    queueRunner.calls.mostRecent().args[0].queueableFns[0].fn();
    expect(leaf2.execute).toHaveBeenCalled();

    queueableFns[3].fn();
    expect(leaf5.execute).toHaveBeenCalled();

    queueableFns[4].fn();
    expect(queueRunner.calls.count()).toBe(4);
    expect(queueRunner.calls.mostRecent().args[0].queueableFns.length).toBe(1);
    queueRunner.calls.mostRecent().args[0].queueableFns[0].fn();
    expect(leaf3.execute).toHaveBeenCalled();
  });

  it("runs a parent of a node with segments correctly", function() {
    var leaf1 = new Leaf(),
        leaf2 = new Leaf(),
        leaf3 = new Leaf(),
        leaf4 = new Leaf(),
        leaf5 = new Leaf(),
        parent = new Node({ children: [leaf1, leaf2, leaf3] }),
        grandparent = new Node({ children: [parent] }),
        root = new Node({ children: [grandparent, leaf4, leaf5] }),
        queueRunner = jasmine.createSpy('queueRunner'),
        processor = new j$.TreeProcessor({
          tree: root,
          runnableIds: [leaf1.id, leaf4.id, leaf2.id, leaf5.id, leaf3.id],
          queueRunnerFactory: queueRunner
        });

    processor.execute();
    var queueableFns = queueRunner.calls.mostRecent().args[0].queueableFns;
    expect(queueableFns.length).toBe(5);

    queueableFns[0].fn();
    expect(queueRunner.calls.count()).toBe(2);
    expect(queueRunner.calls.mostRecent().args[0].queueableFns.length).toBe(1);

    queueRunner.calls.mostRecent().args[0].queueableFns[0].fn();
    expect(queueRunner.calls.count()).toBe(3);

    queueRunner.calls.mostRecent().args[0].queueableFns[0].fn();
    expect(leaf1.execute).toHaveBeenCalled();

    queueableFns[1].fn();
    expect(leaf4.execute).toHaveBeenCalled();

    queueableFns[2].fn();
    expect(queueRunner.calls.count()).toBe(4);
    expect(queueRunner.calls.mostRecent().args[0].queueableFns.length).toBe(1);

    queueRunner.calls.mostRecent().args[0].queueableFns[0].fn();
    expect(queueRunner.calls.count()).toBe(5);

    queueRunner.calls.mostRecent().args[0].queueableFns[0].fn();
    expect(leaf2.execute).toHaveBeenCalled();

    queueableFns[3].fn();
    expect(leaf5.execute).toHaveBeenCalled();

    queueableFns[4].fn();
    expect(queueRunner.calls.count()).toBe(6);
    expect(queueRunner.calls.mostRecent().args[0].queueableFns.length).toBe(1);

    queueRunner.calls.mostRecent().args[0].queueableFns[0].fn();
    expect(queueRunner.calls.count()).toBe(7);

    queueRunner.calls.mostRecent().args[0].queueableFns[0].fn();
    expect(leaf3.execute).toHaveBeenCalled();
  });

  it("runs nodes in the order they were declared", function() {
    var leaf1 = new Leaf(),
        leaf2 = new Leaf(),
        leaf3 = new Leaf(),
        parent = new Node({ children: [leaf2, leaf3] }),
        root = new Node({ children: [leaf1, parent] }),
        queueRunner = jasmine.createSpy('queueRunner'),
        processor = new j$.TreeProcessor({
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
    expect(childFns.length).toBe(2);
    childFns[0].fn();
    expect(leaf2.execute).toHaveBeenCalled();

    childFns[1].fn();
    expect(leaf3.execute).toHaveBeenCalled();
  });
});
