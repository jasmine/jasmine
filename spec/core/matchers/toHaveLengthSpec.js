describe("toHaveLength", function() {
  it("fails for invalid lengths", function() {
    var matcher = jasmineUnderTest.matchers.toHaveLength(),
      result;

    result = matcher.compare(['foo'], 0);
    expect(result.pass).toBe(false);

    result = matcher.compare('hello', 4);
    expect(result.pass).toBe(false);
  });

  it("succeeds for valid lengths", function() {
    var matcher = jasmineUnderTest.matchers.toHaveLength(),
      result;

    result = matcher.compare('foo bar baz', 11);
    expect(result.pass).toBe(true);

    result = matcher.compare(['foo', 'bar', 'baz'], 3);
    expect(result.pass).toBe(true);
  });

  it("throws an Error when the expected is not a String or Array", function() {
    var matcher = jasmineUnderTest.matchers.toHaveLength();

    expect(function() {
      matcher.compare({}, 0);
    }).toThrowError(/Expected is not a String or an Array/);
  });

});
