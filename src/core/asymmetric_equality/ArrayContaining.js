getJasmineRequireObj().ArrayContaining = function(j$) {
  function ArrayContaining(sample) {
    this.sample = sample;
  }

  ArrayContaining.prototype.asymmetricMatch = function(other, matchersUtil) {
    if (!j$.isArray_(this.sample)) {
      throw new Error(
        'You must provide an array to arrayContaining, not ' +
          j$.basicPrettyPrinter_(this.sample) +
          '.'
      );
    }

    // If the actual parameter is not an array, we can fail immediately, since it couldn't
    // possibly be an "array containing" anything. However, we also want an empty sample
    // array to match anything, so we need to double-check we aren't in that case
    if (!j$.isArray_(other) && this.sample.length > 0) {
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

  ArrayContaining.prototype.jasmineToString = function(pp) {
    return '<jasmine.arrayContaining(' + pp(this.sample) + ')>';
  };

  return ArrayContaining;
};
