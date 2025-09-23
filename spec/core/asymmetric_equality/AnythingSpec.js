describe('Anything', function() {
  it('matches a string', function() {
    const anything = new privateUnderTest.Anything();

    expect(anything.asymmetricMatch('foo')).toBe(true);
  });

  it('matches a number', function() {
    const anything = new privateUnderTest.Anything();

    expect(anything.asymmetricMatch(42)).toBe(true);
  });

  it('matches an object', function() {
    const anything = new privateUnderTest.Anything();

    expect(anything.asymmetricMatch({ foo: 'bar' })).toBe(true);
  });

  it('matches an array', function() {
    const anything = new privateUnderTest.Anything();

    expect(anything.asymmetricMatch([1, 2, 3])).toBe(true);
  });

  it('matches a Map', function() {
    const anything = new privateUnderTest.Anything();

    expect(anything.asymmetricMatch(new Map())).toBe(true);
  });

  it('matches a Set', function() {
    const anything = new privateUnderTest.Anything();

    expect(anything.asymmetricMatch(new Set())).toBe(true);
  });

  it('matches a TypedArray', function() {
    const anything = new privateUnderTest.Anything();

    expect(anything.asymmetricMatch(new Uint32Array([]))).toBe(true);
  });

  it('matches a Symbol', function() {
    const anything = new privateUnderTest.Anything();

    expect(anything.asymmetricMatch(Symbol())).toBe(true);
  });

  it("doesn't match undefined", function() {
    const anything = new privateUnderTest.Anything();

    expect(anything.asymmetricMatch()).toBe(false);
    expect(anything.asymmetricMatch(undefined)).toBe(false);
  });

  it("doesn't match null", function() {
    const anything = new privateUnderTest.Anything();

    expect(anything.asymmetricMatch(null)).toBe(false);
  });

  it("jasmineToString's itself", function() {
    const anything = new privateUnderTest.Anything();

    expect(anything.jasmineToString()).toEqual('<jasmine.anything>');
  });
});
