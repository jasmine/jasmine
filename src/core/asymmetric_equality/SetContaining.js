getJasmineRequireObj().SetContaining = function(j$) {
  function SetContaining(sample) {
    if (!j$.isSet(sample)) {
      throw new Error(
        'You must provide a set to `setContaining`, not ' +
          j$.basicPrettyPrinter_(sample)
      );
    }

    this.sample = sample;
  }

  SetContaining.prototype.asymmetricMatch = function(other, matchersUtil) {
    if (!j$.isSet(other)) return false;

    for (const item of this.sample) {
      // for each item in `sample` there should be at least one matching item in `other`
      // (not using `matchersUtil.contains` because it compares set members by reference,
      // not by deep value equality)
      var hasMatch = false;
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
