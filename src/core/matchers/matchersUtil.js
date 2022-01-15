getJasmineRequireObj().MatchersUtil = function(j$) {
  /**
   * @class MatchersUtil
   * @classdesc Utilities for use in implementing matchers.<br>
   * _Note:_ Do not construct this directly. Jasmine will construct one and
   * pass it to matchers and asymmetric equality testers.
   * @hideconstructor
   */
  function MatchersUtil(options) {
    options = options || {};
    this.customTesters_ = options.customTesters || [];
    /**
     * Formats a value for use in matcher failure messages and similar contexts,
     * taking into account the current set of custom value formatters.
     * @function
     * @name MatchersUtil#pp
     * @since 3.6.0
     * @param {*} value The value to pretty-print
     * @return {string} The pretty-printed value
     */
    this.pp = options.pp || function() {};
  }

  /**
   * Determines whether `haystack` contains `needle`, using the same comparison
   * logic as {@link MatchersUtil#equals}.
   * @function
   * @name MatchersUtil#contains
   * @since 2.0.0
   * @param {*} haystack The collection to search
   * @param {*} needle The value to search for
   * @returns {boolean} True if `needle` was found in `haystack`
   */
  MatchersUtil.prototype.contains = function(haystack, needle) {
    if (!haystack) {
      return false;
    }

    if (j$.isSet(haystack)) {
      // Try .has() first. It should be faster in cases where
      // needle === something in haystack. Fall back to .equals() comparison
      // if that fails.
      if (haystack.has(needle)) {
        return true;
      }
    }

    if (j$.isIterable_(haystack) && !j$.isString_(haystack)) {
      // Arrays, Sets, etc.
      for (const candidate of haystack) {
        if (this.equals(candidate, needle)) {
          return true;
        }
      }

      return false;
    }

    if (haystack.indexOf) {
      // Mainly strings
      return haystack.indexOf(needle) >= 0;
    }

    if (j$.isNumber_(haystack.length)) {
      // Objects that are shaped like arrays but aren't iterable
      for (var i = 0; i < haystack.length; i++) {
        if (this.equals(haystack[i], needle)) {
          return true;
        }
      }
    }

    return false;
  };

  MatchersUtil.prototype.buildFailureMessage = function() {
    var self = this;
    var args = Array.prototype.slice.call(arguments, 0),
      matcherName = args[0],
      isNot = args[1],
      actual = args[2],
      expected = args.slice(3),
      englishyPredicate = matcherName.replace(/[A-Z]/g, function(s) {
        return ' ' + s.toLowerCase();
      });

    var message =
      'Expected ' +
      self.pp(actual) +
      (isNot ? ' not ' : ' ') +
      englishyPredicate;

    if (expected.length > 0) {
      for (var i = 0; i < expected.length; i++) {
        if (i > 0) {
          message += ',';
        }
        message += ' ' + self.pp(expected[i]);
      }
    }

    return message + '.';
  };

  MatchersUtil.prototype.asymmetricDiff_ = function(
    a,
    b,
    aStack,
    bStack,
    diffBuilder
  ) {
    if (j$.isFunction_(b.valuesForDiff_)) {
      var values = b.valuesForDiff_(a, this.pp);
      this.eq_(values.other, values.self, aStack, bStack, diffBuilder);
    } else {
      diffBuilder.recordMismatch();
    }
  };

  MatchersUtil.prototype.asymmetricMatch_ = function(
    a,
    b,
    aStack,
    bStack,
    diffBuilder
  ) {
    var asymmetricA = j$.isAsymmetricEqualityTester_(a),
      asymmetricB = j$.isAsymmetricEqualityTester_(b),
      result;

    if (asymmetricA === asymmetricB) {
      return undefined;
    }

    if (asymmetricA) {
      result = a.asymmetricMatch(b, this);
      if (!result) {
        diffBuilder.recordMismatch();
      }
      return result;
    }

    if (asymmetricB) {
      result = b.asymmetricMatch(a, this);
      if (!result) {
        this.asymmetricDiff_(a, b, aStack, bStack, diffBuilder);
      }
      return result;
    }
  };

  /**
   * Determines whether two values are deeply equal to each other.
   * @function
   * @name MatchersUtil#equals
   * @since 2.0.0
   * @param {*} a The first value to compare
   * @param {*} b The second value to compare
   * @returns {boolean} True if the values are equal
   */
  MatchersUtil.prototype.equals = function(a, b, diffBuilder) {
    diffBuilder = diffBuilder || j$.NullDiffBuilder();
    diffBuilder.setRoots(a, b);

    return this.eq_(a, b, [], [], diffBuilder);
  };

  // Equality function lovingly adapted from isEqual in
  //   [Underscore](http://underscorejs.org)
  MatchersUtil.prototype.eq_ = function(a, b, aStack, bStack, diffBuilder) {
    var result = true,
      self = this,
      i;

    var asymmetricResult = this.asymmetricMatch_(
      a,
      b,
      aStack,
      bStack,
      diffBuilder
    );
    if (!j$.util.isUndefined(asymmetricResult)) {
      return asymmetricResult;
    }

    for (i = 0; i < this.customTesters_.length; i++) {
      var customTesterResult = this.customTesters_[i](a, b);
      if (!j$.util.isUndefined(customTesterResult)) {
        if (!customTesterResult) {
          diffBuilder.recordMismatch();
        }
        return customTesterResult;
      }
    }

    if (a instanceof Error && b instanceof Error) {
      result = a.message == b.message;
      if (!result) {
        diffBuilder.recordMismatch();
      }
      return result;
    }

    // Identical objects are equal. `0 === -0`, but they aren't identical.
    // See the [Harmony `egal` proposal](http://wiki.ecmascript.org/doku.php?id=harmony:egal).
    if (a === b) {
      result = a !== 0 || 1 / a == 1 / b;
      if (!result) {
        diffBuilder.recordMismatch();
      }
      return result;
    }
    // A strict comparison is necessary because `null == undefined`.
    if (a === null || b === null) {
      result = a === b;
      if (!result) {
        diffBuilder.recordMismatch();
      }
      return result;
    }
    var className = Object.prototype.toString.call(a);
    if (className != Object.prototype.toString.call(b)) {
      diffBuilder.recordMismatch();
      return false;
    }
    switch (className) {
      // Strings, numbers, dates, and booleans are compared by value.
      case '[object String]':
        // Primitives and their corresponding object wrappers are equivalent; thus, `"5"` is
        // equivalent to `new String("5")`.
        result = a == String(b);
        if (!result) {
          diffBuilder.recordMismatch();
        }
        return result;
      case '[object Number]':
        // `NaN`s are equivalent, but non-reflexive. An `egal` comparison is performed for
        // other numeric values.
        result =
          a != +a ? b != +b : a === 0 && b === 0 ? 1 / a == 1 / b : a == +b;
        if (!result) {
          diffBuilder.recordMismatch();
        }
        return result;
      case '[object Date]':
      case '[object Boolean]':
        // Coerce dates and booleans to numeric primitive values. Dates are compared by their
        // millisecond representations. Note that invalid dates with millisecond representations
        // of `NaN` are not equivalent.
        result = +a == +b;
        if (!result) {
          diffBuilder.recordMismatch();
        }
        return result;
      case '[object ArrayBuffer]':
        // If we have an instance of ArrayBuffer the Uint8Array ctor
        // will be defined as well
        return self.eq_(
          new Uint8Array(a),
          new Uint8Array(b),
          aStack,
          bStack,
          diffBuilder
        );
      // RegExps are compared by their source patterns and flags.
      case '[object RegExp]':
        return (
          a.source == b.source &&
          a.global == b.global &&
          a.multiline == b.multiline &&
          a.ignoreCase == b.ignoreCase
        );
    }
    if (typeof a != 'object' || typeof b != 'object') {
      diffBuilder.recordMismatch();
      return false;
    }

    var aIsDomNode = j$.isDomNode(a);
    var bIsDomNode = j$.isDomNode(b);
    if (aIsDomNode && bIsDomNode) {
      // At first try to use DOM3 method isEqualNode
      result = a.isEqualNode(b);
      if (!result) {
        diffBuilder.recordMismatch();
      }
      return result;
    }
    if (aIsDomNode || bIsDomNode) {
      diffBuilder.recordMismatch();
      return false;
    }

    var aIsPromise = j$.isPromise(a);
    var bIsPromise = j$.isPromise(b);
    if (aIsPromise && bIsPromise) {
      return a === b;
    }

    // Assume equality for cyclic structures. The algorithm for detecting cyclic
    // structures is adapted from ES 5.1 section 15.12.3, abstract operation `JO`.
    var length = aStack.length;
    while (length--) {
      // Linear search. Performance is inversely proportional to the number of
      // unique nested structures.
      if (aStack[length] == a) {
        return bStack[length] == b;
      }
    }
    // Add the first object to the stack of traversed objects.
    aStack.push(a);
    bStack.push(b);
    var size = 0;
    // Recursively compare objects and arrays.
    // Compare array lengths to determine if a deep comparison is necessary.
    if (className == '[object Array]') {
      var aLength = a.length;
      var bLength = b.length;

      diffBuilder.withPath('length', function() {
        if (aLength !== bLength) {
          diffBuilder.recordMismatch();
          result = false;
        }
      });

      for (i = 0; i < aLength || i < bLength; i++) {
        diffBuilder.withPath(i, function() {
          if (i >= bLength) {
            diffBuilder.recordMismatch(
              actualArrayIsLongerFormatter.bind(null, self.pp)
            );
            result = false;
          } else {
            result =
              self.eq_(
                i < aLength ? a[i] : void 0,
                i < bLength ? b[i] : void 0,
                aStack,
                bStack,
                diffBuilder
              ) && result;
          }
        });
      }
      if (!result) {
        return false;
      }
    } else if (j$.isMap(a) && j$.isMap(b)) {
      if (a.size != b.size) {
        diffBuilder.recordMismatch();
        return false;
      }

      var keysA = [];
      var keysB = [];
      a.forEach(function(valueA, keyA) {
        keysA.push(keyA);
      });
      b.forEach(function(valueB, keyB) {
        keysB.push(keyB);
      });

      // For both sets of keys, check they map to equal values in both maps.
      // Keep track of corresponding keys (in insertion order) in order to handle asymmetric obj keys.
      var mapKeys = [keysA, keysB];
      var cmpKeys = [keysB, keysA];
      var mapIter, mapKey, mapValueA, mapValueB;
      var cmpIter, cmpKey;
      for (i = 0; result && i < mapKeys.length; i++) {
        mapIter = mapKeys[i];
        cmpIter = cmpKeys[i];

        for (var j = 0; result && j < mapIter.length; j++) {
          mapKey = mapIter[j];
          cmpKey = cmpIter[j];
          mapValueA = a.get(mapKey);

          // Only use the cmpKey when one of the keys is asymmetric and the corresponding key matches,
          // otherwise explicitly look up the mapKey in the other Map since we want keys with unique
          // obj identity (that are otherwise equal) to not match.
          if (
            j$.isAsymmetricEqualityTester_(mapKey) ||
            (j$.isAsymmetricEqualityTester_(cmpKey) &&
              this.eq_(mapKey, cmpKey, aStack, bStack, j$.NullDiffBuilder()))
          ) {
            mapValueB = b.get(cmpKey);
          } else {
            mapValueB = b.get(mapKey);
          }
          result = this.eq_(
            mapValueA,
            mapValueB,
            aStack,
            bStack,
            j$.NullDiffBuilder()
          );
        }
      }

      if (!result) {
        diffBuilder.recordMismatch();
        return false;
      }
    } else if (j$.isSet(a) && j$.isSet(b)) {
      if (a.size != b.size) {
        diffBuilder.recordMismatch();
        return false;
      }

      var valuesA = [];
      a.forEach(function(valueA) {
        valuesA.push(valueA);
      });
      var valuesB = [];
      b.forEach(function(valueB) {
        valuesB.push(valueB);
      });

      // For both sets, check they are all contained in the other set
      var setPairs = [[valuesA, valuesB], [valuesB, valuesA]];
      var stackPairs = [[aStack, bStack], [bStack, aStack]];
      var baseValues, baseValue, baseStack;
      var otherValues, otherValue, otherStack;
      var found;
      var prevStackSize;
      for (i = 0; result && i < setPairs.length; i++) {
        baseValues = setPairs[i][0];
        otherValues = setPairs[i][1];
        baseStack = stackPairs[i][0];
        otherStack = stackPairs[i][1];
        // For each value in the base set...
        for (var k = 0; result && k < baseValues.length; k++) {
          baseValue = baseValues[k];
          found = false;
          // ... test that it is present in the other set
          for (var l = 0; !found && l < otherValues.length; l++) {
            otherValue = otherValues[l];
            prevStackSize = baseStack.length;
            // compare by value equality
            found = this.eq_(
              baseValue,
              otherValue,
              baseStack,
              otherStack,
              j$.NullDiffBuilder()
            );
            if (!found && prevStackSize !== baseStack.length) {
              baseStack.splice(prevStackSize);
              otherStack.splice(prevStackSize);
            }
          }
          result = result && found;
        }
      }

      if (!result) {
        diffBuilder.recordMismatch();
        return false;
      }
    } else if (j$.isURL(a) && j$.isURL(b)) {
      // URLs have no enumrable properties, so the default object comparison
      // would consider any two URLs to be equal.
      return a.toString() === b.toString();
    } else {
      // Objects with different constructors are not equivalent, but `Object`s
      // or `Array`s from different frames are.
      var aCtor = a.constructor,
        bCtor = b.constructor;
      if (
        aCtor !== bCtor &&
        isFunction(aCtor) &&
        isFunction(bCtor) &&
        a instanceof aCtor &&
        b instanceof bCtor &&
        !(aCtor instanceof aCtor && bCtor instanceof bCtor)
      ) {
        diffBuilder.recordMismatch(
          constructorsAreDifferentFormatter.bind(null, this.pp)
        );
        return false;
      }
    }

    // Deep compare objects.
    var aKeys = keys(a, className == '[object Array]'),
      key;
    size = aKeys.length;

    // Ensure that both objects contain the same number of properties before comparing deep equality.
    if (keys(b, className == '[object Array]').length !== size) {
      diffBuilder.recordMismatch(
        objectKeysAreDifferentFormatter.bind(null, this.pp)
      );
      return false;
    }

    for (i = 0; i < size; i++) {
      key = aKeys[i];
      // Deep compare each member
      if (!j$.util.has(b, key)) {
        diffBuilder.recordMismatch(
          objectKeysAreDifferentFormatter.bind(null, this.pp)
        );
        result = false;
        continue;
      }

      diffBuilder.withPath(key, function() {
        if (!self.eq_(a[key], b[key], aStack, bStack, diffBuilder)) {
          result = false;
        }
      });
    }

    if (!result) {
      return false;
    }

    // Remove the first object from the stack of traversed objects.
    aStack.pop();
    bStack.pop();

    return result;
  };

  function keys(obj, isArray) {
    var allKeys = (function(o) {
      var keys = [];
      for (var key in o) {
        if (j$.util.has(o, key)) {
          keys.push(key);
        }
      }
      // eslint-disable-next-line compat/compat
      return keys.concat(Object.getOwnPropertySymbols(o));
    })(obj);

    if (!isArray) {
      return allKeys;
    }

    if (allKeys.length === 0) {
      return allKeys;
    }

    var extraKeys = [];
    for (var i = 0; i < allKeys.length; i++) {
      if (!/^[0-9]+$/.test(allKeys[i])) {
        extraKeys.push(allKeys[i]);
      }
    }

    return extraKeys;
  }

  function isFunction(obj) {
    return typeof obj === 'function';
  }

  function objectKeysAreDifferentFormatter(pp, actual, expected, path) {
    var missingProperties = j$.util.objectDifference(expected, actual),
      extraProperties = j$.util.objectDifference(actual, expected),
      missingPropertiesMessage = formatKeyValuePairs(pp, missingProperties),
      extraPropertiesMessage = formatKeyValuePairs(pp, extraProperties),
      messages = [];

    if (!path.depth()) {
      path = 'object';
    }

    if (missingPropertiesMessage.length) {
      messages.push(
        'Expected ' + path + ' to have properties' + missingPropertiesMessage
      );
    }

    if (extraPropertiesMessage.length) {
      messages.push(
        'Expected ' + path + ' not to have properties' + extraPropertiesMessage
      );
    }

    return messages.join('\n');
  }

  function constructorsAreDifferentFormatter(pp, actual, expected, path) {
    if (!path.depth()) {
      path = 'object';
    }

    return (
      'Expected ' +
      path +
      ' to be a kind of ' +
      j$.fnNameFor(expected.constructor) +
      ', but was ' +
      pp(actual) +
      '.'
    );
  }

  function actualArrayIsLongerFormatter(pp, actual, expected, path) {
    return (
      'Unexpected ' +
      path +
      (path.depth() ? ' = ' : '') +
      pp(actual) +
      ' in array.'
    );
  }

  function formatKeyValuePairs(pp, obj) {
    var formatted = '';
    for (var key in obj) {
      formatted += '\n    ' + key + ': ' + pp(obj[key]);
    }
    return formatted;
  }

  return MatchersUtil;
};

