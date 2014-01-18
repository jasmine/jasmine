describe("toBeUndefined", function() {
  it("passes for undefined values", function() {
    var matcher = j$.matchers.toBeUndefined(),
      result;

    result = matcher.compare(void 0);
    expect(result.pass).toBe(true);

  });

  it("fails when matching defined values", function() {
    var matcher = j$.matchers.toBeUndefined(),
      result;

    result = matcher.compare('foo');
    expect(result.pass).toBe(false);
  })
});
