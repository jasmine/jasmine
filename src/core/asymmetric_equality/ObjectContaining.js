getJasmineRequireObj().ObjectContaining = function(j$) {
  function ObjectContaining(sample) {
    this.sample = sample;
  }

  function hasProperty(obj, property) {
    if (!obj || typeof obj !== 'object') {
      return false;
    }

    if (Object.prototype.hasOwnProperty.call(obj, property)) {
      return true;
    }

    return hasProperty(Object.getPrototypeOf(obj), property);
  }

  ObjectContaining.prototype.asymmetricMatch = function(other, matchersUtil) {
    if (typeof this.sample !== 'object') {
      throw new Error(
        "You must provide an object to objectContaining, not '" +
          this.sample +
          "'."
      );
    }
    if (typeof other !== 'object') {
      return false;
    }

    for (var property in this.sample) {
      if (
        !hasProperty(other, property) ||
        !matchersUtil.equals(this.sample[property], other[property])
      ) {
        return false;
      }
    }

    return true;
  };

  ObjectContaining.prototype.valuesForDiff_ = function(other, pp) {
    if (!j$.isObject_(other)) {
      return {
        self: this.jasmineToString(pp),
        other: other
      };
    }

    var filteredOther = {};
    Object.keys(this.sample).forEach(function(k) {
      // eq short-circuits comparison of objects that have different key sets,
      // so include all keys even if undefined.
      filteredOther[k] = other[k];
    });

    return {
      self: this.sample,
      other: filteredOther
    };
  };

  ObjectContaining.prototype.jasmineToString = function(pp) {
    return '<jasmine.objectContaining(' + pp(this.sample) + ')>';
  };

  return ObjectContaining;
};
