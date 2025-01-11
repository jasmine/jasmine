getJasmineRequireObj().requireMatchers = function(jRequire, j$) {
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
      'toBeNullish',
      'toContain',
      'toEqual',
      'toHaveSize',
      'toHaveBeenCalled',
      'toHaveBeenCalledBefore',
      'toHaveBeenCalledOnceWith',
      'toHaveBeenCalledTimes',
      'toHaveBeenCalledWith',
      'toHaveClass',
      'toHaveClasses',
      'toHaveSpyInteractions',
      'toHaveNoOtherSpyInteractions',
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
