'use strict';

describe('nothing', function() {
  it('should pass', function() {
    const matcher = jasmineUnderTest.matchers.nothing(),
      result = matcher.compare();

    expect(result.pass).toBe(true);
  });
});
