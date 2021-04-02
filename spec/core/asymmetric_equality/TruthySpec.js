describe('Truthy', function() {
  it('is true for a non empty string', function() {
    var truthy = new jasmineUnderTest.Truthy();

    expect(truthy.asymmetricMatch('foo')).toBe(true);
    expect(truthy.asymmetricMatch('')).toBe(false);
  });

  it('is true for a number that is not 0', function() {
    var truthy = new jasmineUnderTest.Truthy();

    expect(truthy.asymmetricMatch(1)).toBe(true);
    expect(truthy.asymmetricMatch(0)).toBe(false);
    expect(truthy.asymmetricMatch(-23)).toBe(true);
    expect(truthy.asymmetricMatch(-3.1)).toBe(true);
  });

  it('is true for a function', function() {
    var truthy = new jasmineUnderTest.Truthy();

    expect(truthy.asymmetricMatch(function() {})).toBe(true);
  });

  it('is true for an Object', function() {
    var truthy = new jasmineUnderTest.Truthy();

    expect(truthy.asymmetricMatch({})).toBe(true);
  });

  it('is true for a truthful Boolean', function() {
    var truthy = new jasmineUnderTest.Truthy();

    expect(truthy.asymmetricMatch(true)).toBe(true);
    expect(truthy.asymmetricMatch(false)).toBe(false);
  });

  it('is true for an empty object', function() {
    var truthy = new jasmineUnderTest.Truthy();

    expect(truthy.asymmetricMatch({})).toBe(true);
  });

  it('is true for an empty array', function() {
    var truthy = new jasmineUnderTest.Truthy();

    expect(truthy.asymmetricMatch([])).toBe(true);
  });

  it('is true for a date', function() {
    var truthy = new jasmineUnderTest.Truthy();

    expect(truthy.asymmetricMatch(new Date())).toBe(true);
  });

  it('is true for a infiniti', function() {
    var truthy = new jasmineUnderTest.Truthy();

    expect(truthy.asymmetricMatch(Infinity)).toBe(true);
    expect(truthy.asymmetricMatch(-Infinity)).toBe(true);
  });
});
