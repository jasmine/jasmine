describe('TreeProcessor', function() {
  let nodeNumber = 0,
    leafNumber = 0;

  function Node(attrs) {
    attrs = attrs || {};
    this.id = 'node' + nodeNumber++;
    this.children = attrs.children || [];
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
      processor = new privateUnderTest.TreeProcessor({
        tree: leaf,
        runnableIds: [leaf.id]
      });

    const result = processor.processTree();

    expect(result.isExcluded(leaf)).toEqual(false);
  });

  it('processes a single pending leaf', function() {
    const leaf = new Leaf({ markedPending: true }),
      processor = new privateUnderTest.TreeProcessor({
        tree: leaf,
        runnableIds: [leaf.id]
      });

    const result = processor.processTree();

    expect(result.isExcluded(leaf)).toEqual(false);
  });

  it('processes a single non-specified leaf', function() {
    const leaf = new Leaf(),
      processor = new privateUnderTest.TreeProcessor({
        tree: leaf,
        runnableIds: []
      });

    const result = processor.processTree();

    expect(result.isExcluded(leaf)).toEqual(true);
  });

  it('processes a single excluded leaf', function() {
    const leaf = new Leaf(),
      processor = new privateUnderTest.TreeProcessor({
        tree: leaf,
        runnableIds: [leaf.id],
        excludeNode: function() {
          return true;
        }
      });

    const result = processor.processTree();

    expect(result.isExcluded(leaf)).toEqual(true);
  });

  it('processes a tree with a single leaf with the root specified', function() {
    const leaf = new Leaf(),
      parent = new Node({ children: [leaf] }),
      processor = new privateUnderTest.TreeProcessor({
        tree: parent,
        runnableIds: [parent.id]
      });

    const result = processor.processTree();

    expect(result.isExcluded(parent)).toEqual(false);
    expect(result.childrenOfTopSuite()).toEqual([{ spec: leaf }]);
    expect(result.isExcluded(leaf)).toEqual(false);
  });

  it('processes a tree with a single pending leaf, with the root specified', function() {
    const leaf = new Leaf({ markedPending: true }),
      parent = new Node({ children: [leaf] }),
      processor = new privateUnderTest.TreeProcessor({
        tree: parent,
        runnableIds: [parent.id]
      });

    const result = processor.processTree();

    expect(result.isExcluded(parent)).toEqual(true);
    expect(result.childrenOfTopSuite()).toEqual([{ spec: leaf }]);
    expect(result.isExcluded(leaf)).toEqual(false);
  });

  it('runs orders leaves before non-specified leaves within a parent node', function() {
    const specified = new Leaf();
    const nonSpecified = new Leaf();
    const root = new Node({ children: [nonSpecified, specified] });
    const processor = new privateUnderTest.TreeProcessor({
      tree: root,
      runnableIds: [specified.id]
    });

    const result = processor.processTree();

    expect(result.childrenOfTopSuite()).toEqual([
      { spec: specified },
      { spec: nonSpecified }
    ]);
  });

  it('processes an excluded node with children', function() {
    const leaf1 = new Leaf();
    const node = new Node({ children: [leaf1] });
    const root = new Node({ children: [node] });
    const processor = new privateUnderTest.TreeProcessor({
      tree: root,
      runnableIds: []
    });

    const result = processor.processTree();

    expect(result.childrenOfTopSuite()).toEqual([{ suite: node }]);
    expect(result.isExcluded(node)).toEqual(true);
    expect(result.childrenOfSuite(node)).toEqual([{ spec: leaf1 }]);
    expect(result.isExcluded(node)).toEqual(true);
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
      processor = new privateUnderTest.TreeProcessor({
        tree: root,
        runnableIds: [root.id]
      });

    const result = processor.processTree();

    expect(result.isExcluded(parent)).toEqual(false);
    expect(result.childrenOfTopSuite()).toEqual([
      { suite: parent },
      { suite: parentOfPendings }
    ]);

    expect(result.isExcluded(parentOfPendings)).toEqual(true);
    expect(result.childrenOfSuite(parentOfPendings)).toEqual([
      { suite: childless },
      { suite: pendingNode }
    ]);

    expect(result.isExcluded(childless)).toEqual(true);
    expect(result.childrenOfSuite(childless)).toEqual([]);

    expect(result.isExcluded(pendingLeaf)).toEqual(false);
    expect(result.isExcluded(executableLeaf)).toEqual(false);

    expect(result.isExcluded(parent)).toEqual(false);
    expect(result.childrenOfSuite(parent)).toEqual([
      { spec: pendingLeaf },
      { spec: executableLeaf }
    ]);

    expect(result.isExcluded(pendingNode)).toEqual(true);
    expect(result.childrenOfSuite(pendingNode)).toEqual([
      { spec: childOfPending }
    ]);

    expect(result.isExcluded(childOfPending)).toEqual(false);
  });

  it('orders children according to orderChildren when specified', function() {
    const leaf1 = new Leaf();
    const leaf2 = new Leaf();
    const leaf3 = new Leaf();
    const leaf4 = new Leaf();
    const leaf5 = new Leaf();
    const leaf6 = new Leaf();
    const leaf7 = new Leaf();
    const leaf8 = new Leaf();
    const leaf9 = new Leaf();
    const leaf10 = new Leaf();
    const leaf11 = new Leaf();
    const root = new Node({
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
    });
    const runQueue = jasmine.createSpy('runQueue');
    const processor = new privateUnderTest.TreeProcessor({
      tree: root,
      runnableIds: [root.id],
      runQueue,
      orderChildren: function(node) {
        const children = node.children.slice();
        return children.reverse();
      }
    });

    const result = processor.processTree();

    expect(result.childrenOfTopSuite()).toEqual([
      { spec: leaf11 },
      { spec: leaf10 },
      { spec: leaf9 },
      { spec: leaf8 },
      { spec: leaf7 },
      { spec: leaf6 },
      { spec: leaf5 },
      { spec: leaf4 },
      { spec: leaf3 },
      { spec: leaf2 },
      { spec: leaf1 }
    ]);
  });
});
