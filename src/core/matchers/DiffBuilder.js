getJasmineRequireObj().DiffBuilder = function(j$) {
  return function DiffBuilder(config) {
    var prettyPrinter = (config || {}).prettyPrinter || j$.makePrettyPrinter(),
      mismatches = new j$.MismatchTree(),
      path = new j$.ObjectPath(),
      actualRoot = undefined,
      expectedRoot = undefined;

    return {
      setRoots: function(actual, expected) {
        actualRoot = actual;
        expectedRoot = expected;
      },

      recordMismatch: function(formatter) {
        mismatches.add(path, formatter);
      },

      getMessage: function() {
        var messages = [];

        mismatches.traverse(function(path, isLeaf, formatter) {
          var actualCustom,
            expectedCustom,
            useCustom,
            derefResult = dereferencePath(
              path,
              actualRoot,
              expectedRoot,
              prettyPrinter
            );
          var shortened = shortenStrings(
            derefResult.actual,
            derefResult.expected
          );
          var actual = shortened.shortenedActual;
          var expected = shortened.shortenedExpected;

          if (formatter) {
            messages.push(formatter(actual, expected, path, prettyPrinter));
            return true;
          }

          actualCustom = prettyPrinter.customFormat_(actual);
          expectedCustom = prettyPrinter.customFormat_(expected);
          useCustom = !(
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
        var oldPath = path;
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
        var asymmetricResult = expected.valuesForDiff_(actual, pp);
        expected = asymmetricResult.self;
        actual = asymmetricResult.other;
      }
    }

    var i;
    handleAsymmetricExpected();

    for (i = 0; i < objectPath.components.length; i++) {
      actual = actual[objectPath.components[i]];
      expected = expected[objectPath.components[i]];
      handleAsymmetricExpected();
    }

    return { actual: actual, expected: expected };
  }

  function shortenStrings(actual, expected) {
    if (!(typeof actual === 'string' && typeof expected === 'string')) {
      return { shortenedActual: actual, shortenedExpected: expected };
    }
    var shortened = shortenValues(actual, expected);
    var shortenedActual = shortened.actual;
    var shortenedExpected = shortened.expected;
    return {
      shortenedActual: shortenedActual,
      shortenedExpected: shortenedExpected
    };
  }

  /**
   * Builds shortened versions of `actual` and `expected`, such that their
   * difference is easily visible.
   * @param {!string} actual
   * @param {!string} expected
   * @return {object}
   */
  function shortenValues(actual, expected) {
    var iofdc = getIndexOfFirstDifferentCharacter(actual, expected);
    var prettyActual = getStringAbout(actual, iofdc);
    var prettyExpected = getStringAbout(expected, iofdc);
    return { actual: prettyActual, expected: prettyExpected };

    /**
     * Returns index of first different character among `a` and `b`. If either
     * is an initial substring (a substring starting at index 0) of the other,
     * `-1` is returned. If `a == b`, `-1` is returned.
     * @param {string} a
     * @param {string} b
     */
    function getIndexOfFirstDifferentCharacter(a, b) {
      var shortestLength = Math.min(a.length, b.length);
      for (var i = 0; i < shortestLength; i++) {
        var aChar = a[i];
        var bChar = b[i];
        if (aChar !== bChar) {
          return i;
        }
      }
      return -1;
    }

    /**
     * Returns a string containing: 1) a substring of `str` of maximum
     * `MAX_LENGTH` characters about index `center`, 2) if applicable, an
     * indication of the number of omitted leading characters and 3) if
     * applicable, an indication of the number of omitted trailing characters.
     * For example, given that `str = '01234567890123456789'`, `center= 10`
     * and `MAX_LENGTH = 3` the return value would be `"[9 omitted
     * characters]...901...[8 omitted characters]"`. If `center` is not a
     * valid index for `str`, `0` is used instead.
     * @param {string} str
     * @param {number} center
     * @param {number=80} MAX_LENGTH
     */
    function getStringAbout(str, center, MAX_LENGTH) {
      if (!MAX_LENGTH) {
        MAX_LENGTH = 80;
      }
      var length = str.length;
      if (!(0 <= center && center < length)) {
        center = 0;
      }
      var half = MAX_LENGTH / 2;
      var isEven = isInteger(half);
      var flooredHalf = Math.floor(half);
      var allowedLeft = flooredHalf - isEven;
      var allowedRight = flooredHalf;
      var availableLeft = center;
      var availableRight = length - center - 1;
      var actualLeft = Math.min(allowedLeft, availableLeft);
      var actualRight = Math.min(allowedRight, availableRight);
      var omittedLeft = availableLeft - actualLeft;
      var omittedRight = availableRight - actualRight;
      var omittedLeftIndicator = getOmittedCharactersIndicator(
        omittedLeft,
        'left'
      );
      var omittedRightIndicator = getOmittedCharactersIndicator(
        omittedRight,
        'right'
      );
      var substring = str.substr(center - actualLeft, MAX_LENGTH);
      return omittedLeftIndicator + substring + omittedRightIndicator;

      function isInteger(value) {
        return (
          typeof value === 'number' &&
          isFinite(value) &&
          Math.floor(value) === value
        );
      }

      function getOmittedCharactersIndicator(number, side) {
        var message;
        if (number === 0) {
          return '';
        } else if (number === 1) {
          message = '1 omitted character';
        } else {
          message = number + ' omitted characters';
        }
        if (side === 'left') {
          return '[' + message + '...]';
        } else {
          return '[...' + message + ']';
        }
      }
    }
  }
};
