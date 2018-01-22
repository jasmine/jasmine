getJasmineRequireObj().ArrayWithExactContents = function(j$) {

  function ArrayWithExactContents(sample) {
    this.sample = sample;
  }

  ArrayWithExactContents.prototype.asymmetricMatch = function(other, customTesters) {
    if (!j$.isArray_(this.sample)) {
      throw new Error('You must provide an array to arrayWithExactContents, not ' + j$.pp(this.sample) + '.');
    }

    if (this.sample.length !== other.length) {
      return false;
    }

    for (var i = 0; i < this.sample.length; i++) {
      var item = this.sample[i];
      if (!j$.matchersUtil.contains(other, item, customTesters)) {
        return false;
      }
    }

    return true;
  };

  ArrayWithExactContents.prototype.jasmineToString = function() {
    return '<jasmine.arrayWithExactContents ' + j$.pp(this.sample) + '>';
  };

  return ArrayWithExactContents;
};
