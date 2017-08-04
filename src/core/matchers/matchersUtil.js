getJasmineRequireObj().matchersUtil = function(j$) {
  // TODO: what to do about jasmine.pp not being inject? move to JSON.stringify? gut PrettyPrinter?

  return {
    equals: equals,

    contains: function(haystack, needle, customTesters) {
      customTesters = customTesters || [];

      if ((Object.prototype.toString.apply(haystack) === '[object Set]')) {
        return haystack.has(needle);
      }

      if ((Object.prototype.toString.apply(haystack) === '[object Array]') ||
        (!!haystack && !haystack.indexOf))
      {
        for (var i = 0; i < haystack.length; i++) {
          if (equals(haystack[i], needle, customTesters)) {
            return true;
          }
        }
        return false;
      }

      return !!haystack && haystack.indexOf(needle) >= 0;
    },

    buildFailureMessage: function() {
      var args = Array.prototype.slice.call(arguments, 0),
        matcherName = args[0],
        isNot = args[1],
        actual = args[2],
        expected = args.slice(3),
        englishyPredicate = matcherName.replace(/[A-Z]/g, function(s) { return ' ' + s.toLowerCase(); });

      var message = 'Expected ' +
        j$.pp(actual) +
        (isNot ? ' not ' : ' ') +
        englishyPredicate;

      if (expected.length > 0) {
        for (var i = 0; i < expected.length; i++) {
          if (i > 0) {
            message += ',';
          }
          message += ' ' + j$.pp(expected[i]);
        }
      }

      return message + '.';
    }
  };

  function isAsymmetric(obj) {
    return obj && j$.isA_('Function', obj.asymmetricMatch);
  }

  function asymmetricMatch(a, b, customTesters, diffBuilder) {
    var asymmetricA = isAsymmetric(a),
        asymmetricB = isAsymmetric(b),
        result;

    if (asymmetricA && asymmetricB) {
      return undefined;
    }

    if (asymmetricA) {
      result = a.asymmetricMatch(b, customTesters);
      if (!result) {
        diffBuilder.record(a, b);
      }
      return result;
    }

    if (asymmetricB) {
      result = b.asymmetricMatch(a, customTesters);
      if (!result) {
        diffBuilder.record(a, b);
      }
      return result;
    }
  }

  function equals(a, b, customTesters, diffBuilder) {
    customTesters = customTesters || [];
    diffBuilder = diffBuilder || j$.NullDiffBuilder();

    return eq(a, b, [], [], customTesters, diffBuilder);
  }

  // Equality function lovingly adapted from isEqual in
  //   [Underscore](http://underscorejs.org)
  function eq(a, b, aStack, bStack, customTesters, diffBuilder) {
    var result = true, i;

    var asymmetricResult = asymmetricMatch(a, b, customTesters, diffBuilder);
    if (!j$.util.isUndefined(asymmetricResult)) {
      return asymmetricResult;
    }

    for (i = 0; i < customTesters.length; i++) {
      var customTesterResult = customTesters[i](a, b);
      if (!j$.util.isUndefined(customTesterResult)) {
        if (!customTesterResult) {
          diffBuilder.record(a, b);
        }
        return customTesterResult;
      }
    }

    if (a instanceof Error && b instanceof Error) {
      result = a.message == b.message;
      if (!result) {
        diffBuilder.record(a, b);
      }
      return result;
    }

    // Identical objects are equal. `0 === -0`, but they aren't identical.
    // See the [Harmony `egal` proposal](http://wiki.ecmascript.org/doku.php?id=harmony:egal).
    if (a === b) {
      result = a !== 0 || 1 / a == 1 / b;
      if (!result) {
        diffBuilder.record(a, b);
      }
      return result;
    }
    // A strict comparison is necessary because `null == undefined`.
    if (a === null || b === null) {
      result = a === b;
      if (!result) {
        diffBuilder.record(a, b);
      }
      return result;
    }
    var className = Object.prototype.toString.call(a);
    if (className != Object.prototype.toString.call(b)) {
      diffBuilder.record(a, b);
      return false;
    }
    switch (className) {
      // Strings, numbers, dates, and booleans are compared by value.
      case '[object String]':
        // Primitives and their corresponding object wrappers are equivalent; thus, `"5"` is
        // equivalent to `new String("5")`.
        result = a == String(b);
        if (!result) {
          diffBuilder.record(a, b);
        }
        return result;
      case '[object Number]':
        // `NaN`s are equivalent, but non-reflexive. An `egal` comparison is performed for
        // other numeric values.
        result = a != +a ? b != +b : (a === 0 ? 1 / a == 1 / b : a == +b);
        if (!result) {
          diffBuilder.record(a, b);
        }
        return result;
      case '[object Date]':
      case '[object Boolean]':
        // Coerce dates and booleans to numeric primitive values. Dates are compared by their
        // millisecond representations. Note that invalid dates with millisecond representations
        // of `NaN` are not equivalent.
        result = +a == +b;
        if (!result) {
          diffBuilder.record(a, b);
        }
        return result;
      // RegExps are compared by their source patterns and flags.
      case '[object RegExp]':
        return a.source == b.source &&
          a.global == b.global &&
          a.multiline == b.multiline &&
          a.ignoreCase == b.ignoreCase;
    }
    if (typeof a != 'object' || typeof b != 'object') {
      diffBuilder.record(a, b);
      return false;
    }

    var aIsDomNode = j$.isDomNode(a);
    var bIsDomNode = j$.isDomNode(b);
    if (aIsDomNode && bIsDomNode) {
      // At first try to use DOM3 method isEqualNode
      if (a.isEqualNode) {
        result = a.isEqualNode(b);
        if (!result) {
          diffBuilder.record(a, b);
        }
        return result;
      }
      // IE8 doesn't support isEqualNode, try to use outerHTML && innerText
      var aIsElement = a instanceof Element;
      var bIsElement = b instanceof Element;
      if (aIsElement && bIsElement) {
        result = a.outerHTML == b.outerHTML;
        if (!result) {
          diffBuilder.record(a, b);
        }
        return result;
      }
      if (aIsElement || bIsElement) {
        diffBuilder.record(a, b);
        return false;
      }
      result = a.innerText == b.innerText && a.textContent == b.textContent;
      if (!result) {
        diffBuilder.record(a, b);
      }
      return result;
    }
    if (aIsDomNode || bIsDomNode) {
      diffBuilder.record(a, b);
      return false;
    }

    // Assume equality for cyclic structures. The algorithm for detecting cyclic
    // structures is adapted from ES 5.1 section 15.12.3, abstract operation `JO`.
    var length = aStack.length;
    while (length--) {
      // Linear search. Performance is inversely proportional to the number of
      // unique nested structures.
      if (aStack[length] == a) { return bStack[length] == b; }
    }
    // Add the first object to the stack of traversed objects.
    aStack.push(a);
    bStack.push(b);
    var size = 0;
    // Recursively compare objects and arrays.
    // Compare array lengths to determine if a deep comparison is necessary.
    if (className == '[object Array]') {
      size = a.length;
      if (size !== b.length) {
        diffBuilder.record(a, b);
        return false;
      }

      for (i = 0; i < size; i++) {
        diffBuilder.withPath(i, function() {
          result = eq(a[i], b[i], aStack, bStack, customTesters, diffBuilder) && result;
        });
      }
      if (!result) {
        return false;
      }
    } else if (className == '[object Set]' || className == '[object Map]') {
      if (a.size != b.size) {
        diffBuilder.record(a, b);
        return false;
      }
      var iterA = a.entries(), iterB = b.entries();
      var valA, valB;
      do {
        valA = iterA.next();
        valB = iterB.next();
        if (!eq(valA.value, valB.value, aStack, bStack, customTesters, j$.NullDiffBuilder())) {
          diffBuilder.record(a, b);
          return false;
        }
      } while (!valA.done && !valB.done);
    } else {

      // Objects with different constructors are not equivalent, but `Object`s
      // or `Array`s from different frames are.
      var aCtor = a.constructor, bCtor = b.constructor;
      if (aCtor !== bCtor &&
          isFunction(aCtor) && isFunction(bCtor) &&
          a instanceof aCtor && b instanceof bCtor &&
          !(aCtor instanceof aCtor && bCtor instanceof bCtor)) {

        diffBuilder.record(a, b, constructorsAreDifferentFormatter);
        return false;
      }
    }

    // Deep compare objects.
    var aKeys = keys(a, className == '[object Array]'), key;
    size = aKeys.length;

    // Ensure that both objects contain the same number of properties before comparing deep equality.
    if (keys(b, className == '[object Array]').length !== size) {
      diffBuilder.record(a, b, objectKeysAreDifferentFormatter);
      return false;
    }

    for (i = 0; i < size; i++) {
      key = aKeys[i];
      // Deep compare each member
      if (!j$.util.has(b, key)) {
        diffBuilder.record(a, b, objectKeysAreDifferentFormatter);
        result = false;
        continue;
      }

      diffBuilder.withPath(key, function() {
        if(!eq(a[key], b[key], aStack, bStack, customTesters, diffBuilder)) {
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
  }

  function keys(obj, isArray) {
    var allKeys = Object.keys ? Object.keys(obj) :
      (function(o) {
          var keys = [];
          for (var key in o) {
              if (j$.util.has(o, key)) {
                  keys.push(key);
              }
          }
          return keys;
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

  function has(obj, key) {
    return Object.prototype.hasOwnProperty.call(obj, key);
  }

  function isFunction(obj) {
    return typeof obj === 'function';
  }

  function objectKeysAreDifferentFormatter(actual, expected, path) {
    var missingProperties = j$.util.objectDifference(expected, actual),
        extraProperties = j$.util.objectDifference(actual, expected),
        missingPropertiesMessage = formatKeyValuePairs(missingProperties),
        extraPropertiesMessage = formatKeyValuePairs(extraProperties),
        messages = [];

    if (!path.depth()) {
      path = 'object';
    }

    if (missingPropertiesMessage.length) {
      messages.push('Expected ' + path + ' to have properties' + missingPropertiesMessage);
    }

    if (extraPropertiesMessage.length) {
      messages.push('Expected ' + path + ' not to have properties' + extraPropertiesMessage);
    }

    return messages.join('\n');
  }

  function constructorsAreDifferentFormatter(actual, expected, path) {
    if (!path.depth()) {
      path = 'object';
    }

    return 'Expected ' +
      path + ' to be a kind of ' +
      j$.fnNameFor(expected.constructor) +
      ', but was ' + j$.pp(actual) + '.';
  }

  function formatKeyValuePairs(obj) {
    var formatted = '';
    for (var key in obj) {
      formatted += '\n    ' + key + ': ' + j$.pp(obj[key]);
    }
    return formatted;
  }
};
