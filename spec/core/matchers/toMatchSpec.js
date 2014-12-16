describe("toMatch", function() {
  it("passes when RegExps are equivalent", function() {
    var matcher = j$.matchers.toMatch(),
      result;

    result = matcher.compare(/foo/, /foo/);
    expect(result.pass).toBe(true);
  });

  it("fails when RegExps are not equivalent", function() {
    var matcher = j$.matchers.toMatch(),
      result;

    result = matcher.compare(/bar/, /foo/);
    expect(result.pass).toBe(false);
  });

  it("passes when the actual matches the expected string as a pattern", function() {
    var matcher = j$.matchers.toMatch(),
      result;

    result = matcher.compare('foosball', 'foo');
    expect(result.pass).toBe(true);
  });

  it("fails when the actual matches the expected string as a pattern", function() {
    var matcher = j$.matchers.toMatch(),
      result;

    result = matcher.compare('bar', 'foo');
    expect(result.pass).toBe(false);
  });

  it("throws an Error when the expected is not a String or RegExp", function() {
    var matcher = j$.matchers.toMatch();

    expect(function() {
      matcher.compare('foo', { bar: 'baz' });
    }).toThrowError('Expected is not a String or a RegExp');
  });
});

