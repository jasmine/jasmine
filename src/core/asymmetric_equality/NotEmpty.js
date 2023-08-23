getJasmineRequireObj().NotEmpty = function(j$) {
  'use strict';

  function NotEmpty() {}

  NotEmpty.prototype.asymmetricMatch = function(other) {
    if (j$.isString_(other) || j$.isArray_(other) || j$.isTypedArray_(other)) {
      return other.length !== 0;
    }

    if (j$.isMap(other) || j$.isSet(other)) {
      return other.size !== 0;
    }

    if (j$.isObject_(other)) {
      return Object.keys(other).length !== 0;
    }

    return false;
  };

  NotEmpty.prototype.jasmineToString = function() {
    return '<jasmine.notEmpty>';
  };

  return NotEmpty;
};
