getJasmineRequireObj().TreeProcessor = function(j$) {
  const defaultMin = Infinity;
  const defaultMax = 1 - Infinity;

  class TreeProcessor {
    #tree;
    #executeTopSuite;
    #executeSpec;
    #executeSuiteSegment;
    #runnableIds;
    #orderChildren;
    #excludeNode;
    #stats;
    #processed;

    constructor(attrs) {
      this.#tree = attrs.tree;
      this.#runnableIds = attrs.runnableIds;
      this.#executeTopSuite = attrs.executeTopSuite;
      this.#executeSpec = attrs.executeSpec;
      this.#executeSuiteSegment = attrs.executeSuiteSegment;

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
      this.#stats = { valid: true };
      this.#processed = false;
    }

    processTree() {
      this.#processNode(this.#tree, true);
      this.#processed = true;
      return this.#stats;
    }

    async execute() {
      if (!this.#processed) {
        this.processTree();
      }

      if (!this.#stats.valid) {
        throw new Error('invalid order');
      }

      const wrappedChildren = this.#wrapChildren(this.#tree, 0);

      await new Promise(resolve => {
        this.#executeTopSuite(this.#tree, wrappedChildren, resolve);
      });
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

          if (!this.#stats.valid) {
            return;
          }

          const childStats = this.#stats[child.id];

          hasExecutableChild = hasExecutableChild || childStats.willExecute;
        }

        this.#stats[node.id] = {
          excluded: parentExcluded,
          willExecute: hasExecutableChild
        };

        segmentChildren(node, orderedChildren, this.#stats, executableIndex);

        if (this.#stats[node.id].segments.length > 1) {
          if (node.canBeReentered()) {
            j$.getEnv().deprecated(
              'The specified spec/suite order splits up a suite, running unrelated specs in the middle of it. This will become an error in a future release.'
            );
          } else {
            this.#stats = { valid: false };
            throw new Error(
              'Invalid order: would cause a beforeAll or afterAll to be run multiple times'
            );
          }
        }
      }
    }

    #wrapChildren(node, segmentNumber) {
      const result = [],
        segmentChildren = this.#stats[node.id].segments[segmentNumber].nodes;

      for (let i = 0; i < segmentChildren.length; i++) {
        result.push(
          this.#executeNode(segmentChildren[i].owner, segmentChildren[i].index)
        );
      }

      return result;
    }

    #executeNode(node, segmentNumber) {
      if (node.children) {
        return {
          fn: done => {
            const wrappedChildren = this.#wrapChildren(node, segmentNumber);
            const willExecute = this.#stats[node.id].willExecute;
            this.#executeSuiteSegment(node, willExecute, wrappedChildren, done);
          }
        };
      } else {
        return {
          fn: done => {
            this.#executeSpec(node, this.#stats[node.id].excluded, done);
          }
        };
      }
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
