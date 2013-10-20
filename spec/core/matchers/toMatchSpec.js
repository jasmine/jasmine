describe("toMatch", function() {
  it("passes when RegExps are equivalent", function() {
    var matcherComparator = j$.matchers.toMatch(),
      result;

    result = matcherComparator(/foo/, /foo/);
    expect(result.pass).toBe(true);
  });

  it("fails when RegExps are not equivalent", function() {
    var matcherComparator = j$.matchers.toMatch(),
      result;

    result = matcherComparator(/bar/, /foo/);
    expect(result.pass).toBe(false);
  });

  it("passes when the actual matches the expected string as a pattern", function() {
    var matcherComparator = j$.matchers.toMatch(),
      result;

    result = matcherComparator('foosball', 'foo');
    expect(result.pass).toBe(true);
  });

  it("fails when the actual matches the expected string as a pattern", function() {
    var matcherComparator = j$.matchers.toMatch(),
      result;

    result = matcherComparator('bar', 'foo');
    expect(result.pass).toBe(false);
  });
});

