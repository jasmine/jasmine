describe("ObjectContaining", function() {

  it("matches any actual to an empty object", function() {
    var containing = new jasmineUnderTest.ObjectContaining({});
    var matchersUtil = new jasmineUnderTest.MatchersUtil();

    expect(containing.asymmetricMatch("foo", matchersUtil)).toBe(true);
  });

  it("does not match an empty object actual", function() {
    var containing = new jasmineUnderTest.ObjectContaining("foo");

    expect(function() {
      containing.asymmetricMatch({})
    }).toThrowError(/not 'foo'/)
  });

  it("matches when the key/value pair is present in the actual", function() {
    var containing = new jasmineUnderTest.ObjectContaining({foo: "fooVal"});
    var matchersUtil = new jasmineUnderTest.MatchersUtil();

    expect(containing.asymmetricMatch({foo: "fooVal", bar: "barVal"}, matchersUtil)).toBe(true);
  });

  it("does not match when the key/value pair is not present in the actual", function() {
    var containing = new jasmineUnderTest.ObjectContaining({foo: "fooVal"});
    var matchersUtil = new jasmineUnderTest.MatchersUtil();

    expect(containing.asymmetricMatch({bar: "barVal", quux: "quuxVal"}, matchersUtil)).toBe(false);
  });

  it("does not match when the key is present but the value is different in the actual", function() {
    var containing = new jasmineUnderTest.ObjectContaining({foo: "other"});
    var matchersUtil = new jasmineUnderTest.MatchersUtil();

    expect(containing.asymmetricMatch({foo: "fooVal", bar: "barVal"}, matchersUtil)).toBe(false);
  });

  it("jasmineToString's itself", function() {
    var sample = {},
      matcher = new jasmineUnderTest.ObjectContaining(sample),
      pp = jasmine.createSpy('pp').and.returnValue('sample');

    expect(matcher.jasmineToString(pp)).toEqual(
      '<jasmine.objectContaining(sample)>'
    );
    expect(pp).toHaveBeenCalledWith(sample);

  });

  it("matches recursively", function() {
    var containing = new jasmineUnderTest.ObjectContaining({one: new jasmineUnderTest.ObjectContaining({two: {}})});
    var matchersUtil = new jasmineUnderTest.MatchersUtil();

    expect(containing.asymmetricMatch({one: {two: {}}}, matchersUtil)).toBe(true);
  });

  it("matches when key is present with undefined value", function() {
    var containing = new jasmineUnderTest.ObjectContaining({ one: undefined });
    var matchersUtil = new jasmineUnderTest.MatchersUtil();

    expect(containing.asymmetricMatch({ one: undefined }, matchersUtil)).toBe(true);
  });

  it("does not match when key with undefined value is not present", function() {
    var containing = new jasmineUnderTest.ObjectContaining({ one: undefined });
    var matchersUtil = new jasmineUnderTest.MatchersUtil();

    expect(containing.asymmetricMatch({}, matchersUtil)).toBe(false);
  });

  it("matches defined properties", function(){
    var containing = new jasmineUnderTest.ObjectContaining({ foo: "fooVal" });
    var matchersUtil = new jasmineUnderTest.MatchersUtil();

    var definedPropertyObject = {};
    Object.defineProperty(definedPropertyObject, "foo", {
      get: function() { return "fooVal" }
    });
    expect(containing.asymmetricMatch(definedPropertyObject, matchersUtil)).toBe(true);
  });

  it("matches prototype properties", function(){
    var containing = new jasmineUnderTest.ObjectContaining({ foo: "fooVal" });
    var matchersUtil = new jasmineUnderTest.MatchersUtil();

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

    expect(containing.asymmetricMatch(obj, matchersUtil)).toBe(true);
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
    var matchersUtil = new jasmineUnderTest.MatchersUtil({customTesters: [tester]});

    expect(containing.asymmetricMatch({foo: "fooBar"}, matchersUtil)).toBe(true);
  });
});
