describe("toBeNaN", function() {
  it("passes for NaN with a custom .not fail", function() {
    var matcherComparator = j$.matchers.toBeNaN(),
      result;

    result = matcherComparator(Number.NaN);
    expect(result.pass).toBe(true);
    expect(result.message).toEqual("Expected actual not to be NaN.");
  });

  it("fails for anything not a NaN", function() {
    var matcherComparator = j$.matchers.toBeNaN();

    result = matcherComparator(1);
    expect(result.pass).toBe(false);

    result = matcherComparator(null);
    expect(result.pass).toBe(false);

    result = matcherComparator(void 0);
    expect(result.pass).toBe(false);

    result = matcherComparator('');
    expect(result.pass).toBe(false);

    result = matcherComparator(Number.POSITIVE_INFINITY);
    expect(result.pass).toBe(false);
  });

  it("has a custom message on failure", function() {
    var matcherComparator = j$.matchers.toBeNaN(),
      result = matcherComparator(0);

    expect(result.message).toEqual("Expected 0 to be NaN.");
  });
});
