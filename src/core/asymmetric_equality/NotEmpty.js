getJasmineRequireObj().NotEmpty = function(j$) {
  function NotEmpty() {}

  NotEmpty.prototype.asymmetricMatch = function(other) {
    if (
      j$.private.isString(other) ||
      j$.private.isArray(other) ||
      j$.private.isTypedArray(other)
    ) {
      return other.length !== 0;
    }

    if (j$.private.isMap(other) || j$.private.isSet(other)) {
      return other.size !== 0;
    }

    if (j$.private.isObject(other)) {
      return Object.keys(other).length !== 0;
    }

    return false;
  };

  NotEmpty.prototype.jasmineToString = function() {
    return '<jasmine.notEmpty>';
  };

  return NotEmpty;
};
