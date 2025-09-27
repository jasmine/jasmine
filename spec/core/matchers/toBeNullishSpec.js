describe('toBeNullish', function() {
  it('passes for null values', function() {
    const matcher = privateUnderTest.matchers.toBeNullish();
    const result = matcher.compare(null);
    expect(result.pass).toBe(true);
  });

  it('passes for undefined values', function() {
    const matcher = privateUnderTest.matchers.toBeNullish();
    const result = matcher.compare(void 0);
    expect(result.pass).toBe(true);
  });

  it('fails when matching defined values', function() {
    const matcher = privateUnderTest.matchers.toBeNullish();
    const result = matcher.compare('foo');
    expect(result.pass).toBe(false);
  });

  describe('falsy values', () => {
    it('fails for 0', function() {
      const matcher = privateUnderTest.matchers.toBeNullish();
      const result = matcher.compare(0);
      expect(result.pass).toBe(false);
    });

    it('fails for -0', function() {
      const matcher = privateUnderTest.matchers.toBeNullish();
      const result = matcher.compare(-0);
      expect(result.pass).toBe(false);
    });

    it('fails for empty string', function() {
      const matcher = privateUnderTest.matchers.toBeNullish();
      const result = matcher.compare('');
      expect(result.pass).toBe(false);
    });

    it('fails for false', function() {
      const matcher = privateUnderTest.matchers.toBeNullish();
      const result = matcher.compare(false);
      expect(result.pass).toBe(false);
    });

    it('fails for NaN', function() {
      const matcher = privateUnderTest.matchers.toBeNullish();
      const result = matcher.compare(NaN);
      expect(result.pass).toBe(false);
    });

    it('fails for 0n', function() {
      const matcher = privateUnderTest.matchers.toBeNullish();
      const result = matcher.compare(BigInt(0));
      expect(result.pass).toBe(false);
    });
  });
});
