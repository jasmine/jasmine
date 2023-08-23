getJasmineRequireObj().requireMatchers = function(jRequire, j$) {
  'use strict';

  const availableMatchers = [
      'nothing',
      'toBe',
      'toBeCloseTo',
      'toBeDefined',
      'toBeInstanceOf',
      'toBeFalse',
      'toBeFalsy',
      'toBeGreaterThan',
      'toBeGreaterThanOrEqual',
      'toBeLessThan',
      'toBeLessThanOrEqual',
      'toBeNaN',
      'toBeNegativeInfinity',
      'toBeNull',
      'toBePositiveInfinity',
      'toBeTrue',
      'toBeTruthy',
      'toBeUndefined',
      'toContain',
      'toEqual',
      'toHaveSize',
      'toHaveBeenCalled',
      'toHaveBeenCalledBefore',
      'toHaveBeenCalledOnceWith',
      'toHaveBeenCalledTimes',
      'toHaveBeenCalledWith',
      'toHaveClass',
      'toHaveSpyInteractions',
      'toMatch',
      'toThrow',
      'toThrowError',
      'toThrowMatching'
    ],
    matchers = {};

  for (const name of availableMatchers) {
    matchers[name] = jRequire[name](j$);
  }

  return matchers;
};
