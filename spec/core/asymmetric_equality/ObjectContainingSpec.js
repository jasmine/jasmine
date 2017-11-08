describe("ObjectContaining", function() {

  it("matches any actual to an empty object", function() {
    var containing = new jasmineUnderTest.ObjectContaining({});

    expect(containing.asymmetricMatch("foo")).toBe(true);
  });

  it("does not match an empty object actual", function() {
    var containing = new jasmineUnderTest.ObjectContaining("foo");

    expect(function() {
      containing.asymmetricMatch({})
    }).toThrowError(/not 'foo'/)
  });

  it("matches when the key/value pair is present in the actual", function() {
    var containing = new jasmineUnderTest.ObjectContaining({foo: "fooVal"});

    expect(containing.asymmetricMatch({foo: "fooVal", bar: "barVal"})).toBe(true);
  });

  it("does not match when the key/value pair is not present in the actual", function() {
    var containing = new jasmineUnderTest.ObjectContaining({foo: "fooVal"});

    expect(containing.asymmetricMatch({bar: "barVal", quux: "quuxVal"})).toBe(false);
  });

  it("does not match when the key is present but the value is different in the actual", function() {
    var containing = new jasmineUnderTest.ObjectContaining({foo: "other"});

    expect(containing.asymmetricMatch({foo: "fooVal", bar: "barVal"})).toBe(false);
  });

  it("jasmineToString's itself", function() {
    var containing = new jasmineUnderTest.ObjectContaining({});

    expect(containing.jasmineToString()).toMatch("<jasmine.objectContaining");
  });

  it("matches recursively", function() {
    var containing = new jasmineUnderTest.ObjectContaining({one: new jasmineUnderTest.ObjectContaining({two: {}})});

    expect(containing.asymmetricMatch({one: {two: {}}})).toBe(true);
  });

  it("matches when key is present with undefined value", function() {
    var containing = new jasmineUnderTest.ObjectContaining({ one: undefined });

    expect(containing.asymmetricMatch({ one: undefined })).toBe(true);
  });

  it("does not match when key with undefined value is not present", function() {
    var containing = new jasmineUnderTest.ObjectContaining({ one: undefined });

    expect(containing.asymmetricMatch({})).toBe(false);
  });

  it("matches defined properties", function(){
    var containing = new jasmineUnderTest.ObjectContaining({ foo: "fooVal" });

    var definedPropertyObject = {};
    Object.defineProperty(definedPropertyObject, "foo", {
      get: function() { return "fooVal" }
    });
    expect(containing.asymmetricMatch(definedPropertyObject)).toBe(true);
  });

  it("matches prototype properties", function(){
    var containing = new jasmineUnderTest.ObjectContaining({ foo: "fooVal" });

    var prototypeObject = {foo: "fooVal"};
    var obj;

    if (Object.create) {
      obj = Object.create(prototypeObject);
    } else {
      function Foo() {}
      Foo.prototype = prototypeObject;
      Foo.prototype.constructor = Foo;
      obj = new Foo();
    }

    expect(containing.asymmetricMatch(obj)).toBe(true);
  });

  it("uses custom equality testers", function() {
    var tester = function(a, b) {
      // All "foo*" strings match each other.
      if (typeof a == "string" && typeof b == "string" &&
          a.substr(0, 3) == "foo" && b.substr(0, 3) == "foo") {
        return true;
      }
    };
    var containing = new jasmineUnderTest.ObjectContaining({foo: "fooVal"});

    expect(containing.asymmetricMatch({foo: "fooBar"}, [tester])).toBe(true);
  });
});
