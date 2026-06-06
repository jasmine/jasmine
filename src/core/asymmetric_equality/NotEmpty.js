getJasmineRequireObj().NotEmpty = function(j$, private$) {
  'use strict';

  function NotEmpty() {}

  NotEmpty.prototype.asymmetricMatch = function(other) {
    if (
      private$.isString(other) ||
      Array.isArray(other) ||
      private$.isTypedArray(other)
    ) {
      return other.length !== 0;
    }

    if (private$.isMap(other) || private$.isSet(other)) {
      return other.size !== 0;
    }

    if (private$.isObject(other)) {
      return Object.keys(other).length !== 0;
    }

    return false;
  };

  NotEmpty.prototype.jasmineToString = function() {
    return '<jasmine.notEmpty>';
  };

  return NotEmpty;
};
