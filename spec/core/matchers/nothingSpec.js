describe('nothing', function() {
  it('should pass', function() {
    const matcher = privateUnderTest.matchers.nothing(),
      result = matcher.compare();

    expect(result.pass).toBe(true);
  });
});
