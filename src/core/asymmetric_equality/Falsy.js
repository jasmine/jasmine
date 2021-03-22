getJasmineRequireObj().Falsy = function(j$) {
  function Falsy() {}

  Falsy.prototype.asymmetricMatch = function(other) {
    return !other;
  };

  Falsy.prototype.jasmineToString = function() {
    return '<jasmine.falsy>';
  };

  return Falsy;
};
