getJasmineRequireObj().ObjectContaining = function(j$) {

  function ObjectContaining(sample) {
    this.sample = sample;
  }

  function getPrototype(obj) {
    if (Object.getPrototypeOf) {
      return Object.getPrototypeOf(obj);
    }

    if (obj.constructor.prototype == obj) {
      return null;
    }

    return obj.constructor.prototype;
  }

  function hasProperty(obj, property) {
    if (!obj || typeof(obj) !== 'object') {
      return false;
    }

    if (Object.prototype.hasOwnProperty.call(obj, property)) {
      return true;
    }

    return hasProperty(getPrototype(obj), property);
  }

  ObjectContaining.prototype.asymmetricMatch = function(other, customTesters) {
    if (typeof(this.sample) !== 'object') { throw new Error('You must provide an object to objectContaining, not \''+this.sample+'\'.'); }
    if (typeof(other) !== 'object') { return false; }

    for (var property in this.sample) {
      if (!hasProperty(other, property) ||
          !j$.matchersUtil.equals(this.sample[property], other[property], customTesters)) {
        return false;
      }
    }

    return true;
  };

  ObjectContaining.prototype.valuesForDiff_ = function(other) {
    if (!j$.isObject_(other)) {
      return {
        self: this.jasmineToString(),
        other: other
      };
    }

    var filteredOther = {};
    Object.keys(this.sample).forEach(function (k) {
      // eq short-circuits comparison of objects that have different key sets,
      // so include all keys even if undefined.
      filteredOther[k] = other[k];
    });

    return {
      self: this.sample,
      other: filteredOther
    };
  };

  ObjectContaining.prototype.jasmineToString = function() {
    return '<jasmine.objectContaining(' + j$.pp(this.sample) + ')>';
  };

  return ObjectContaining;
};
