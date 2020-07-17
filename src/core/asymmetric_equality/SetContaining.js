getJasmineRequireObj().SetContaining = function(j$) {
  function SetContaining(sample) {
    if (!j$.isSet(sample)) {
      throw new Error(
        'You must provide a set to `setContaining`, not ' + j$.pp(sample)
      );
    }

    this.sample = sample;
  }

  SetContaining.prototype.asymmetricMatch = function(other, matchersUtil) {
    if (!j$.isSet(other)) return false;

    var hasAllMatches = true;
    j$.util.forEachBreakable(this.sample, function(breakLoop, item) {
      // for each item in `sample` there should be at least one matching item in `other`
      // (not using `matchersUtil.contains` because it compares set members by reference,
      // not by deep value equality)
      var hasMatch = false;
      j$.util.forEachBreakable(other, function(oBreakLoop, oItem) {
        if (matchersUtil.equals(oItem, item)) {
          hasMatch = true;
          oBreakLoop();
        }
      });
      if (!hasMatch) {
        hasAllMatches = false;
        breakLoop();
      }
    });

    return hasAllMatches;
  };

  SetContaining.prototype.jasmineToString = function(pp) {
    return '<jasmine.setContaining(' + pp(this.sample) + ')>';
  };

  return SetContaining;
};
