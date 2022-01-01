getJasmineRequireObj().MapContaining = function(j$) {
  function MapContaining(sample) {
    if (!j$.isMap(sample)) {
      throw new Error(
        'You must provide a map to `mapContaining`, not ' +
          j$.basicPrettyPrinter_(sample)
      );
    }

    this.sample = sample;
  }

  MapContaining.prototype.asymmetricMatch = function(other, matchersUtil) {
    if (!j$.isMap(other)) return false;

    for (const [key, value] of this.sample) {
      // for each key/value pair in `sample`
      // there should be at least one pair in `other` whose key and value both match
      var hasMatch = false;
      for (const [oKey, oValue] of other) {
        if (
          matchersUtil.equals(oKey, key) &&
          matchersUtil.equals(oValue, value)
        ) {
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

  MapContaining.prototype.jasmineToString = function(pp) {
    return '<jasmine.mapContaining(' + pp(this.sample) + ')>';
  };

  return MapContaining;
};
