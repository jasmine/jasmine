describe('ArrayContaining', function() {
  it('matches any actual to an empty array', function() {
    var containing = new jasmineUnderTest.ArrayContaining([]);

    expect(containing.asymmetricMatch('foo')).toBe(true);
  });

  it('does not work when not passed an array', function() {
    var containing = new jasmineUnderTest.ArrayContaining('foo');

    expect(function() {
      containing.asymmetricMatch([]);
    }).toThrowError(/not 'foo'/);
  });

  it('matches when the item is in the actual', function() {
    var containing = new jasmineUnderTest.ArrayContaining(['foo']);
    var matchersUtil = new jasmineUnderTest.MatchersUtil();

    expect(containing.asymmetricMatch(['foo'], matchersUtil)).toBe(true);
  });

  it('matches when additional items are in the actual', function() {
    var containing = new jasmineUnderTest.ArrayContaining(['foo']);
    var matchersUtil = new jasmineUnderTest.MatchersUtil();

    expect(containing.asymmetricMatch(['foo', 'bar'], matchersUtil)).toBe(true);
  });

  it('does not match when the item is not in the actual', function() {
    var containing = new jasmineUnderTest.ArrayContaining(['foo']);
    var matchersUtil = new jasmineUnderTest.MatchersUtil();

    expect(containing.asymmetricMatch(['bar'], matchersUtil)).toBe(false);
  });

  it('does not match when the actual is not an array', function() {
    var containing = new jasmineUnderTest.ArrayContaining(['foo']);
    var matchersUtil = new jasmineUnderTest.MatchersUtil();

    expect(containing.asymmetricMatch('foo', matchersUtil)).toBe(false);
  });

  it('jasmineToStrings itself', function() {
    var sample = [],
      matcher = new jasmineUnderTest.ArrayContaining(sample),
      pp = jasmine.createSpy('pp').and.returnValue('sample');

    expect(matcher.jasmineToString(pp)).toEqual(
      '<jasmine.arrayContaining(sample)>'
    );
    expect(pp).toHaveBeenCalledWith(sample);
  });

  it('uses custom equality testers', function() {
    var tester = function(a, b) {
      // All "foo*" strings match each other.
      if (
        typeof a == 'string' &&
        typeof b == 'string' &&
        a.slice(0, 3) == 'foo' &&
        b.slice(0, 3) == 'foo'
      ) {
        return true;
      }
    };
    var containing = new jasmineUnderTest.ArrayContaining(['fooVal']);
    var matchersUtil = new jasmineUnderTest.MatchersUtil({
      customTesters: [tester]
    });

    expect(containing.asymmetricMatch(['fooBar'], matchersUtil)).toBe(true);
  });
});
