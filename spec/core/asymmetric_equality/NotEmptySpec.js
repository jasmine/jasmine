describe("NotEmpty", function () {
  it("matches a non empty object", function () {
    var notEmpty = new jasmineUnderTest.NotEmpty();

    expect(notEmpty.asymmetricMatch({undefined: false})).toBe(true);
    expect(notEmpty.asymmetricMatch({})).toBe(false);
  });

  it("matches a non empty array", function () {
    var notEmpty = new jasmineUnderTest.NotEmpty();

    expect(notEmpty.asymmetricMatch([1, 12, 3])).toBe(true);
    expect(notEmpty.asymmetricMatch([])).toBe(false);
  });

  it("matches a non empty string", function () {
    var notEmpty = new jasmineUnderTest.NotEmpty();

    expect(notEmpty.asymmetricMatch('12312')).toBe(true);
    expect(notEmpty.asymmetricMatch("")).toBe(false);
    expect(notEmpty.asymmetricMatch('')).toBe(false);
  });

  it("matches a non empty map", function () {
    jasmine.getEnv().requireFunctioningMaps();
    var notEmpty = new jasmineUnderTest.NotEmpty();
    var fullMap = new Map([['one',1]]);
    var emptyMap = new Map();

    expect(notEmpty.asymmetricMatch(fullMap)).toBe(true);
    expect(notEmpty.asymmetricMatch(emptyMap)).toBe(false);
  });

  it("matches a non empty map", function () {
    jasmine.getEnv().requireFunctioningMaps();
    var notEmpty = new jasmineUnderTest.NotEmpty();
    var filledSet = new Set([1,2,2,2,2,34]);

    expect(notEmpty.asymmetricMatch(filledSet)).toBe(true);
  });

  it("matches an empty typed array", function() {
    jasmine.getEnv().requireFunctioningTypedArrays();
    var notEmpty = new jasmineUnderTest.NotEmpty();

    expect(notEmpty.asymmetricMatch(new Int16Array([1,2,3]))).toBe(true);
  });
});
