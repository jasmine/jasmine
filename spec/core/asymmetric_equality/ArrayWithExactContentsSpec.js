describe('ArrayWithExactContents', function() {
  it('matches an array with the same items in a different order', function() {
    var matcher = new jasmineUnderTest.ArrayWithExactContents(['a', 2, /a/]);
    var matchersUtil = new jasmineUnderTest.MatchersUtil();

    expect(matcher.asymmetricMatch([2, 'a', /a/], matchersUtil)).toBe(true);
  });

  it('does not work when not passed an array', function() {
    var matcher = new jasmineUnderTest.ArrayWithExactContents('foo');

    expect(function() {
      matcher.asymmetricMatch([]);
    }).toThrowError(/not 'foo'/);
  });

  it('does not match when an item is missing', function() {
    var matcher = new jasmineUnderTest.ArrayWithExactContents(['a', 2, /a/]);
    var matchersUtil = new jasmineUnderTest.MatchersUtil();

    expect(matcher.asymmetricMatch(['a', 2], matchersUtil)).toBe(false);
    expect(matcher.asymmetricMatch(['a', 2, undefined], matchersUtil)).toBe(
      false
    );
  });

  it('does not match when there is an extra item', function() {
    var matcher = new jasmineUnderTest.ArrayWithExactContents(['a']);
    var matchersUtil = new jasmineUnderTest.MatchersUtil();

    expect(matcher.asymmetricMatch(['a', 2], matchersUtil)).toBe(false);
  });

  it('jasmineToStrings itself', function() {
    var sample = [],
      matcher = new jasmineUnderTest.ArrayWithExactContents(sample),
      pp = jasmine.createSpy('pp').and.returnValue('sample');

    expect(matcher.jasmineToString(pp)).toEqual(
      '<jasmine.arrayWithExactContents(sample)>'
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
    var matcher = new jasmineUnderTest.ArrayWithExactContents(['fooVal']);
    var matchersUtil = new jasmineUnderTest.MatchersUtil({
      customTesters: [tester]
    });

    expect(matcher.asymmetricMatch(['fooBar'], matchersUtil)).toBe(true);
  });
});
