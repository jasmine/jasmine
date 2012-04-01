/**
 * @constructor
 * @param {Object} params
 */
jasmine.ChainedMatchers = function(params) {
  var precedingMatcher = params.precedingMatcher;
  for (var key in precedingMatcher) {
    if (key === "not") continue;
    if (key === "message") continue;
    if (precedingMatcher.hasOwnProperty(key)) {
      this[key] = precedingMatcher[key]
    }
  }
  this.precedingResult  = params.precedingResult;
  this.precedingMessage = params.precedingMessage;
};

jasmine.ChainedMatchers.makeChainName = function(/* chain names, matcher names */) {
  var i, name, names = [];
  for (i = 0; i < arguments.length; i++) {
    name = arguments[i];
    if (name) names.push(name);
  }
  return names.join(" ");
};

jasmine.ChainedMatchers.parseMatchers = function(matcherDefinitions) {
  var chained = {}, topLevel = {},
      names, prefix, matcherName, method;
  for (var key in matcherDefinitions) {
    method = matcherDefinitions[key];
    names  = key.match(/[\w$]+/g);
    prefix = names.slice(0, names.length - 1).join(" ");
    matcherName = names.slice(names.length - 1)[0];
    if (prefix.length > 0) {
      chained[prefix] || (chained[prefix] = {});
      chained[prefix][matcherName] = method;
    } else {
      topLevel[matcherName] = method;
    }
  }
  return { topLevel: topLevel, chained: chained };
};

