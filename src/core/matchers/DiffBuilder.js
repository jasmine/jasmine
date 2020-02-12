getJasmineRequireObj().DiffBuilder = function (j$) {
  return function DiffBuilder(config) {
    var prettyPrinter = (config || {}).prettyPrinter || j$.makePrettyPrinter(),
      mismatches = new j$.MismatchTree(),
      path = new j$.ObjectPath(),
      actualRoot = undefined,
      expectedRoot = undefined;

    return {
      setRoots: function (actual, expected) {
        actualRoot = actual;
        expectedRoot = expected;
      },

      recordMismatch: function (formatter) {
        mismatches.add(path, formatter);
      },

      getMessage: function () {
        var messages = [];

        mismatches.traverse(function (path, isLeaf, formatter) {
          var actualCustom, expectedCustom, useCustom,
            derefResult = dereferencePath(path, actualRoot, expectedRoot, prettyPrinter),
            actual = derefResult.actual,
            expected = derefResult.expected;

          if (formatter) {
            messages.push(formatter(actual, expected, path, prettyPrinter));
            return true;
          }

          actualCustom = prettyPrinter.customFormat_(actual);
          expectedCustom = prettyPrinter.customFormat_(expected);
          useCustom = !(j$.util.isUndefined(actualCustom) && j$.util.isUndefined(expectedCustom));

          if (useCustom) {
            messages.push(wrapPrettyPrinted(actualCustom, expectedCustom, path));
            return false; // don't recurse further
          }

          if (isLeaf) {
            messages.push(defaultFormatter(actual, expected, path, prettyPrinter));
          }

          return true;
        });

        return messages.join('\n');
      },

      withPath: function (pathComponent, block) {
        var oldPath = path;
        path = path.add(pathComponent);
        block();
        path = oldPath;
      }
    };

    function defaultFormatter(actual, expected, path, prettyPrinter) {
      return wrapPrettyPrinted(prettyPrinter(actual), prettyPrinter(expected), path);
    }

    function wrapPrettyPrinted(actual, expected, path) {
      return 'Expected ' +
        path + (path.depth() ? ' = ' : '') +
        actual +
        ' to equal ' +
        expected +
        '.';
    }
  };

  function dereferencePath(objectPath, actual, expected, pp) {
    var i, asymmetricResult

    for (i = 0; i < objectPath.components.length; i++) {
      actual = actual[objectPath.components[i]];
      expected = expected[objectPath.components[i]];

      if (j$.isAsymmetricEqualityTester_(expected) && j$.isFunction_(expected.valuesForDiff_)) {
        var asymmetricResult = expected.valuesForDiff_(actual, pp);
        expected = asymmetricResult.self;
        actual = asymmetricResult.other;
      }
    }

    return {actual: actual, expected: expected};
  }

};