/**
 * @interface AsymmetricEqualityTester
 * @classdesc An asymmetric equality tester is an object that can match multiple
 * objects. Examples include jasmine.any() and jasmine.stringMatching(). Jasmine
 * includes a number of built-in asymmetric equality testers, such as
 * {@link jasmine.objectContaining}. User-defined asymmetric equality testers are
 * also supported.
 *
 * Asymmetric equality testers work with any matcher, including user-defined
 * custom matchers, that uses {@link MatchersUtil#equals} or
 * {@link MatchersUtil#contains}.
 *
 * @example
 * function numberDivisibleBy(divisor) {
 *   return {
 *     asymmetricMatch: function(n) {
 *       return typeof n === 'number' && n % divisor === 0;
 *     },
 *     jasmineToString: function() {
 *       return `<a number divisible by ${divisor}>`;
 *     }
 *   };
 * }
 *
 * var actual = {
 *   n: 2,
 *   otherFields: "don't care"
 * };
 *
 * expect(actual).toEqual(jasmine.objectContaining({n: numberDivisibleBy(2)}));
 * @see custom_asymmetric_equality_testers
 * @since 2.0.0
 */
/**
 * Determines whether a value matches this tester
 * @function
 * @name AsymmetricEqualityTester#asymmetricMatch
 * @param value {any} The value to test
 * @param matchersUtil {MatchersUtil} utilities for testing equality, etc
 * @return {Boolean}
 */
/**
 * Returns a string representation of this tester to use in matcher failure messages
 * @function
 * @name AsymmetricEqualityTester#jasmineToString
 * @param pp {function} Function that takes a value and returns a pretty-printed representation
 * @return {String}
 */
