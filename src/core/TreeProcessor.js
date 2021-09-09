getJasmineRequireObj().TreeProcessor = function() {
  function TreeProcessor(attrs) {
    var tree = attrs.tree,
      runnableIds = attrs.runnableIds,
      queueRunnerFactory = attrs.queueRunnerFactory,
      nodeStart = attrs.nodeStart || function() {},
      nodeComplete = attrs.nodeComplete || function() {},
      failSpecWithNoExpectations = !!attrs.failSpecWithNoExpectations,
      orderChildren =
        attrs.orderChildren ||
        function(node) {
          return node.children;
        },
      excludeNode =
        attrs.excludeNode ||
        function(node) {
          return false;
        },
      stats = { valid: true },
      processed = false,
      defaultMin = Infinity,
      defaultMax = 1 - Infinity;

    this.processTree = function() {
      processNode(tree, true);
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
        userContext: tree.sharedUserContext(),
        onException: function() {
          tree.onException.apply(tree, arguments);
        },
        onComplete: done,
        onMultipleDone: tree.onMultipleDone
          ? tree.onMultipleDone.bind(tree)
          : null
      });
    };

    function runnableIndex(id) {
      for (var i = 0; i < runnableIds.length; i++) {
        if (runnableIds[i] === id) {
          return i;
        }
      }
    }

    function processNode(node, parentExcluded) {
      var executableIndex = runnableIndex(node.id);

      if (executableIndex !== undefined) {
        parentExcluded = false;
      }

      if (!node.children) {
        var excluded = parentExcluded || excludeNode(node);
        stats[node.id] = {
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
        var hasExecutableChild = false;

        var orderedChildren = orderChildren(node);

        for (var i = 0; i < orderedChildren.length; i++) {
          var child = orderedChildren[i];

          processNode(child, parentExcluded);

          if (!stats.valid) {
            return;
          }

          var childStats = stats[child.id];

          hasExecutableChild = hasExecutableChild || childStats.willExecute;
        }

        stats[node.id] = {
          excluded: parentExcluded,
          willExecute: hasExecutableChild
        };

        segmentChildren(node, orderedChildren, stats[node.id], executableIndex);

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

    function segmentChildren(
      node,
      orderedChildren,
      nodeStats,
      executableIndex
    ) {
      var currentSegment = {
          index: 0,
          owner: node,
          nodes: [],
          min: startingMin(executableIndex),
          max: startingMax(executableIndex)
        },
        result = [currentSegment],
        lastMax = defaultMax,
        orderedChildSegments = orderChildSegments(orderedChildren);

      function isSegmentBoundary(minIndex) {
        return (
          lastMax !== defaultMax &&
          minIndex !== defaultMin &&
          lastMax < minIndex - 1
        );
      }

      for (var i = 0; i < orderedChildSegments.length; i++) {
        var childSegment = orderedChildSegments[i],
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

      nodeStats.segments = result;
    }

    function orderChildSegments(children) {
      var specifiedOrder = [],
        unspecifiedOrder = [];

      for (var i = 0; i < children.length; i++) {
        var child = children[i],
          segments = stats[child.id].segments;

        for (var j = 0; j < segments.length; j++) {
          var seg = segments[j];

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

    function executeNode(node, segmentNumber) {
      if (node.children) {
        return {
          fn: function(done) {
            var onStart = {
              fn: function(next) {
                nodeStart(node, next);
              }
            };

            queueRunnerFactory({
              onComplete: function() {
                var args = Array.prototype.slice.call(arguments, [0]);
                node.cleanupBeforeAfter();
                nodeComplete(node, node.getResult(), function() {
                  done.apply(undefined, args);
                });
              },
              queueableFns: [onStart].concat(wrapChildren(node, segmentNumber)),
              userContext: node.sharedUserContext(),
              onException: function() {
                node.onException.apply(node, arguments);
              },
              onMultipleDone: node.onMultipleDone
                ? node.onMultipleDone.bind(node)
                : null
            });
          }
        };
      } else {
        return {
          fn: function(done) {
            node.execute(
              done,
              stats[node.id].excluded,
              failSpecWithNoExpectations
            );
          }
        };
      }
    }

    function wrapChildren(node, segmentNumber) {
      var result = [],
        segmentChildren = stats[node.id].segments[segmentNumber].nodes;

      for (var i = 0; i < segmentChildren.length; i++) {
        result.push(
          executeNode(segmentChildren[i].owner, segmentChildren[i].index)
        );
      }

      if (!stats[node.id].willExecute) {
        return result;
      }

      return node.beforeAllFns.concat(result).concat(node.afterAllFns);
    }
  }

  return TreeProcessor;
};
