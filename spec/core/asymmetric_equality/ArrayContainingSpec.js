describe('ArrayContaining', function() {
  it('matches any actual to an empty array', function() {
    const containing = new privateUnderTest.ArrayContaining([]);

    expect(containing.asymmetricMatch('foo')).toBe(true);
  });

  it('does not work when not passed an array', function() {
    const containing = new privateUnderTest.ArrayContaining('foo');

    expect(function() {
      containing.asymmetricMatch([]);
    }).toThrowError(/not 'foo'/);
  });

  it('matches when the item is in the actual', function() {
    const containing = new privateUnderTest.ArrayContaining(['foo']);
    const matchersUtil = new privateUnderTest.MatchersUtil();

    expect(containing.asymmetricMatch(['foo'], matchersUtil)).toBe(true);
  });

  it('matches when additional items are in the actual', function() {
    const containing = new privateUnderTest.ArrayContaining(['foo']);
    const matchersUtil = new privateUnderTest.MatchersUtil();

    expect(containing.asymmetricMatch(['foo', 'bar'], matchersUtil)).toBe(true);
  });

  it('does not match when the item is not in the actual', function() {
    const containing = new privateUnderTest.ArrayContaining(['foo']);
    const matchersUtil = new privateUnderTest.MatchersUtil();

    expect(containing.asymmetricMatch(['bar'], matchersUtil)).toBe(false);
  });

  it('does not match when the actual is not an array', function() {
    const containing = new privateUnderTest.ArrayContaining(['foo']);
    const matchersUtil = new privateUnderTest.MatchersUtil();

    expect(containing.asymmetricMatch('foo', matchersUtil)).toBe(false);
  });

  it('jasmineToStrings itself', function() {
    const sample = [],
      matcher = new privateUnderTest.ArrayContaining(sample),
      pp = jasmine.createSpy('pp').and.returnValue('sample');

    expect(matcher.jasmineToString(pp)).toEqual(
      '<jasmine.arrayContaining(sample)>'
    );
    expect(pp).toHaveBeenCalledWith(sample);
  });

  it('uses custom equality testers', function() {
    const tester = function(a, b) {
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
    const containing = new privateUnderTest.ArrayContaining(['fooVal']);
    const matchersUtil = new privateUnderTest.MatchersUtil({
      customTesters: [tester]
    });

    expect(containing.asymmetricMatch(['fooBar'], matchersUtil)).toBe(true);
  });
});
