describe("ObjectContaining", function() {

  it("matches any actual to an empty object", function() {
    var containing = new j$.ObjectContaining({});

    expect(containing.jasmineMatches("foo")).toBe(true);
  });

  it("does not match an empty object actual", function() {
    var containing = new j$.ObjectContaining("foo");

    expect(containing.jasmineMatches({})).toBe(false);
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
  
  it("mismatchValues parameter must return array with mismatched reason", function() {
    var containing = new j$.ObjectContaining({foo: "other"});
    
    var mismatchKeys = [];
    var mismatchValues = [];

    containing.jasmineMatches({foo: "fooVal", bar: "barVal"}, mismatchKeys, mismatchValues);
    
    expect(mismatchValues.length).toBe(1);
    
    expect(mismatchValues[0]).toEqual("'foo' was 'fooVal' in actual, but was 'other' in expected.");
  });

  it("jasmineToString's itself", function() {
    var containing = new j$.ObjectContaining({});

    expect(containing.jasmineToString()).toMatch("<jasmine.objectContaining");
  });
});