getJasmineRequireObj().StringMatching = function(j$) {

  function StringMatching(expected) {
    if (!j$.isString_(expected) && !j$.isA_('RegExp', expected)) {
      throw new Error('Expected is not a String or a RegExp');
    }

    this.regexp = new RegExp(expected);
  }

  StringMatching.prototype.asymmetricMatch = function(other) {
    return this.regexp.test(other);
  };

  StringMatching.prototype.jasmineToString = function() {
    return '<jasmine.stringMatching(' + this.regexp + ')>';
  };

  return StringMatching;
};
