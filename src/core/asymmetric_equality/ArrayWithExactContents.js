getJasmineRequireObj().ArrayWithExactContents = function(j$) {
  function ArrayWithExactContents(sample) {
    this.sample = sample;
  }

  ArrayWithExactContents.prototype.asymmetricMatch = function(
    other,
    matchersUtil
  ) {
    if (!j$.isArray_(this.sample)) {
      throw new Error(
        'You must provide an array to arrayWithExactContents, not ' +
          j$.basicPrettyPrinter_(this.sample) +
          '.'
      );
    }

    if (this.sample.length !== other.length) {
      return false;
    }

    for (var i = 0; i < this.sample.length; i++) {
      var item = this.sample[i];
      if (!matchersUtil.contains(other, item)) {
        return false;
      }
    }

    return true;
  };

  ArrayWithExactContents.prototype.jasmineToString = function(pp) {
    return '<jasmine.arrayWithExactContents(' + pp(this.sample) + ')>';
  };

  return ArrayWithExactContents;
};
