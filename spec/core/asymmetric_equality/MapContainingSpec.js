describe('MapContaining', function() {
  it('matches any actual map to an empty map', function() {
    var actualMap = new Map([['foo', 'bar']]);
    var containing = new jasmineUnderTest.MapContaining(new Map());

    expect(containing.asymmetricMatch(actualMap)).toBe(true);
  });

  it('matches when all the key/value pairs in sample have matches in actual', function() {
    var actualMap = new Map([
      ['foo', [1, 2, 3]],
      [{ foo: 'bar' }, 'baz'],
      ['other', 'any']
    ]);

    var containingMap = new Map([[{ foo: 'bar' }, 'baz'], ['foo', [1, 2, 3]]]);
    var containing = new jasmineUnderTest.MapContaining(containingMap);
    var matchersUtil = new jasmineUnderTest.MatchersUtil();

    expect(containing.asymmetricMatch(actualMap, matchersUtil)).toBe(true);
  });

  it('does not match when a key is not in actual', function() {
    var actualMap = new Map([
      ['foo', [1, 2, 3]],
      [{ foo: 'not a bar' }, 'baz']
    ]);

    var containingMap = new Map([[{ foo: 'bar' }, 'baz'], ['foo', [1, 2, 3]]]);
    var containing = new jasmineUnderTest.MapContaining(containingMap);
    var matchersUtil = new jasmineUnderTest.MatchersUtil();

    expect(containing.asymmetricMatch(actualMap, matchersUtil)).toBe(false);
  });

  it('does not match when a value is not in actual', function() {
    var actualMap = new Map([['foo', [1, 2, 3]], [{ foo: 'bar' }, 'baz']]);

    var containingMap = new Map([[{ foo: 'bar' }, 'baz'], ['foo', [1, 2]]]);
    var containing = new jasmineUnderTest.MapContaining(containingMap);
    var matchersUtil = new jasmineUnderTest.MatchersUtil();

    expect(containing.asymmetricMatch(actualMap, matchersUtil)).toBe(false);
  });

  it('matches when all the key/value pairs in sample have asymmetric matches in actual', function() {
    var actualMap = new Map([
      ['foo1', 'not a bar'],
      ['foo2', 'bar'],
      ['baz', [1, 2, 3, 4]]
    ]);

    var containingMap = new Map([
      [jasmineUnderTest.stringMatching(/^foo\d/), 'bar'],
      ['baz', jasmineUnderTest.arrayContaining([2, 3])]
    ]);
    var containing = new jasmineUnderTest.MapContaining(containingMap);
    var matchersUtil = new jasmineUnderTest.MatchersUtil();

    expect(containing.asymmetricMatch(actualMap, matchersUtil)).toBe(true);
  });

  it('does not match when a key in sample has no asymmetric matches in actual', function() {
    var actualMap = new Map([['a-foo1', 'bar'], ['baz', [1, 2, 3, 4]]]);

    var containingMap = new Map([
      [jasmineUnderTest.stringMatching(/^foo\d/), 'bar'],
      ['baz', jasmineUnderTest.arrayContaining([2, 3])]
    ]);
    var containing = new jasmineUnderTest.MapContaining(containingMap);
    var matchersUtil = new jasmineUnderTest.MatchersUtil();

    expect(containing.asymmetricMatch(actualMap, matchersUtil)).toBe(false);
  });

  it('does not match when a value in sample has no asymmetric matches in actual', function() {
    var actualMap = new Map([['foo1', 'bar'], ['baz', [1, 2, 3, 4]]]);

    var containingMap = new Map([
      [jasmineUnderTest.stringMatching(/^foo\d/), 'bar'],
      ['baz', jasmineUnderTest.arrayContaining([4, 5])]
    ]);
    var containing = new jasmineUnderTest.MapContaining(containingMap);
    var matchersUtil = new jasmineUnderTest.MatchersUtil();

    expect(containing.asymmetricMatch(actualMap, matchersUtil)).toBe(false);
  });

  it('matches recursively', function() {
    var actualMap = new Map([
      ['foo', new Map([['foo1', 1], ['foo2', 2]])],
      [new Map([[1, 'bar1'], [2, 'bar2']]), 'bar'],
      ['other', 'any']
    ]);

    var containingMap = new Map([
      ['foo', new jasmineUnderTest.MapContaining(new Map([['foo1', 1]]))],
      [new jasmineUnderTest.MapContaining(new Map([[2, 'bar2']])), 'bar']
    ]);
    var containing = new jasmineUnderTest.MapContaining(containingMap);
    var matchersUtil = new jasmineUnderTest.MatchersUtil();

    expect(containing.asymmetricMatch(actualMap, matchersUtil)).toBe(true);
  });

  it('uses custom equality testers', function() {
    function tester(a, b) {
      // treat all negative numbers as equal
      return typeof a == 'number' && typeof b == 'number'
        ? a < 0 && b < 0
        : a === b;
    }
    var actualMap = new Map([['foo', -1]]);
    var containing = new jasmineUnderTest.MapContaining(new Map([['foo', -2]]));
    var matchersUtil = new jasmineUnderTest.MatchersUtil({
      customTesters: [tester]
    });

    expect(containing.asymmetricMatch(actualMap, matchersUtil)).toBe(true);
  });

  it('does not match when actual is not a map', function() {
    var containingMap = new Map([['foo', 'bar']]);
    expect(
      new jasmineUnderTest.MapContaining(containingMap).asymmetricMatch('foo')
    ).toBe(false);
    expect(
      new jasmineUnderTest.MapContaining(containingMap).asymmetricMatch(-1)
    ).toBe(false);
    expect(
      new jasmineUnderTest.MapContaining(containingMap).asymmetricMatch({
        foo: 'bar'
      })
    ).toBe(false);
  });

  it('throws an error when sample is not a map', function() {
    expect(function() {
      new jasmineUnderTest.MapContaining({ foo: 'bar' }).asymmetricMatch(
        new Map()
      );
    }).toThrowError(/You must provide a map/);
  });

  it('defines a `jasmineToString` method', function() {
    var sample = new Map(),
      containing = new jasmineUnderTest.MapContaining(sample),
      pp = jasmine.createSpy('pp').and.returnValue('sample');

    expect(containing.jasmineToString(pp)).toEqual(
      '<jasmine.mapContaining(sample)>'
    );
    expect(pp).toHaveBeenCalledWith(sample);
  });
});
