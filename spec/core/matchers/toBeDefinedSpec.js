'use strict';

describe('toBeDefined', function() {
  it('matches for defined values', function() {
    const matcher = jasmineUnderTest.matchers.toBeDefined();
    const result = matcher.compare('foo');
    expect(result.pass).toBe(true);
  });

  it('fails when matching undefined values', function() {
    const matcher = jasmineUnderTest.matchers.toBeDefined();
    const result = matcher.compare(void 0);
    expect(result.pass).toBe(false);
  });
});
