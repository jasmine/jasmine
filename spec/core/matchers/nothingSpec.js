describe('nothing', function() {
  it('should pass', function() {
    const matcher = privateUnderTest.matchers.nothing();
    const result = matcher.compare();

    expect(result.pass).toBe(true);
  });
});
