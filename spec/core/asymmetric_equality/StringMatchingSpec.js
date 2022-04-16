describe('StringMatching', function() {
  it('matches a string against a provided regexp', function() {
    const matcher = new jasmineUnderTest.StringMatching(/foo/);

    expect(matcher.asymmetricMatch('barfoobaz')).toBe(true);
    expect(matcher.asymmetricMatch('barbaz')).toBe(false);
  });

  it('matches a string against provided string', function() {
    const matcher = new jasmineUnderTest.StringMatching('foo');

    expect(matcher.asymmetricMatch('barfoobaz')).toBe(true);
    expect(matcher.asymmetricMatch('barbaz')).toBe(false);
  });

  it('raises an Error when the expected is not a String or RegExp', function() {
    expect(function() {
      new jasmineUnderTest.StringMatching({});
    }).toThrowError(/not a String or a RegExp/);
  });

  it("jasmineToString's itself", function() {
    const matching = new jasmineUnderTest.StringMatching(/^foo/);

    expect(matching.jasmineToString()).toEqual(
      '<jasmine.stringMatching(/^foo/)>'
    );
  });
});
