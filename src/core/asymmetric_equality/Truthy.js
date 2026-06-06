getJasmineRequireObj().Truthy = function(j$, private$) {
  'use strict';

  function Truthy() {}

  Truthy.prototype.asymmetricMatch = function(other) {
    return !!other;
  };

  Truthy.prototype.jasmineToString = function() {
    return '<jasmine.truthy>';
  };

  return Truthy;
};
