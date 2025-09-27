getJasmineRequireObj().TreeProcessor = function(j$) {
  const defaultMin = Infinity;
  const defaultMax = 1 - Infinity;

  // Transforms the suite tree into an execution tree, which represents the set
  // of specs and suites to be run in the order they are to be run in.
  class TreeProcessor {
    #tree;
    #runnableIds;
    #orderChildren;
    #excludeNode;
    #stats;

    constructor(attrs) {
      this.#tree = attrs.tree;
      this.#runnableIds = attrs.runnableIds;

      this.#orderChildren =
        attrs.orderChildren ||
        function(node) {
          return node.children;
        };
      this.#excludeNode =
        attrs.excludeNode ||
        function(node) {
          return false;
        };
    }

    processTree() {
      this.#stats = {};
      this.#processNode(this.#tree, true);
      const result = new ExecutionTree(this.#tree, this.#stats);
      this.#stats = null;
      return result;
    }

    #runnableIndex(id) {
      for (let i = 0; i < this.#runnableIds.length; i++) {
        if (this.#runnableIds[i] === id) {
          return i;
        }
      }
    }

    #processNode(node, parentExcluded) {
      const executableIndex = this.#runnableIndex(node.id);

      if (executableIndex !== undefined) {
        parentExcluded = false;
      }

      if (!node.children) {
        const excluded = parentExcluded || this.#excludeNode(node);
        this.#stats[node.id] = {
          excluded: excluded,
          willExecute: !excluded && !node.markedPending,
          segments: [
            {
              index: 0,
              owner: node,
              nodes: [node],
              min: startingMin(executableIndex),
              max: startingMax(executableIndex)
            }
          ]
        };
      } else {
        let hasExecutableChild = false;

        const orderedChildren = this.#orderChildren(node);

        for (let i = 0; i < orderedChildren.length; i++) {
          const child = orderedChildren[i];
          this.#processNode(child, parentExcluded);
          const childStats = this.#stats[child.id];
          hasExecutableChild = hasExecutableChild || childStats.willExecute;
        }

        this.#stats[node.id] = {
          excluded: parentExcluded,
          willExecute: hasExecutableChild
        };

        segmentChildren(node, orderedChildren, this.#stats, executableIndex);

        if (this.#stats[node.id].segments.length > 1) {
          throw new Error('Invalid order: would split up a suite');
        }
      }
    }
  }

  class ExecutionTree {
    #stats;

    constructor(topSuite, stats) {
      Object.defineProperty(this, 'topSuite', {
        writable: false,
        value: topSuite
      });
      this.#stats = stats;
    }

    childrenOfTopSuite() {
      return this.childrenOfSuite(this.topSuite);
    }

    childrenOfSuite(suite) {
      const segmentChildren = this.#stats[suite.id].segments[0].nodes;
      return segmentChildren.map(function(child) {
        if (child.owner.children) {
          return { suite: child.owner };
        } else {
          return { spec: child.owner };
        }
      });
    }

    isExcluded(node) {
      const nodeStats = this.#stats[node.id];
      return node.children ? !nodeStats.willExecute : nodeStats.excluded;
    }
  }

  function segmentChildren(node, orderedChildren, stats, executableIndex) {
    let currentSegment = {
        index: 0,
        owner: node,
        nodes: [],
        min: startingMin(executableIndex),
        max: startingMax(executableIndex)
      },
      result = [currentSegment],
      lastMax = defaultMax,
      orderedChildSegments = orderChildSegments(orderedChildren, stats);

    function isSegmentBoundary(minIndex) {
      return (
        lastMax !== defaultMax &&
        minIndex !== defaultMin &&
        lastMax < minIndex - 1
      );
    }

    for (let i = 0; i < orderedChildSegments.length; i++) {
      const childSegment = orderedChildSegments[i],
        maxIndex = childSegment.max,
        minIndex = childSegment.min;

      if (isSegmentBoundary(minIndex)) {
        currentSegment = {
          index: result.length,
          owner: node,
          nodes: [],
          min: defaultMin,
          max: defaultMax
        };
        result.push(currentSegment);
      }

      currentSegment.nodes.push(childSegment);
      currentSegment.min = Math.min(currentSegment.min, minIndex);
      currentSegment.max = Math.max(currentSegment.max, maxIndex);
      lastMax = maxIndex;
    }

    stats[node.id].segments = result;
  }

  function orderChildSegments(children, stats) {
    const specifiedOrder = [],
      unspecifiedOrder = [];

    for (let i = 0; i < children.length; i++) {
      const child = children[i],
        segments = stats[child.id].segments;

      for (let j = 0; j < segments.length; j++) {
        const seg = segments[j];

        if (seg.min === defaultMin) {
          unspecifiedOrder.push(seg);
        } else {
          specifiedOrder.push(seg);
        }
      }
    }

    specifiedOrder.sort(function(a, b) {
      return a.min - b.min;
    });

    return specifiedOrder.concat(unspecifiedOrder);
  }

  function startingMin(executableIndex) {
    return executableIndex === undefined ? defaultMin : executableIndex;
  }

  function startingMax(executableIndex) {
    return executableIndex === undefined ? defaultMax : executableIndex;
  }

  return TreeProcessor;
};
