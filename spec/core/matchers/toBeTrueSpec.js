describe("toBeTrue", function() {
  it("passes for true", function() {
    var matcher = jasmineUnderTest.matchers.toBeTrue(),
      result;

    result = matcher.compare(true);
    expect(result.pass).toBe(true);
  });

  it("fails for non-true", function() {
    var matcher = jasmineUnderTest.matchers.toBeTrue(),
      result;

    result = matcher.compare('foo');
    expect(result.pass).toBe(false);
  });
});
