describe("toBeTruthy", function() {
  it("passes for 'truthy' values", function() {
    var matcherComparator = j$.matchers.toBeTruthy(),
      result;

    result = matcherComparator(true);
    expect(result.pass).toBe(true);

    result = matcherComparator(1);
    expect(result.pass).toBe(true);

    result = matcherComparator("foo");
    expect(result.pass).toBe(true);

    result = matcherComparator({});
    expect(result.pass).toBe(true);
  });

  it("fails for 'falsy' values", function() {
    var matcherComparator = j$.matchers.toBeTruthy(),
      result;

    result = matcherComparator(false);
    expect(result.pass).toBe(false);

    result = matcherComparator(0);
    expect(result.pass).toBe(false);

    result = matcherComparator('');
    expect(result.pass).toBe(false);

    result = matcherComparator(null);
    expect(result.pass).toBe(false);

    result = matcherComparator(void 0);
    expect(result.pass).toBe(false);
  });
});
