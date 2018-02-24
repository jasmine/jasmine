describe("ArrayWithExactContents", function() {
  it("matches an array with the same items in a different order", function() {
    var matcher = new jasmineUnderTest.ArrayWithExactContents(['a', 2, /a/]);

    expect(matcher.asymmetricMatch([2, 'a', /a/])).toBe(true);
  });

  it("does not work when not passed an array", function() {
    var matcher = new jasmineUnderTest.ArrayWithExactContents("foo");

    expect(function() {
      matcher.asymmetricMatch([]);
    }).toThrowError(/not 'foo'/);
  });

  it("does not match when an item is missing", function() {
    var matcher = new jasmineUnderTest.ArrayWithExactContents(['a', 2, /a/]);

    expect(matcher.asymmetricMatch(['a', 2])).toBe(false);
    expect(matcher.asymmetricMatch(['a', 2, undefined])).toBe(false);
  });

  it("does not match when there is an extra item", function() {
    var matcher = new jasmineUnderTest.ArrayWithExactContents(['a']);

    expect(matcher.asymmetricMatch(['a', 2])).toBe(false);
  });

  it("jasmineToStrings itself", function() {
    var matcher = new jasmineUnderTest.ArrayWithExactContents([]);

    expect(matcher.jasmineToString()).toMatch("<jasmine.arrayWithExactContents");
  });

  it("uses custom equality testers", function() {
    var tester = function(a, b) {
      // All "foo*" strings match each other.
      if (typeof a === "string" && typeof b === "string" &&
          a.substr(0, 3) === "foo" && b.substr(0, 3) === "foo") {
        return true;
      }
    };
    var matcher = new jasmineUnderTest.ArrayWithExactContents(["fooVal"]);

    expect(matcher.asymmetricMatch(["fooBar"], [tester])).toBe(true);
  });
});
