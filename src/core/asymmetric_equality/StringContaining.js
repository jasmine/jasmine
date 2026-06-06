getJasmineRequireObj().StringContaining = function(j$, private$) {
  'use strict';

  function StringContaining(expected) {
    if (!private$.isString(expected)) {
      throw new Error('Expected is not a String');
    }

    this.expected = expected;
  }

  StringContaining.prototype.asymmetricMatch = function(other) {
    if (!private$.isString(other)) {
      // Arrays, etc. don't match no matter what their indexOf returns.
      return false;
    }

    return other.indexOf(this.expected) !== -1;
  };

  StringContaining.prototype.jasmineToString = function() {
    return '<jasmine.stringContaining("' + this.expected + '")>';
  };

  return StringContaining;
};
