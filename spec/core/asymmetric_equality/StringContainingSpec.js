describe('StringContaining', function() {
  it('searches for a provided substring when the expected is a String', function() {
    var matcher = new jasmineUnderTest.StringContaining('foo');

    expect(matcher.asymmetricMatch('barfoobaz')).toBe(true);
    expect(matcher.asymmetricMatch('barbaz')).toBe(false);
  });

  it('raises an Error when the expected is not a String', function() {
    expect(function() {
      new jasmineUnderTest.StringContaining(/foo/);
    }).toThrowError(/not a String/);
  });

  it('fails when the actual is not a String', function() {
    var matcher = new jasmineUnderTest.StringContaining('x');
    expect(matcher.asymmetricMatch(['x'])).toBe(false);
  });

  it("jasmineToString's itself", function() {
    var matching = new jasmineUnderTest.StringContaining('foo');

    expect(matching.jasmineToString()).toEqual(
      '<jasmine.stringContaining("foo")>'
    );
  });
});
