getJasmineRequireObj().matchersUtil = function(j$) {
  // TODO: what to do about jasmine.pp not being inject? move to JSON.stringify? gut PrettyPrinter?

  return {
    equals: equals,

    contains: function(haystack, needle, customTesters) {
      customTesters = customTesters || [];

      if (j$.isSet(haystack)) {
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
      result = a.isEqualNode(b);
      if (!result) {
        diffBuilder.record(a, b);
      }
      return result;
    }
    if (aIsDomNode || bIsDomNode) {
      diffBuilder.record(a, b);
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
      if (aStack[length] == a) { return bStack[length] == b; }
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
          diffBuilder.record(aLength, bLength);
          result = false;
        }
      });

      for (i = 0; i < aLength || i < bLength; i++) {
        diffBuilder.withPath(i, function() {
          if (i >= bLength) {
            diffBuilder.record(a[i], void 0, actualArrayIsLongerFormatter);
            result = false;
          } else {
            result = eq(i < aLength ? a[i] : void 0, i < bLength ? b[i] : void 0, aStack, bStack, customTesters, diffBuilder) && result;
          }
        });
      }
      if (!result) {
        return false;
      }
    } else if (j$.isMap(a) && j$.isMap(b)) {
      if (a.size != b.size) {
        diffBuilder.record(a, b);
        return false;
      }

      var keysA = [];
      var keysB = [];
      a.forEach( function( valueA, keyA ) {
        keysA.push( keyA );
      });
      b.forEach( function( valueB, keyB ) {
        keysB.push( keyB );
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
          if (isAsymmetric(mapKey) || isAsymmetric(cmpKey) &&
              eq(mapKey, cmpKey, aStack, bStack, customTesters, j$.NullDiffBuilder())) {
            mapValueB = b.get(cmpKey);
          } else {
            mapValueB = b.get(mapKey);
          }
          result = eq(mapValueA, mapValueB, aStack, bStack, customTesters, j$.NullDiffBuilder());
        }
      }

      if (!result) {
        diffBuilder.record(a, b);
        return false;
      }
    } else if (j$.isSet(a) && j$.isSet(b)) {
      if (a.size != b.size) {
        diffBuilder.record(a, b);
        return false;
      }

      var valuesA = [];
      a.forEach( function( valueA ) {
        valuesA.push( valueA );
      });
      var valuesB = [];
      b.forEach( function( valueB ) {
        valuesB.push( valueB );
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
            found = eq(baseValue, otherValue, baseStack, otherStack, customTesters, j$.NullDiffBuilder());
            if (!found && prevStackSize !== baseStack.length) {
              baseStack.splice(prevStackSize);
              otherStack.splice(prevStackSize);
            }
          }
          result = result && found;
        }
      }

      if (!result) {
        diffBuilder.record(a, b);
        return false;
      }
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

  function actualArrayIsLongerFormatter(actual, expected, path) {
    return 'Unexpected ' +
      path + (path.depth() ? ' = ' : '') +
      j$.pp(actual) +
      ' in array.';
  }

  function formatKeyValuePairs(obj) {
    var formatted = '';
    for (var key in obj) {
      formatted += '\n    ' + key + ': ' + j$.pp(obj[key]);
    }
    return formatted;
  }
};
