describe('MapContaining', function() {
  it('matches any actual map to an empty map', function() {
    const actualMap = new Map([['foo', 'bar']]);
    const containing = new privateUnderTest.MapContaining(new Map());

    expect(containing.asymmetricMatch(actualMap)).toBe(true);
  });

  it('matches when all the key/value pairs in sample have matches in actual', function() {
    const actualMap = new Map([
      ['foo', [1, 2, 3]],
      [{ foo: 'bar' }, 'baz'],
      ['other', 'any']
    ]);

    const containingMap = new Map([
      [{ foo: 'bar' }, 'baz'],
      ['foo', [1, 2, 3]]
    ]);
    const containing = new privateUnderTest.MapContaining(containingMap);
    const matchersUtil = new privateUnderTest.MatchersUtil();

    expect(containing.asymmetricMatch(actualMap, matchersUtil)).toBe(true);
  });

  it('does not match when a key is not in actual', function() {
    const actualMap = new Map([
      ['foo', [1, 2, 3]],
      [{ foo: 'not a bar' }, 'baz']
    ]);

    const containingMap = new Map([
      [{ foo: 'bar' }, 'baz'],
      ['foo', [1, 2, 3]]
    ]);
    const containing = new privateUnderTest.MapContaining(containingMap);
    const matchersUtil = new privateUnderTest.MatchersUtil();

    expect(containing.asymmetricMatch(actualMap, matchersUtil)).toBe(false);
  });

  it('does not match when a value is not in actual', function() {
    const actualMap = new Map([['foo', [1, 2, 3]], [{ foo: 'bar' }, 'baz']]);

    const containingMap = new Map([[{ foo: 'bar' }, 'baz'], ['foo', [1, 2]]]);
    const containing = new privateUnderTest.MapContaining(containingMap);
    const matchersUtil = new privateUnderTest.MatchersUtil();

    expect(containing.asymmetricMatch(actualMap, matchersUtil)).toBe(false);
  });

  it('matches when all the key/value pairs in sample have asymmetric matches in actual', function() {
    const actualMap = new Map([
      ['foo1', 'not a bar'],
      ['foo2', 'bar'],
      ['baz', [1, 2, 3, 4]]
    ]);

    const containingMap = new Map([
      [jasmineUnderTest.stringMatching(/^foo\d/), 'bar'],
      ['baz', jasmineUnderTest.arrayContaining([2, 3])]
    ]);
    const containing = new privateUnderTest.MapContaining(containingMap);
    const matchersUtil = new privateUnderTest.MatchersUtil();

    expect(containing.asymmetricMatch(actualMap, matchersUtil)).toBe(true);
  });

  it('does not match when a key in sample has no asymmetric matches in actual', function() {
    const actualMap = new Map([['a-foo1', 'bar'], ['baz', [1, 2, 3, 4]]]);

    const containingMap = new Map([
      [jasmineUnderTest.stringMatching(/^foo\d/), 'bar'],
      ['baz', jasmineUnderTest.arrayContaining([2, 3])]
    ]);
    const containing = new privateUnderTest.MapContaining(containingMap);
    const matchersUtil = new privateUnderTest.MatchersUtil();

    expect(containing.asymmetricMatch(actualMap, matchersUtil)).toBe(false);
  });

  it('does not match when a value in sample has no asymmetric matches in actual', function() {
    const actualMap = new Map([['foo1', 'bar'], ['baz', [1, 2, 3, 4]]]);

    const containingMap = new Map([
      [jasmineUnderTest.stringMatching(/^foo\d/), 'bar'],
      ['baz', jasmineUnderTest.arrayContaining([4, 5])]
    ]);
    const containing = new privateUnderTest.MapContaining(containingMap);
    const matchersUtil = new privateUnderTest.MatchersUtil();

    expect(containing.asymmetricMatch(actualMap, matchersUtil)).toBe(false);
  });

  it('matches recursively', function() {
    const actualMap = new Map([
      ['foo', new Map([['foo1', 1], ['foo2', 2]])],
      [new Map([[1, 'bar1'], [2, 'bar2']]), 'bar'],
      ['other', 'any']
    ]);

    const containingMap = new Map([
      ['foo', new privateUnderTest.MapContaining(new Map([['foo1', 1]]))],
      [new privateUnderTest.MapContaining(new Map([[2, 'bar2']])), 'bar']
    ]);
    const containing = new privateUnderTest.MapContaining(containingMap);
    const matchersUtil = new privateUnderTest.MatchersUtil();

    expect(containing.asymmetricMatch(actualMap, matchersUtil)).toBe(true);
  });

  it('uses custom equality testers', function() {
    function tester(a, b) {
      // treat all negative numbers as equal
      return typeof a == 'number' && typeof b == 'number'
        ? a < 0 && b < 0
        : a === b;
    }
    const actualMap = new Map([['foo', -1]]);
    const containing = new privateUnderTest.MapContaining(
      new Map([['foo', -2]])
    );
    const matchersUtil = new privateUnderTest.MatchersUtil({
      customTesters: [tester]
    });

    expect(containing.asymmetricMatch(actualMap, matchersUtil)).toBe(true);
  });

  it('does not match when actual is not a map', function() {
    const containingMap = new Map([['foo', 'bar']]);
    expect(
      new privateUnderTest.MapContaining(containingMap).asymmetricMatch('foo')
    ).toBe(false);
    expect(
      new privateUnderTest.MapContaining(containingMap).asymmetricMatch(-1)
    ).toBe(false);
    expect(
      new privateUnderTest.MapContaining(containingMap).asymmetricMatch({
        foo: 'bar'
      })
    ).toBe(false);
  });

  it('throws an error when sample is not a map', function() {
    expect(function() {
      new privateUnderTest.MapContaining({ foo: 'bar' }).asymmetricMatch(
        new Map()
      );
    }).toThrowError(/You must provide a map/);
  });

  it('defines a `jasmineToString` method', function() {
    const sample = new Map(),
      containing = new privateUnderTest.MapContaining(sample),
      pp = jasmine.createSpy('pp').and.returnValue('sample');

    expect(containing.jasmineToString(pp)).toEqual(
      '<jasmine.mapContaining(sample)>'
    );
    expect(pp).toHaveBeenCalledWith(sample);
  });
});
