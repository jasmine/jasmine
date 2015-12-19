getJasmineRequireObj().ArrayContaining = function(j$) {
  function ArrayContaining(sample) {
    this.sample = sample;
  }

  ArrayContaining.prototype.asymmetricMatch = function(other) {
    var className = Object.prototype.toString.call(this.sample);
    if (className !== '[object Array]') { throw new Error('You must provide an array to arrayContaining, not \'' + this.sample + '\'.'); }

    for (var i = 0; i < this.sample.length; i++) {
      var item = this.sample[i];
      if (!j$.matchersUtil.contains(other, item)) {
        return false;
      }
    }

    return true;
  };

  ArrayContaining.prototype.jasmineToString = function () {
    return '<jasmine.arrayContaining(' + jasmine.pp(this.sample) +')>';
  };

  return ArrayContaining;
};
