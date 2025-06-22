getJasmineRequireObj().Anything = function(j$) {
  function Anything() {}

  Anything.prototype.asymmetricMatch = function(other) {
    return other !== undefined && other !== null;
  };

  Anything.prototype.jasmineToString = function() {
    return '<jasmine.anything>';
  };

  return Anything;
};
