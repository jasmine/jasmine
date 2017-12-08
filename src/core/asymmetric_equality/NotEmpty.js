getJasmineRequireObj().NotEmpty = function (j$) {

  function NotEmpty() {}

  NotEmpty.prototype.asymmetricMatch = function (other) {
    if (typeof other === 'string') {
      return other.length !== 0;
    }

    if (other instanceof Array) {
      return other.length !== 0;
    }

    if (typeof Map !== 'undefined' && other instanceof Map) {
      return other.size !== 0;
    }

    if (typeof Set !== 'undefined' && other instanceof Set) {
      return other.size !== 0;
    }

    if (other instanceof Object) {
      return Object.keys(other).length !== 0;
    }

    return false;
  };

  NotEmpty.prototype.jasmineToString = function () {
    return '<jasmine.notEmpty>';
  };

  return NotEmpty;
};
