getJasmineRequireObj().DiffBuilder = function(j$, private$) {
  'use strict';

  class DiffBuilder {
    #prettyPrinter;
    #mismatches;
    #path;
    #actualRoot;
    #expectedRoot;

    constructor(config) {
      this.#prettyPrinter =
        (config || {}).prettyPrinter || private$.makePrettyPrinter();
      this.#mismatches = new private$.MismatchTree();
      this.#path = new private$.ObjectPath();
      this.#actualRoot = undefined;
      this.#expectedRoot = undefined;
    }

    setRoots(actual, expected) {
      this.#actualRoot = actual;
      this.#expectedRoot = expected;
    }

    recordMismatch(formatter) {
      this.#mismatches.add(this.#path, formatter);
    }

    getMessage() {
      const messages = [];

      this.#mismatches.traverse((path, isLeaf, formatter) => {
        const { actual, expected } = this.#dereferencePath(path);

        if (formatter) {
          messages.push(formatter(actual, expected, path, this.#prettyPrinter));
          return true;
        }

        const actualCustom = this.#prettyPrinter.applyCustomObjectFormatters(
          actual
        );
        const expectedCustom = this.#prettyPrinter.applyCustomObjectFormatters(
          expected
        );
        const useCustom =
          actualCustom !== undefined || expectedCustom !== undefined;

        if (useCustom) {
          const prettyActual = actualCustom || this.#prettyPrinter(actual);
          const prettyExpected =
            expectedCustom || this.#prettyPrinter(expected);
          messages.push(wrapPrettyPrinted(prettyActual, prettyExpected, path));
          return false; // don't recurse further
        }

        if (isLeaf) {
          messages.push(this.#defaultFormatter(actual, expected, path));
        }

        return true;
      });

      return messages.join('\n');
    }

    withPath(pathComponent, block) {
      const oldPath = this.#path;
      this.#path = this.#path.add(pathComponent);
      block();
      this.#path = oldPath;
    }

    #dereferencePath(objectPath) {
      let actual = this.#actualRoot;
      let expected = this.#expectedRoot;

      const handleAsymmetricExpected = () => {
        if (
          private$.isAsymmetricEqualityTester(expected) &&
          private$.isFunction(expected.valuesForDiff_)
        ) {
          const asymmetricResult = expected.valuesForDiff_(
            actual,
            this.#prettyPrinter
          );
          expected = asymmetricResult.self;
          actual = asymmetricResult.other;
        }
      };

      handleAsymmetricExpected();

      for (const pc of objectPath.components) {
        actual = actual[pc];
        expected = expected[pc];
        handleAsymmetricExpected();
      }

      return { actual: actual, expected: expected };
    }

    #defaultFormatter(actual, expected, path) {
      return wrapPrettyPrinted(
        this.#prettyPrinter(actual),
        this.#prettyPrinter(expected),
        path
      );
    }
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

  return DiffBuilder;
};
