getJasmineRequireObj().AllOf = function(j$) {
  'use strict';

  function AllOf() {
    const expectedValues = Array.from(arguments);
    if (expectedValues.length === 0) {
      throw new TypeError(
        'jasmine.allOf() expects at least one argument to be passed.'
      );
    }
    this.expectedValues = expectedValues;
  }

  AllOf.prototype.asymmetricMatch = function(other, matchersUtil) {
    for (const expectedValue of this.expectedValues) {
      if (!matchersUtil.equals(other, expectedValue)) {
        return false;
      }
    }

    return true;
  };

  AllOf.prototype.jasmineToString = function(pp) {
    return '<jasmine.allOf(' + pp(this.expectedValues) + ')>';
  };

  return AllOf;
};
