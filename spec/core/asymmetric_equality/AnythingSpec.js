describe("Anything", function() {
  it("matches a string", function() {
    var anything = new j$.Anything();

    expect(anything.asymmetricMatch('foo')).toBe(true);
  });

  it("matches a number", function() {
    var anything = new j$.Anything();

    expect(anything.asymmetricMatch(42)).toBe(true);
  });

  it("matches an object", function() {
    var anything = new j$.Anything();

    expect(anything.asymmetricMatch({ foo: 'bar' })).toBe(true);
  });

  it("matches an array", function() {
    var anything = new j$.Anything();

    expect(anything.asymmetricMatch([1,2,3])).toBe(true);
  });

  it("doesn't match undefined", function() {
    var anything = new j$.Anything();

    expect(anything.asymmetricMatch()).toBe(false);
    expect(anything.asymmetricMatch(undefined)).toBe(false);
  });

  it("doesn't match null", function() {
    var anything = new j$.Anything();

    expect(anything.asymmetricMatch(null)).toBe(false);
  });

  it("jasmineToString's itself", function() {
    var anything = new j$.Anything();

    expect(anything.jasmineToString()).toEqual("<jasmine.anything>");
  });
});
