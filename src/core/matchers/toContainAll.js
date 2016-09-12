getJasmineRequireObj().toContainAll = function() {
  function toContainAll(util, customEqualityTesters) {
    customEqualityTesters = customEqualityTesters || [];

    return {
      compare: function(actual) {
        var expected = Array.prototype.slice.call(arguments, 1);

        if (j$.isArguments_(actual)) {
          actual = Array.prototype.slice.call(actual);
        }

        if (!j$.isArray_(actual)) {
          throw new Error('Expected an Array but got ' + j$.pp(actual));
        }

        return {
          pass: containsAll(actual, expected, customEqualityTesters)
        };
      }
    };

    function containsAll(haystack, needles, customEqualityTesters) {
      var needle, hay;

      if (needles.length > haystack.length) {
        return false;
      }

      haystack = haystack.slice(0);

      for (var n = 0; n < needles.length; n++) {
        needle = needles[n];

        for (var h = 0; h < haystack.length; h++) {
          hay = haystack[h];
          if (util.equals(hay, needle, customEqualityTesters)) {
            deleteAtIndex(h, haystack);
            break;
          }
          if (h === haystack.length - 1) {
            return false;
          }
        }
      }

      return true;
    }

    function deleteAtIndex(index, arr) {
      arr.splice(index, 1);
      return arr;
    }
  }

  return toContainAll;
};
