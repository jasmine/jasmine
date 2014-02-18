describe("toBeNaN", function() {
  it("passes for NaN", function() {
    var matcher = j$.matchers.toBeNaN(),
      result;

    result = matcher.compare(Number.NaN);
    expect(result.pass).toBe(true);
  });

  it("fails for anything not a NaN", function() {
    var matcher = j$.matchers.toBeNaN(),
      result;

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
});
