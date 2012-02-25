/**
 * @constructor
 * @param {jasmine.Matchers or jasmine.ChainedMatchers} precedingMatcher
 */
jasmine.ChainedMatchers = function(precedingMatcher) {
  for (var key in precedingMatcher) {
    if (key === "not") continue;
    if (precedingMatcher.hasOwnProperty(key)) {
      this[key] = precedingMatcher[key]
    }
  }
}

