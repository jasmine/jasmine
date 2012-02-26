/**
 * @constructor
 * @param {jasmine.Matchers or jasmine.ChainedMatchers} precedingMatcher
 */
jasmine.ChainedMatchers = function(precedingMatcher, precedingResult) {
  for (var key in precedingMatcher) {
    if (key === "not") continue;
    if (key === "message") continue;
    if (precedingMatcher.hasOwnProperty(key)) {
      this[key] = precedingMatcher[key]
    }
    this.precedingResult = precedingResult;
  }
};

