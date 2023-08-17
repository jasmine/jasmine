'use strict';

describe('toBeNull', function() {
  it('passes for null', function() {
    const matcher = jasmineUnderTest.matchers.toBeNull();
    const result = matcher.compare(null);
    expect(result.pass).toBe(true);
  });

  it('fails for non-null', function() {
    const matcher = jasmineUnderTest.matchers.toBeNull();
    const result = matcher.compare('foo');
    expect(result.pass).toBe(false);
  });
});
