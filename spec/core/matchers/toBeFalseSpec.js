describe('toBeFalse', function() {
  it('passes for false', function() {
    const matcher = privateUnderTest.matchers.toBeFalse();
    const result = matcher.compare(false);
    expect(result.pass).toBe(true);
  });

  it('fails for non-false', function() {
    const matcher = privateUnderTest.matchers.toBeFalse();
    const result = matcher.compare('foo');
    expect(result.pass).toBe(false);
  });

  it('fails for falsy', function() {
    const matcher = privateUnderTest.matchers.toBeFalse();
    const result = matcher.compare(undefined);
    expect(result.pass).toBe(false);
  });
});
