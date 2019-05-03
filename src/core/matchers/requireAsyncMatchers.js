getJasmineRequireObj().requireAsyncMatchers = function(jRequire, j$) {
  var availableMatchers = [
      'toBeResolved',
      'toBeRejected',
      'toBeResolvedTo',
      'toBeRejectedWith',
      'toBeRejectedWithError'
    ],
    matchers = {};

  for (var i = 0; i < availableMatchers.length; i++) {
    var name = availableMatchers[i];
    matchers[name] = jRequire[name](j$);
  }

  return matchers;
};
