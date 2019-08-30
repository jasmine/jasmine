describe("ArrayContaining", function() {
  it("matches any actual to an empty array", function() {
    var containing = new jasmineUnderTest.ArrayContaining([]);

    expect(containing.asymmetricMatch("foo")).toBe(true);
  });

  it("does not work when not passed an array", function() {
    var containing = new jasmineUnderTest.ArrayContaining("foo");

    expect(function() {
      containing.asymmetricMatch([]);
    }).toThrowError(/not 'foo'/);
  });

  it("matches when the item is in the actual", function() {
    var containing = new jasmineUnderTest.ArrayContaining(["foo"]);

    expect(containing.asymmetricMatch(["foo"])).toBe(true);
  });

  it("matches when additional items are in the actual", function() {
    var containing = new jasmineUnderTest.ArrayContaining(["foo"]);

    expect(containing.asymmetricMatch(["foo", "bar"])).toBe(true);
  });

  it("does not match when the item is not in the actual", function() {
    var containing = new jasmineUnderTest.ArrayContaining(["foo"]);

    expect(containing.asymmetricMatch(["bar"])).toBe(false);
  });

  it("does not match when the actual is not an array", function() {
    var containing = new jasmineUnderTest.ArrayContaining(["foo"]);

    expect(containing.asymmetricMatch("foo")).toBe(false);
  });

  it("jasmineToStrings itself", function() {
    var containing = new jasmineUnderTest.ArrayContaining([]);

    expect(containing.jasmineToString()).toMatch("<jasmine.arrayContaining");
  });

  it("uses custom equality testers", function() {
    var tester = function(a, b) {
      // All "foo*" strings match each other.
      if (typeof a == "string" && typeof b == "string" &&
          a.substr(0, 3) == "foo" && b.substr(0, 3) == "foo") {
        return true;
      }
    };
    var containing = new jasmineUnderTest.ArrayContaining(["fooVal"]);

    expect(containing.asymmetricMatch(["fooBar"], [tester])).toBe(true);
  });
});
