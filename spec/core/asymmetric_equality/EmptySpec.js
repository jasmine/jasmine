describe('Empty', function() {
  it('matches an empty object', function() {
    const empty = new jasmineUnderTest.Empty();

    expect(empty.asymmetricMatch({})).toBe(true);
    expect(empty.asymmetricMatch({ undefined: false })).toBe(false);
  });

  it('matches an empty array', function() {
    const empty = new jasmineUnderTest.Empty();

    expect(empty.asymmetricMatch([])).toBe(true);
    expect(empty.asymmetricMatch([1, 12, 3])).toBe(false);
  });

  it('matches an empty string', function() {
    const empty = new jasmineUnderTest.Empty();

    expect(empty.asymmetricMatch('')).toBe(true);
    expect(empty.asymmetricMatch('')).toBe(true);
    expect(empty.asymmetricMatch('12312')).toBe(false);
  });

  it('matches an empty map', function() {
    const empty = new jasmineUnderTest.Empty();
    const fullMap = new Map();
    fullMap.set('thing', 2);

    expect(empty.asymmetricMatch(new Map())).toBe(true);
    expect(empty.asymmetricMatch(fullMap)).toBe(false);
  });

  it('matches an empty set', function() {
    const empty = new jasmineUnderTest.Empty();
    const fullSet = new Set();
    fullSet.add(3);

    expect(empty.asymmetricMatch(new Set())).toBe(true);
    expect(empty.asymmetricMatch(fullSet)).toBe(false);
  });

  it('matches an empty typed array', function() {
    const empty = new jasmineUnderTest.Empty();

    expect(empty.asymmetricMatch(new Int16Array())).toBe(true);
    expect(empty.asymmetricMatch(new Int16Array([1, 2]))).toBe(false);
  });
});
