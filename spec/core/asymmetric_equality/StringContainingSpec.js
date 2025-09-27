describe('StringContaining', function() {
  it('searches for a provided substring when the expected is a String', function() {
    const matcher = new privateUnderTest.StringContaining('foo');

    expect(matcher.asymmetricMatch('barfoobaz')).toBe(true);
    expect(matcher.asymmetricMatch('barbaz')).toBe(false);
  });

  it('raises an Error when the expected is not a String', function() {
    expect(function() {
      new privateUnderTest.StringContaining(/foo/);
    }).toThrowError(/not a String/);
  });

  it('fails when the actual is not a String', function() {
    const matcher = new privateUnderTest.StringContaining('x');
    expect(matcher.asymmetricMatch(['x'])).toBe(false);
  });

  it("jasmineToString's itself", function() {
    const matching = new privateUnderTest.StringContaining('foo');

    expect(matching.jasmineToString()).toEqual(
      '<jasmine.stringContaining("foo")>'
    );
  });
});
