getJasmineRequireObj().requireAsyncMatchers = function(jRequire, j$) {
  'use strict';

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
