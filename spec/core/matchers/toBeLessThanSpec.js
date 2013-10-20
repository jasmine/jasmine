describe("toBeLessThan", function() {
  it("passes when actual < expected", function() {
    var matcherComparator = j$.matchers.toBeLessThan(),
      result;

    result = matcherComparator(1, 2);
    expect(result.pass).toBe(true);
  });

  it("fails when actual <= expected", function() {
    var matcherComparator = j$.matchers.toBeLessThan(),
      result;

    result = matcherComparator(1, 1);
    expect(result.pass).toBe(false);

    result = matcherComparator(2, 1);
    expect(result.pass).toBe(false);
  });
});
