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
  
  it("mismatchValues parameter must return array with mismatched reason", function() {
    var containing = new j$.ObjectContaining({foo: "other"});
    
    var mismatchKeys = [];
    var mismatchValues = [];

    containing.jasmineMatches({foo: "fooVal", bar: "barVal"}, mismatchKeys, mismatchValues);
    
    expect(mismatchValues.length).toBe(1);
    expect(mismatchValues[0]).toEqual("'foo' was 'fooVal' in actual, but was 'other' in expected.");
  });

  it("adds keys in expected but not actual to the mismatchKeys parameter", function() {
    var containing = new j$.ObjectContaining({foo: "fooVal"});

    var mismatchKeys = [];
    var mismatchValues = [];

    containing.jasmineMatches({bar: "barVal"}, mismatchKeys, mismatchValues);

    expect(mismatchKeys.length).toBe(1);
    expect(mismatchKeys[0]).toEqual("expected has key 'foo', but missing from actual.");
  });

  it("jasmineToString's itself", function() {
    var containing = new j$.ObjectContaining({});

    expect(containing.jasmineToString()).toMatch("<jasmine.objectContaining");
  });
});