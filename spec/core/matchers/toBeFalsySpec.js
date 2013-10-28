describe("toBeFalsy", function() {
  it("passes for 'falsy' values", function() {
    var matcher = j$.matchers.toBeFalsy(),
      result;

    result = matcher.compare(false);
    expect(result.pass).toBe(true);

    result = matcher.compare(0);
    expect(result.pass).toBe(true);

    result = matcher.compare('');
    expect(result.pass).toBe(true);

    result = matcher.compare(null);
    expect(result.pass).toBe(true);

    result = matcher.compare(void 0);
    expect(result.pass).toBe(true);
  });

  it("fails for 'truthy' values", function() {
    var matcher = j$.matchers.toBeFalsy(),
      result;

    result = matcher.compare(true);
    expect(result.pass).toBe(false);

    result = matcher.compare(1);
    expect(result.pass).toBe(false);

    result = matcher.compare("foo");
    expect(result.pass).toBe(false);

    result = matcher.compare({});
    expect(result.pass).toBe(false);
  });
});
