getJasmineRequireObj().DiffBuilder = function(j$) {
  'use strict';

  class DiffBuilder {
    constructor(config) {
      this.prettyPrinter_ =
        (config || {}).prettyPrinter || j$.makePrettyPrinter();
      this.mismatches_ = new j$.MismatchTree();
      this.path_ = new j$.ObjectPath();
      this.actualRoot_ = undefined;
      this.expectedRoot_ = undefined;
    }

    setRoots(actual, expected) {
      this.actualRoot_ = actual;
      this.expectedRoot_ = expected;
    }

    recordMismatch(formatter) {
      this.mismatches_.add(this.path_, formatter);
    }

    getMessage() {
      const messages = [];

      this.mismatches_.traverse((path, isLeaf, formatter) => {
        const { actual, expected } = this.dereferencePath_(path);

        if (formatter) {
          messages.push(formatter(actual, expected, path, this.prettyPrinter_));
          return true;
        }

        const actualCustom = this.prettyPrinter_.customFormat_(actual);
        const expectedCustom = this.prettyPrinter_.customFormat_(expected);
        const useCustom = !(
          j$.util.isUndefined(actualCustom) &&
          j$.util.isUndefined(expectedCustom)
        );

        if (useCustom) {
          messages.push(wrapPrettyPrinted(actualCustom, expectedCustom, path));
          return false; // don't recurse further
        }

        if (isLeaf) {
          messages.push(this.defaultFormatter_(actual, expected, path));
        }

        return true;
      });

      return messages.join('\n');
    }

    withPath(pathComponent, block) {
      const oldPath = this.path_;
      this.path_ = this.path_.add(pathComponent);
      block();
      this.path_ = oldPath;
    }

    dereferencePath_(objectPath) {
      let actual = this.actualRoot_;
      let expected = this.expectedRoot_;

      const handleAsymmetricExpected = () => {
        if (
          j$.isAsymmetricEqualityTester_(expected) &&
          j$.isFunction_(expected.valuesForDiff_)
        ) {
          const asymmetricResult = expected.valuesForDiff_(
            actual,
            this.prettyPrinter_
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

    defaultFormatter_(actual, expected, path) {
      return wrapPrettyPrinted(
        this.prettyPrinter_(actual),
        this.prettyPrinter_(expected),
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
