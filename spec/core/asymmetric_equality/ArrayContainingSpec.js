describe("ArrayContaining", function() {
  it("matches any actual to an empty array", function() {
    var containing = new j$.ArrayContaining([]);

    expect(containing.asymmetricMatch("foo")).toBe(true);
  });

  it("does not work when not passed an array", function() {
    var containing = new j$.ArrayContaining("foo");

    expect(function() {
      containing.asymmetricMatch([]);
    }).toThrowError(/not 'foo'/);
  });

  it("matches when the item is in the actual", function() {
    var containing = new j$.ArrayContaining(["foo"]);

    expect(containing.asymmetricMatch(["foo"])).toBe(true);
  });

  it("matches when additional items are in the actual", function() {
    var containing = new j$.ArrayContaining(["foo"]);

    expect(containing.asymmetricMatch(["foo", "bar"])).toBe(true);
  });

  it("does not match when the item is not in the actual", function() {
    var containing = new j$.ArrayContaining(["foo"]);

    expect(containing.asymmetricMatch(["bar"])).toBe(false);
  });

  it("jasmineToStrings itself", function() {
    var containing = new j$.ArrayContaining([]);

    expect(containing.jasmineToString()).toMatch("<jasmine.arrayContaining");
  });
});
