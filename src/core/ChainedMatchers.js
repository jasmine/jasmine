/**
 * @constructor
 * @param {jasmine.Matchers or jasmine.ChainedMatchers} precedingMatcher
 * @param {jasmine.ExpectationResult} precedingResult
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

jasmine.ChainedMatchers.makeChainName = function(prefix, matcherName) {
  return prefix ? [prefix, matcherName].join(" ") : matcherName;
};

jasmine.ChainedMatchers.parseChainName = function(chainName) {
    var names = chainName.match(/\w+/g);
    var prefix = names.slice(0, names.length - 1).join(" ");
    var matcherName = names.slice(names.length - 1)[0];
    return { prefix: prefix, matcherName: matcherName };
};
