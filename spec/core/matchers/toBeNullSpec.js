describe("toBeNull", function() {
  it("passes for null", function() {
    var matcherComparator = j$.matchers.toBeNull(),
      result;

    result = matcherComparator(null);
    expect(result.pass).toBe(true);
  });

  it("fails for non-null", function() {
    var matcherComparator = j$.matchers.toBeNull(),
      result;

    result = matcherComparator('foo');
    expect(result.pass).toBe(false);
  });
});
