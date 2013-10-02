describe("toBe", function() {
  it("passes when actual === expected", function() {
    var matcher = j$.matchers.toBe(),
      result;

    result = matcher.compare(1, 1);
    expect(result.pass).toBe(true);
  });

  it("fails when actual !== expected", function() {
    var matcher = j$.matchers.toBe(),
      result;

    result = matcher.compare(1, 2);
    expect(result.pass).toBe(false);
  });
});
