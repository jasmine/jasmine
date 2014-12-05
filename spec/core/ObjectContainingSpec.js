describe("ObjectContaining", function() {

  it("matches any actual to an empty object", function() {
    var containing = new j$.ObjectContaining({});

    expect(containing.jasmineMatches("foo")).toBe(true);
  });

  it("does not match an empty object actual", function() {
    var containing = new j$.ObjectContaining("foo");

    expect(function() {
      containing.jasmineMatches({})
    }).toThrowError(/not 'foo'/)
  });

  it("matches when the key/value pair is present in the actual", function() {
    var containing = new j$.ObjectContaining({foo: "fooVal"});

    expect(containing.jasmineMatches({foo: "fooVal", bar: "barVal"})).toBe(true);
  });

  it("does not match when the key/value pair is not present in the actual", function() {
    var containing = new j$.ObjectContaining({foo: "fooVal"});

    expect(containing.jasmineMatches({bar: "barVal", quux: "quuxVal"})).toBe(false);
  });

  it("does not match when the key is present but the value is different in the actual", function() {
    var containing = new j$.ObjectContaining({foo: "other"});

    expect(containing.jasmineMatches({foo: "fooVal", bar: "barVal"})).toBe(false);
  });

  it("jasmineToString's itself", function() {
    var containing = new j$.ObjectContaining({});

    expect(containing.jasmineToString()).toMatch("<jasmine.objectContaining");
  });

  it("matches recursively", function() {
    var containing = new j$.ObjectContaining({one: new j$.ObjectContaining({two: {}})});

    expect(containing.jasmineMatches({one: {two: {}}})).toBe(true);
  });
});
