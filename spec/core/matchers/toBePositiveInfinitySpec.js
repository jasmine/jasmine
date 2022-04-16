describe('toBePositiveInfinity', function() {
  it("fails for anything that isn't Infinity", function() {
    const matcher = jasmineUnderTest.matchers.toBePositiveInfinity();
    let result;

    result = matcher.compare(1);
    expect(result.pass).toBe(false);

    result = matcher.compare(Number.NaN);
    expect(result.pass).toBe(false);

    result = matcher.compare(null);
    expect(result.pass).toBe(false);
  });

  it('has a custom message on failure', function() {
    const matcher = jasmineUnderTest.matchers.toBePositiveInfinity({
        pp: jasmineUnderTest.makePrettyPrinter()
      }),
      result = matcher.compare(0);

    expect(result.message()).toEqual('Expected 0 to be Infinity.');
  });

  it('succeeds for Infinity', function() {
    const matcher = jasmineUnderTest.matchers.toBePositiveInfinity(),
      result = matcher.compare(Number.POSITIVE_INFINITY);

    expect(result.pass).toBe(true);
    expect(result.message).toEqual('Expected actual not to be Infinity.');
  });
});
