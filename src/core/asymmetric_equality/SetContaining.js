getJasmineRequireObj().SetContaining = function(j$) {
  'use strict';

  function SetContaining(sample) {
    if (!j$.private.isSet(sample)) {
      throw new Error(
        'You must provide a set to `setContaining`, not ' +
          j$.private.basicPrettyPrinter(sample)
      );
    }

    this.sample = sample;
  }

  SetContaining.prototype.asymmetricMatch = function(other, matchersUtil) {
    if (!j$.private.isSet(other)) {
      return false;
    }

    for (const item of this.sample) {
      // for each item in `sample` there should be at least one matching item in `other`
      // (not using `matchersUtil.contains` because it compares set members by reference,
      // not by deep value equality)
      let hasMatch = false;
      for (const oItem of other) {
        if (matchersUtil.equals(oItem, item)) {
          hasMatch = true;
          break;
        }
      }

      if (!hasMatch) {
        return false;
      }
    }

    return true;
  };

  SetContaining.prototype.jasmineToString = function(pp) {
    return '<jasmine.setContaining(' + pp(this.sample) + ')>';
  };

  return SetContaining;
};
