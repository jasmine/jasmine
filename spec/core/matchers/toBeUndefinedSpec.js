describe("toBeUndefined", function() {
  it("passes for undefined values", function() {
    var matcherComparator = j$.matchers.toBeUndefined(),
      result;

    result = matcherComparator(void 0);
    expect(result.pass).toBe(true);

  });

  it("fails when matching defined values", function() {
    var matcherComparator = j$.matchers.toBeUndefined();

    result = matcherComparator('foo');
    expect(result.pass).toBe(false);
  })
});
