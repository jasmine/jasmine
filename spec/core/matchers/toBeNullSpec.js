describe("toBeNull", function() {
  it("passes for null", function() {
    var matcher = j$.matchers.toBeNull(),
      result;

    result = matcher.compare(null);
    expect(result.pass).toBe(true);
  });

  it("fails for non-null", function() {
    var matcher = j$.matchers.toBeNull(),
      result;

    result = matcher.compare('foo');
    expect(result.pass).toBe(false);
  });
});
