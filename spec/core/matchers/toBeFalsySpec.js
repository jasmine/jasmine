describe("toBeFalsy", function() {
  it("passes for 'falsy' values", function() {
    var matcherComparator = j$.matchers.toBeFalsy(),
      result;

    result = matcherComparator(false);
    expect(result.pass).toBe(true);

    result = matcherComparator(0);
    expect(result.pass).toBe(true);

    result = matcherComparator('');
    expect(result.pass).toBe(true);

    result = matcherComparator(null);
    expect(result.pass).toBe(true);

    result = matcherComparator(void 0);
    expect(result.pass).toBe(true);
  });

  it("fails for 'truthy' values", function() {
    var matcherComparator = j$.matchers.toBeFalsy(),
      result;

    result = matcherComparator(true);
    expect(result.pass).toBe(false);

    result = matcherComparator(1);
    expect(result.pass).toBe(false);

    result = matcherComparator("foo");
    expect(result.pass).toBe(false);

    result = matcherComparator({});
    expect(result.pass).toBe(false);
  });
});
