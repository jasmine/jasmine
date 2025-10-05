getJasmineRequireObj().MapContaining = function(j$) {
  'use strict';

  function MapContaining(sample) {
    if (!j$.private.isMap(sample)) {
      throw new Error(
        'You must provide a map to `mapContaining`, not ' +
          j$.private.basicPrettyPrinter(sample)
      );
    }

    this.sample = sample;
  }

  MapContaining.prototype.asymmetricMatch = function(other, matchersUtil) {
    if (!j$.private.isMap(other)) {
      return false;
    }

    for (const [key, value] of this.sample) {
      // for each key/value pair in `sample`
      // there should be at least one pair in `other` whose key and value both match
      let hasMatch = false;
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
