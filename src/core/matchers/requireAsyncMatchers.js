getJasmineRequireObj().requireAsyncMatchers = function(jRequire, j$, private$) {
  'use strict';

  const availableMatchers = [
    'toBePending',
    'toBeResolved',
    'toBeRejected',
    'toBeResolvedTo',
    'toBeRejectedWith',
    'toBeRejectedWithError',
    'toBeRejectedWithMatching'
  ];
  const matchers = {};

  for (const name of availableMatchers) {
    matchers[name] = jRequire[name](j$, private$);
  }

  return matchers;
};
