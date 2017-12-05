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

  if (typeof Map !== 'undefined') {
    it("matches an empty map", function () {
      var empty = new jasmineUnderTest.Empty();

      expect(empty.asymmetricMatch(new Map())).toBe(true);
    });
  }

  if (typeof Set !== 'undefined') {
    it("matches an empty map", function () {
      var empty = new jasmineUnderTest.Empty();

      expect(empty.asymmetricMatch(new Set())).toBe(true);
    });
  }
});
