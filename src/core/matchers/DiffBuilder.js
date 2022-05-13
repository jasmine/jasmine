getJasmineRequireObj().DiffBuilder = function(j$) {
  return function DiffBuilder(config) {
    const prettyPrinter =
      (config || {}).prettyPrinter || j$.makePrettyPrinter();
    const mismatches = new j$.MismatchTree();
    let path = new j$.ObjectPath();
    let actualRoot = undefined;
    let expectedRoot = undefined;

    return {
      setRoots: function(actual, expected) {
        actualRoot = actual;
        expectedRoot = expected;
      },

      recordMismatch: function(formatter) {
        mismatches.add(path, formatter);
      },

      getMessage: function() {
        const messages = [];

        mismatches.traverse(function(path, isLeaf, formatter) {
          const { actual, expected } = dereferencePath(
            path,
            actualRoot,
            expectedRoot,
            prettyPrinter
          );

          if (formatter) {
            messages.push(formatter(actual, expected, path, prettyPrinter));
            return true;
          }

          const actualCustom = prettyPrinter.customFormat_(actual);
          const expectedCustom = prettyPrinter.customFormat_(expected);
          const useCustom = !(
            j$.util.isUndefined(actualCustom) &&
            j$.util.isUndefined(expectedCustom)
          );

          if (useCustom) {
            messages.push(
              wrapPrettyPrinted(actualCustom, expectedCustom, path)
            );
            return false; // don't recurse further
          }

          if (isLeaf) {
            messages.push(
              defaultFormatter(actual, expected, path, prettyPrinter)
            );
          }

          return true;
        });

        return messages.join('\n');
      },

      withPath: function(pathComponent, block) {
        const oldPath = path;
        path = path.add(pathComponent);
        block();
        path = oldPath;
      }
    };

    function defaultFormatter(actual, expected, path, prettyPrinter) {
      return wrapPrettyPrinted(
        prettyPrinter(actual),
        prettyPrinter(expected),
        path
      );
    }

    function wrapPrettyPrinted(actual, expected, path) {
      return (
        'Expected ' +
        path +
        (path.depth() ? ' = ' : '') +
        actual +
        ' to equal ' +
        expected +
        '.'
      );
    }
  };

  function dereferencePath(objectPath, actual, expected, pp) {
    function handleAsymmetricExpected() {
      if (
        j$.isAsymmetricEqualityTester_(expected) &&
        j$.isFunction_(expected.valuesForDiff_)
      ) {
        const asymmetricResult = expected.valuesForDiff_(actual, pp);
        expected = asymmetricResult.self;
        actual = asymmetricResult.other;
      }
    }

    handleAsymmetricExpected();

    for (const pc of objectPath.components) {
      actual = actual[pc];
      expected = expected[pc];
      handleAsymmetricExpected();
    }

    return { actual: actual, expected: expected };
  }
};
