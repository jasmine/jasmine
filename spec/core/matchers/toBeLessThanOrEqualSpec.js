describe('toBeLessThanOrEqual', function() {
  it('passes when actual <= expected', function() {
    const matcher = jasmineUnderTest.matchers.toBeLessThanOrEqual();
    let result;

    result = matcher.compare(1, 2);
    expect(result.pass).toBe(true);

    result = matcher.compare(1, 1);
    expect(result.pass).toBe(true);

    result = matcher.compare(1, 1.0000001);
    expect(result.pass).toBe(true);

    result = matcher.compare(1.0, 1.0);
    expect(result.pass).toBe(true);
  });

  it('fails when actual < expected', function() {
    const matcher = jasmineUnderTest.matchers.toBeLessThanOrEqual();
    let result;

    result = matcher.compare(2, 1);
    expect(result.pass).toBe(false);

    result = matcher.compare(1.0000001, 1);
    expect(result.pass).toBe(false);
  });
});
