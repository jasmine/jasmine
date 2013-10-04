describe("ArrayContaining", function() {
  it("matches any actual to an empty array", function() {
    var containing = new j$.ArrayContaining([]);

    expect(containing.jasmineMatches("foo")).toBe(true);
  });

  it("does not work when not passed an array", function() {
    var containing = new j$.ArrayContaining("foo");

    expect(function() {
      containing.jasmineMatches([]);
    }).toThrowError(/not 'foo'/);
  });

  it("matches when the item is in the actual", function() {
    var containing = new j$.ArrayContaining(["foo"]);

    expect(containing.jasmineMatches(["foo"])).toBe(true);
  });

  it("matches when additional items are in the actual", function() {
    var containing = new j$.ArrayContaining(["foo"]);

    expect(containing.jasmineMatches(["foo", "bar"])).toBe(true);
  });

  it("does not match when the item is not in the actual", function() {
    var containing = new j$.ArrayContaining(["foo"]);

    expect(containing.jasmineMatches(["bar"])).toBe(false);
  });

  it("mismatchValues parameter returns array with mismatched reason", function() {
    var containing = new j$.ArrayContaining(["foo", "bar"]);

    var mismatchKeys = [];
    var mismatchValues = [];

    containing.jasmineMatches([], mismatchKeys, mismatchValues);

    expect(mismatchValues.length).toBe(1);
    expect(mismatchValues[0]).toEqual("expected to have values ['foo','bar']")
  });

  it("jasmineToStrings itself", function() {
    var containing = new j$.ArrayContaining([]);

    expect(containing.jasmineToString()).toMatch("<jasmine.arrayContaining");
  });
});
