describe('AllOf', function() {
  it('matches a single value', function() {
    const matchersUtil = new privateUnderTest.MatchersUtil();
    const allOf = new privateUnderTest.AllOf('foo');

    expect(allOf.asymmetricMatch('foo', matchersUtil)).toBeTrue();
  });

  it('matches a single matcher', function() {
    const matchersUtil = new privateUnderTest.MatchersUtil();
    const allOf = new privateUnderTest.AllOf(
      new privateUnderTest.StringContaining('oo')
    );

    expect(allOf.asymmetricMatch('foo', matchersUtil)).toBeTrue();
  });

  it('matches multiple matchers', function() {
    const matchersUtil = new privateUnderTest.MatchersUtil();
    const allOf = new privateUnderTest.AllOf(
      new privateUnderTest.StringContaining('o'),
      new privateUnderTest.StringContaining('f')
    );

    expect(allOf.asymmetricMatch('foo', matchersUtil)).toBeTrue();
  });

  it('does not match when value does not match', function() {
    const matchersUtil = new privateUnderTest.MatchersUtil();
    const allOf = new privateUnderTest.AllOf('bar');

    expect(allOf.asymmetricMatch('foo', matchersUtil)).toBeFalse();
  });

  it('does not match when any matchers fail', function() {
    const matchersUtil = new privateUnderTest.MatchersUtil();
    const allOf = new privateUnderTest.AllOf(
      new privateUnderTest.StringContaining('o'),
      new privateUnderTest.StringContaining('x')
    );

    expect(allOf.asymmetricMatch('foo', matchersUtil)).toBeFalse();
  });

  it('jasmineToStrings itself', function() {
    const matcher = new privateUnderTest.AllOf('o');
    const pp = jasmine.createSpy('pp').and.returnValue('sample');

    expect(matcher.jasmineToString(pp)).toEqual('<jasmine.allOf(sample)>');
    expect(pp).toHaveBeenCalledWith(['o']);
  });

  describe('when called without an argument', function() {
    it('tells the user to pass a constructor argument', function() {
      expect(function() {
        new privateUnderTest.AllOf();
      }).toThrowError(
        TypeError,
        'jasmine.allOf() expects at least one argument to be passed.'
      );
    });
  });
});
