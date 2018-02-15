describe("Empty", function () {
  it("matches an empty object", function () {
    var empty = new jasmineUnderTest.Empty();

    expect(empty.asymmetricMatch({})).toBe(true);
    expect(empty.asymmetricMatch({undefined: false})).toBe(false);
  });

  it("matches an empty array", function () {
    var empty = new jasmineUnderTest.Empty();

    expect(empty.asymmetricMatch([])).toBe(true);
    expect(empty.asymmetricMatch([1, 12, 3])).toBe(false);
  });

  it("matches an empty string", function () {
    var empty = new jasmineUnderTest.Empty();

    expect(empty.asymmetricMatch("")).toBe(true);
    expect(empty.asymmetricMatch('')).toBe(true);
    expect(empty.asymmetricMatch('12312')).toBe(false);
  });

  it("matches an empty map", function () {
    jasmine.getEnv().requireFunctioningMaps();
    var empty = new jasmineUnderTest.Empty();

    expect(empty.asymmetricMatch(new Map())).toBe(true);
  });

  it("matches an empty map", function () {
    jasmine.getEnv().requireFunctioningSets();
    var empty = new jasmineUnderTest.Empty();

    expect(empty.asymmetricMatch(new Set())).toBe(true);
  });

  it("matches an empty typed array", function() {
    jasmine.getEnv().requireFunctioningTypedArrays();
    var empty = new jasmineUnderTest.Empty();

    expect(empty.asymmetricMatch(new Int16Array())).toBe(true);
  });
});
