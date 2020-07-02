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
    var fullMap = new Map(); // eslint-disable-line compat/compat
    fullMap.set('thing', 2);

    expect(empty.asymmetricMatch(new Map())).toBe(true); // eslint-disable-line compat/compat
    expect(empty.asymmetricMatch(fullMap)).toBe(false);
  });

  it("matches an empty set", function () {
    jasmine.getEnv().requireFunctioningSets();
    var empty = new jasmineUnderTest.Empty();
    var fullSet = new Set(); // eslint-disable-line compat/compat
    fullSet.add(3);

    expect(empty.asymmetricMatch(new Set())).toBe(true); // eslint-disable-line compat/compat
    expect(empty.asymmetricMatch(fullSet)).toBe(false);
  });

  it("matches an empty typed array", function() {
    jasmine.getEnv().requireFunctioningTypedArrays();
    var empty = new jasmineUnderTest.Empty();

    expect(empty.asymmetricMatch(new Int16Array())).toBe(true); // eslint-disable-line compat/compat
    expect(empty.asymmetricMatch(new Int16Array([1,2]))).toBe(false); // eslint-disable-line compat/compat
  });
});
