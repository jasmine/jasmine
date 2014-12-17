getJasmineRequireObj().ObjectContaining = function(j$) {

  function ObjectContaining(sample) {
    this.sample = sample;
  }

  ObjectContaining.prototype.asymmetricMatch = function(other) {
    if (typeof(this.sample) !== 'object') { throw new Error('You must provide an object to objectContaining, not \''+this.sample+'\'.'); }

    for (var property in this.sample) {
      if (!Object.prototype.hasOwnProperty.call(other, property) ||
          !j$.matchersUtil.equals(this.sample[property], other[property])) {
        return false;
      }
    }

    return true;
  };

  ObjectContaining.prototype.jasmineToString = function() {
    return '<jasmine.objectContaining(' + j$.pp(this.sample) + ')>';
  };

  return ObjectContaining;
};
