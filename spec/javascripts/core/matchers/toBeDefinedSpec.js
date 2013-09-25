describe("toBeDefined", function() {
  it("matches for defined values", function() {
    var matcher = j$.matchers.toBeDefined(),
      result;


    result = matcher.compare('foo');
    expect(result.pass).toBe(true);
  });

  it("fails when matching undefined values", function() {
    var matcher = j$.matchers.toBeDefined(),
      result;

    result = matcher.compare(void 0);
    expect(result.pass).toBe(false);
  })
});
