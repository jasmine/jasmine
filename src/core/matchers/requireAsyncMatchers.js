getJasmineRequireObj().requireAsyncMatchers = function(jRequire, j$) {
  const availableMatchers = [
      'toBePending',
      'toBeResolved',
      'toBeRejected',
      'toBeResolvedTo',
      'toBeRejectedWith',
      'toBeRejectedWithError'
    ],
    matchers = {};

  for (const name of availableMatchers) {
    matchers[name] = jRequire[name](j$);
  }

  return matchers;
};
