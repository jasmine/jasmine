getJasmineRequireObj().ArrayContaining = function(j$) {
  function ArrayContaining(sample) {
    this.sample = sample;
  }

  ArrayContaining.prototype.jasmineMatches = function(other, mismatchKeys, mismatchValues) {
    var className = Object.prototype.toString.call(this.sample);
    if (className !== "[object Array]") { throw new Error("You must provide an array to arrayContaining, not '"+this.sample+"'."); }

    mismatchKeys = mismatchKeys || [];
    mismatchValues = mismatchValues || [];
    var missingItems = [];
    for (var i = 0; i < this.sample.length; i++) {
      var item = this.sample[i];
      if (!j$.matchersUtil.contains(other, item)) {
        missingItems.push(item);
      }
    }

    if (missingItems.length > 0) {
      mismatchValues.push("expected to have values ['" + missingItems.join("','") + "']");
      return false;
    } else {
      return true;
    }

    return true;
  };

  ArrayContaining.prototype.jasmineToString = function () {
    return "<jasmine.arrayContaining(" + jasmine.pp(this.sample) +")>";
  };

  return ArrayContaining;
};
