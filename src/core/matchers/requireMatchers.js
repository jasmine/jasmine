getJasmineRequireObj().requireMatchers = function(jRequire, j$) {
  var availableMatchers = {
      'toBe': [],
      'toBeCloseTo': [],
      'toBeDefined': [],
      'toBeFalsy': ['toBeFalsey'],
      'toBeGreaterThan': [],
      'toBeGreaterThanOrEqual': [],
      'toBeLessThan': [],
      'toBeLessThanOrEqual': [],
      'toBeNaN': [],
      'toBeNegativeInfinity': [],
      'toBeNull': [],
      'toBePositiveInfinity': [],
      'toBeTruthy': ['toBeTruey'],
      'toBeUndefined': [],
      'toContain': [],
      'toEqual': [],
      'toHaveBeenCalled': [],
      'toHaveBeenCalledBefore': [],
      'toHaveBeenCalledTimes': [],
      'toHaveBeenCalledWith': [],
      'toMatch': [],
      'toThrow': [],
      'toThrowError': []
    },
    matchers = {};

  var availableMatcherNames = Object.keys(availableMatchers);

  for (var i = 0; i < availableMatcherNames.length; i++) {
    var name = availableMatcherNames[i];
    matchers[name] = jRequire[name](j$);

    var aliases = availableMatchers[name];
    for (var j = 0; j < aliases.length; j++) {
      matchers[aliases[j]] = matchers[name];
    }
  }

  return matchers;
};
