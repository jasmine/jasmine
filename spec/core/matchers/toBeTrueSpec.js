describe('toBeTrue', function() {
  it('passes for true', function() {
    const matcher = privateUnderTest.matchers.toBeTrue();
    const result = matcher.compare(true);
    expect(result.pass).toBe(true);
  });

  it('fails for non-true', function() {
    const matcher = privateUnderTest.matchers.toBeTrue();
    const result = matcher.compare('foo');
    expect(result.pass).toBe(false);
  });
});
