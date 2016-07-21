getJasmineRequireObj().toEqual = function() {
  'use strict';

  function toEqual(util, customEqualityTesters) {
    customEqualityTesters = customEqualityTesters || [];

    return {
      compare: function(actual, expected) {
        var result = {
          pass: false
        };

        result.pass = util.equals(actual, expected, customEqualityTesters);

        if (!result.pass) {
          result.message = buildMessage(actual, expected);
        }

        return result;
      }
    };

    function buildMessage(actual, expected) {
      var defaultMessage = util.buildFailureMessage('toEqual', false, actual, expected),
        lineSeparator = '\n    ',
        keyPathRoot = '$';

      var messages = [defaultMessage];

      if (bothAreObjects(actual, expected)) {
        messages = messages.concat(findObjectProblems(actual, expected, keyPathRoot));
      } else if (bothAreArrays(actual, expected)) {
        messages = messages.concat(findArrayProblems(actual, expected, keyPathRoot));
      }

      return messages.join(lineSeparator);
    }

    function findObjectProblems(actual, expected, keyPath) {
      var problems = [],
        diff = diffKeySets(actual, expected);

      if (diff.missing.length > 0) {
        problems.push('Expected ' + keyPath + ' to have properties');
        problems = problems.concat(fieldSetMismatches(diff.missing, expected));
      }

      if (diff.extra.length > 0) {
        problems.push('Expected ' + keyPath + ' not to have properties');
        problems = problems.concat(fieldSetMismatches(diff.extra, actual));
      }

      if (diff.none) {
        for (var key in expected) {
          problems = problems.concat(recurseIntoSubObject(actual[key], expected[key], keyPath + '.' + key));
        }
      }

      return problems;
    }

    function findArrayProblems(actual, expected, keyPath) {
      var problems = [];

      if (actual.length != expected.length) {
        return ['Expected ' + keyPath + ' = Array[' + actual.length + '] to have length ' + expected.length];
      }

      for (var i = 0; i < actual.length; i++) {
        problems = problems.concat(recurseIntoSubObject(actual[i], expected[i], keyPath + '[' + i + ']'));
      }

      return problems;
    }

    function recurseIntoSubObject(actual, expected, keyPath) {
      var problems = [];

      if (util.equals(actual, expected)) {
        return problems;
      }

      if (bothAreObjects(actual, expected)) {
        problems = problems.concat(findObjectProblems(actual, expected, keyPath));
      } else if (bothAreArrays(actual, expected)) {
        problems = problems.concat(findArrayProblems(actual, expected, keyPath));
      } else {
        problems.push('Expected ' + keyPath + ' = ' + render(actual) + ' to equal ' + render(expected));
      }

      return problems;
    }

    function bothAreArrays(a, b) {
      return util.isArray(a) && util.isArray(b);
    }

    function bothAreObjects(a, b) {
      return util.isObject(a) && util.isObject(b);
    }

    function diffKeySets(actual, expected) {
      return util.diffStringArrays(
        util.keys(actual),
        util.keys(expected)
      );
    }
  }

  function fieldSetMismatches(difference, basisObject) {
    return map(difference, function(key) {
      return '    ' + key + ': ' + render(basisObject[key]);
    });
  }

  function render(object) {
    switch(Object.prototype.toString.call(object)) {
      case '[object String]':
        return '"' + object + '"';
      case '[object Array]':
        return '[object Array]';
      default:
        return object;
    }
  }

  function map(array, fn) {
    var accumulator = [], i;

    for (i = 0; i < array.length; i++) {
      accumulator.push(fn(array[i]));
    }

    return accumulator;
  }

  return toEqual;
};
