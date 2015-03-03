getJasmineRequireObj().TreeProcessor = function() {
  function TreeProcessor(attrs) {
    var tree = attrs.tree,
        runnableIds = attrs.runnableIds,
        queueRunnerFactory = attrs.queueRunnerFactory,
        nodeStart = attrs.nodeStart || function() {},
        nodeComplete = attrs.nodeComplete || function() {},
        stats = { valid: true },
        processed = false,
        defaultMin = Infinity,
        defaultMax = 1 - Infinity;

    this.processTree = function() {
      processNode(tree, false);
      processed = true;
      return stats;
    };

    this.execute = function(done) {
      if (!processed) {
        this.processTree();
      }

      if (!stats.valid) {
        throw 'invalid order';
      }

      var childFns = wrapChildren(tree, 0);

      queueRunnerFactory({
        queueableFns: childFns,
        onException: function() {
          tree.onException.apply(tree, arguments);
        },
        onComplete: done
      });
    };

    function runnableIndex(id) {
      for (var i = 0; i < runnableIds.length; i++) {
        if (runnableIds[i] === id) {
          return i;
        }
      }
    }

    function processNode(node, parentEnabled) {
      var executableIndex = runnableIndex(node.id);

      if (executableIndex !== undefined) {
        parentEnabled = true;
      }

      parentEnabled = parentEnabled && node.isExecutable();

      if (!node.children) {
        stats[node.id] = {
          executable: parentEnabled && node.isExecutable(),
          segments: [{
            index: 0,
            owner: node,
            nodes: [node],
            min: startingMin(executableIndex),
            max: startingMax(executableIndex)
          }]
        };
      } else {
        var hasExecutableChild = false;

        for (var i = 0; i < node.children.length; i++) {
          var child = node.children[i];

          processNode(child, parentEnabled);

          if (!stats.valid) {
            return;
          }

          var childStats = stats[child.id];

          hasExecutableChild = hasExecutableChild || childStats.executable;
        }

        stats[node.id] = {
          executable: hasExecutableChild
        };

        segmentChildren(node, stats[node.id], executableIndex);

        if (!node.canBeReentered() && stats[node.id].segments.length > 1) {
          stats = { valid: false };
        }
      }
    }

    function startingMin(executableIndex) {
      return executableIndex === undefined ? defaultMin : executableIndex;
    }

    function startingMax(executableIndex) {
      return executableIndex === undefined ? defaultMax : executableIndex;
    }

    function segmentChildren(node, nodeStats, executableIndex) {
      var currentSegment = { index: 0, owner: node, nodes: [], min: startingMin(executableIndex), max: startingMax(executableIndex) },
          result = [currentSegment],
          lastMax = defaultMax,
          orderedChildSegments = orderChildSegments(node.children);

      function isSegmentBoundary(minIndex) {
        return lastMax !== defaultMax && minIndex !== defaultMin && lastMax < minIndex - 1;
      }

      for (var i = 0; i < orderedChildSegments.length; i++) {
        var childSegment = orderedChildSegments[i],
          maxIndex = childSegment.max,
          minIndex = childSegment.min;

        if (isSegmentBoundary(minIndex)) {
          currentSegment = {index: result.length, owner: node, nodes: [], min: defaultMin, max: defaultMax};
          result.push(currentSegment);
        }

        currentSegment.nodes.push(childSegment);
        currentSegment.min = Math.min(currentSegment.min, minIndex);
        currentSegment.max = Math.max(currentSegment.max, maxIndex);
        lastMax = maxIndex;
      }

      nodeStats.segments = result;
    }

    function orderChildSegments(children) {
      var result = [];

      for (var i = 0; i < children.length; i++) {
        var child = children[i],
            segments = stats[child.id].segments;

        for (var j = 0; j < segments.length; j++) {
          result.push(segments[j]);
        }
      }

      result.sort(function(a, b) {
        if (a.min === null) {
          return b.min === null ? 0 : 1;
        }

        if (b.min === null) {
          return -1;
        }

        return a.min - b.min;
      });

      return result;
    }

    function executeNode(node, segmentNumber) {
      if (node.children) {
        return {
          fn: function(done) {
            nodeStart(node);

            queueRunnerFactory({
              onComplete: function() {
                nodeComplete(node, node.getResult());
                done();
              },
              queueableFns: wrapChildren(node, segmentNumber),
              userContext: node.sharedUserContext(),
              onException: function() {
                node.onException.apply(node, arguments);
              }
            });
          }
        };
      } else {
        return {
          fn: function(done) { node.execute(done, stats[node.id].executable); }
        };
      }
    }

    function wrapChildren(node, segmentNumber) {
      var result = [],
          segmentChildren = stats[node.id].segments[segmentNumber].nodes;

      for (var i = 0; i < segmentChildren.length; i++) {
        result.push(executeNode(segmentChildren[i].owner, segmentChildren[i].index));
      }

      if (!stats[node.id].executable) {
        return result;
      }

      return node.beforeAllFns.concat(result).concat(node.afterAllFns);
    }
  }

  return TreeProcessor;
};
