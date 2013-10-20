describe("toBeDefined", function() {
  it("matches for defined values", function() {
    var matcherComparator = j$.matchers.toBeDefined(),
      result;


    result = matcherComparator('foo');
    expect(result.pass).toBe(true);
  });

  it("fails when matching undefined values", function() {
    var matcherComparator = j$.matchers.toBeDefined(),
      result;

    result = matcherComparator(void 0);
    expect(result.pass).toBe(false);
  })
});
