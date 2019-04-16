describe("toBeFalse", function() {
  it("passes for false", function() {
    var matcher = jasmineUnderTest.matchers.toBeFalse(),
      result;

    result = matcher.compare(false);
    expect(result.pass).toBe(true);
  });

  it("fails for non-false", function() {
    var matcher = jasmineUnderTest.matchers.toBeFalse(),
      result;

    result = matcher.compare('foo');
    expect(result.pass).toBe(false);
  });

  it("fails for falsy", function() {
    var matcher = jasmineUnderTest.matchers.toBeFalse(),
      result;

    result = matcher.compare(undefined);
    expect(result.pass).toBe(false);
  });
});
