describe('SetContaining', function() {
  it('matches any actual set to an empty set', function() {
    const actualSet = new Set(['foo', 'bar']);
    const containing = new jasmineUnderTest.SetContaining(new Set());

    expect(containing.asymmetricMatch(actualSet)).toBe(true);
  });

  it('matches when all the values in sample have matches in actual', function() {
    const actualSet = new Set([{ foo: 'bar' }, 'baz', [1, 2, 3]]);

    const containingSet = new Set([[1, 2, 3], { foo: 'bar' }]);
    const containing = new jasmineUnderTest.SetContaining(containingSet);
    const matchersUtil = new jasmineUnderTest.MatchersUtil();

    expect(containing.asymmetricMatch(actualSet, matchersUtil)).toBe(true);
  });

  it('does not match when a value is not in actual', function() {
    const actualSet = new Set([{ foo: 'bar' }, 'baz', [1, 2, 3]]);

    const containingSet = new Set([[1, 2], { foo: 'bar' }]);
    const containing = new jasmineUnderTest.SetContaining(containingSet);
    const matchersUtil = new jasmineUnderTest.MatchersUtil();

    expect(containing.asymmetricMatch(actualSet, matchersUtil)).toBe(false);
  });

  it('matches when all the values in sample have asymmetric matches in actual', function() {
    const actualSet = new Set([[1, 2, 3, 4], 'other', 'foo1']);

    const containingSet = new Set([
      jasmineUnderTest.stringMatching(/^foo\d/),
      jasmineUnderTest.arrayContaining([2, 3])
    ]);
    const containing = new jasmineUnderTest.SetContaining(containingSet);
    const matchersUtil = new jasmineUnderTest.MatchersUtil();

    expect(containing.asymmetricMatch(actualSet, matchersUtil)).toBe(true);
  });

  it('does not match when a value in sample has no asymmetric matches in actual', function() {
    const actualSet = new Set(['a-foo1', [1, 2, 3, 4], 'other']);

    const containingSet = new Set([
      jasmine.stringMatching(/^foo\d/),
      jasmine.arrayContaining([2, 3])
    ]);
    const containing = new jasmineUnderTest.SetContaining(containingSet);
    const matchersUtil = new jasmineUnderTest.MatchersUtil();

    expect(containing.asymmetricMatch(actualSet, matchersUtil)).toBe(false);
  });

  it('matches recursively', function() {
    const actualSet = new Set(['foo', new Set([1, 'bar', 2]), 'other']);

    const containingSet = new Set([
      new jasmineUnderTest.SetContaining(new Set(['bar'])),
      'foo'
    ]);
    const containing = new jasmineUnderTest.SetContaining(containingSet);
    const matchersUtil = new jasmineUnderTest.MatchersUtil();

    expect(containing.asymmetricMatch(actualSet, matchersUtil)).toBe(true);
  });

  it('uses custom equality testers', function() {
    function tester(a, b) {
      // treat all negative numbers as equal
      return typeof a == 'number' && typeof b == 'number'
        ? a < 0 && b < 0
        : a === b;
    }
    const actualSet = new Set(['foo', -1]);
    const containing = new jasmineUnderTest.SetContaining(new Set([-2, 'foo']));
    const matchersUtil = new jasmineUnderTest.MatchersUtil({
      customTesters: [tester]
    });

    expect(containing.asymmetricMatch(actualSet, matchersUtil)).toBe(true);
  });

  it('does not match when actual is not a set', function() {
    const containingSet = new Set(['foo']);
    expect(
      new jasmineUnderTest.SetContaining(containingSet).asymmetricMatch('foo')
    ).toBe(false);
    expect(
      new jasmineUnderTest.SetContaining(containingSet).asymmetricMatch(1)
    ).toBe(false);
    expect(
      new jasmineUnderTest.SetContaining(containingSet).asymmetricMatch(['foo'])
    ).toBe(false);
  });

  it('throws an error when sample is not a set', function() {
    expect(function() {
      new jasmineUnderTest.SetContaining({ foo: 'bar' }).asymmetricMatch(
        new Set()
      );
    }).toThrowError(/You must provide a set/);
  });

  it('defines a `jasmineToString` method', function() {
    const sample = new Set(),
      containing = new jasmineUnderTest.SetContaining(sample),
      pp = jasmine.createSpy('pp').and.returnValue('sample');

    expect(containing.jasmineToString(pp)).toEqual(
      '<jasmine.setContaining(sample)>'
    );
    expect(pp).toHaveBeenCalledWith(sample);
  });
});
