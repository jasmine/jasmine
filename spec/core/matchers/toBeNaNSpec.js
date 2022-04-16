describe('toBeNaN', function() {
  it('passes for NaN with a custom .not fail', function() {
    const matcher = jasmineUnderTest.matchers.toBeNaN();
    const result = matcher.compare(Number.NaN);
    expect(result.pass).toBe(true);
    expect(result.message).toEqual('Expected actual not to be NaN.');
  });

  it('fails for anything not a NaN', function() {
    const matcher = jasmineUnderTest.matchers.toBeNaN();
    let result;

    result = matcher.compare(1);
    expect(result.pass).toBe(false);

    result = matcher.compare(null);
    expect(result.pass).toBe(false);

    result = matcher.compare(void 0);
    expect(result.pass).toBe(false);

    result = matcher.compare('');
    expect(result.pass).toBe(false);

    result = matcher.compare(Number.POSITIVE_INFINITY);
    expect(result.pass).toBe(false);
  });

  it('has a custom message on failure', function() {
    const matcher = jasmineUnderTest.matchers.toBeNaN({
        pp: jasmineUnderTest.makePrettyPrinter()
      }),
      result = matcher.compare(0);

    expect(result.message()).toEqual('Expected 0 to be NaN.');
  });
});
