describe('toBeUndefined', function() {
  it('passes for undefined values', function() {
    const matcher = privateUnderTest.matchers.toBeUndefined();
    const result = matcher.compare(void 0);
    expect(result.pass).toBe(true);
  });

  it('fails when matching defined values', function() {
    const matcher = privateUnderTest.matchers.toBeUndefined();
    const result = matcher.compare('foo');
    expect(result.pass).toBe(false);
  });
});
