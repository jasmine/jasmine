getJasmineRequireObj().MapContaining = function(j$) {
  function MapContaining(sample) {
    if (!j$.isMap(sample)) {
      throw new Error('You must provide a map to `mapContaining`, not ' + j$.basicPrettyPrinter_(sample));
    }

    this.sample = sample;
  }

  MapContaining.prototype.asymmetricMatch = function(other, matchersUtil) {
    if (!j$.isMap(other)) return false;

    var hasAllMatches = true;
    j$.util.forEachBreakable(this.sample, function(breakLoop, value, key) {
      // for each key/value pair in `sample`
      // there should be at least one pair in `other` whose key and value both match
      var hasMatch = false;
      j$.util.forEachBreakable(other, function(oBreakLoop, oValue, oKey) {
        if (
          matchersUtil.equals(oKey, key)
          && matchersUtil.equals(oValue, value)
        ) {
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

  MapContaining.prototype.jasmineToString = function(pp) {
    return '<jasmine.mapContaining(' + pp(this.sample) + ')>';
  };

  return MapContaining;
};
