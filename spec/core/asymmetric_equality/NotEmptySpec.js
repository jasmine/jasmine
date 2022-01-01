describe('NotEmpty', function() {
  it('matches a non empty object', function() {
    var notEmpty = new jasmineUnderTest.NotEmpty();

    expect(notEmpty.asymmetricMatch({ undefined: false })).toBe(true);
    expect(notEmpty.asymmetricMatch({})).toBe(false);
  });

  it('matches a non empty array', function() {
    var notEmpty = new jasmineUnderTest.NotEmpty();

    expect(notEmpty.asymmetricMatch([1, 12, 3])).toBe(true);
    expect(notEmpty.asymmetricMatch([])).toBe(false);
  });

  it('matches a non empty string', function() {
    var notEmpty = new jasmineUnderTest.NotEmpty();

    expect(notEmpty.asymmetricMatch('12312')).toBe(true);
    expect(notEmpty.asymmetricMatch('')).toBe(false);
    expect(notEmpty.asymmetricMatch('')).toBe(false);
  });

  it('matches a non empty map', function() {
    var notEmpty = new jasmineUnderTest.NotEmpty();
    var fullMap = new Map();
    fullMap.set('one', 1);
    var emptyMap = new Map();

    expect(notEmpty.asymmetricMatch(fullMap)).toBe(true);
    expect(notEmpty.asymmetricMatch(emptyMap)).toBe(false);
  });

  it('matches a non empty set', function() {
    var notEmpty = new jasmineUnderTest.NotEmpty();
    var filledSet = new Set();
    filledSet.add(1);
    var emptySet = new Set();

    expect(notEmpty.asymmetricMatch(filledSet)).toBe(true);
    expect(notEmpty.asymmetricMatch(emptySet)).toBe(false);
  });

  it('matches a non empty typed array', function() {
    var notEmpty = new jasmineUnderTest.NotEmpty();

    expect(notEmpty.asymmetricMatch(new Int16Array([1, 2, 3]))).toBe(true);
    expect(notEmpty.asymmetricMatch(new Int16Array())).toBe(false);
  });
});
