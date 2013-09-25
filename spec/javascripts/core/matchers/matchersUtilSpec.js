describe("matchersUtil", function() {
  describe("equals", function() {
    it("passes for literals that are threequal", function() {
      expect(j$.matchersUtil.equals(null, null)).toBe(true);
      expect(j$.matchersUtil.equals(void 0, void 0)).toBe(true);
    });

    it("fails for things that are not equivalent", function() {
      expect(j$.matchersUtil.equals({a: "foo"}, 1)).toBe(false);
    });

    it("passes for Strings that are equivalent", function() {
      expect(j$.matchersUtil.equals("foo", "foo")).toBe(true);
    });

    it("fails for Strings that are not equivalent", function() {
      expect(j$.matchersUtil.equals("foo", "bar")).toBe(false);
    });

    it("passes for Numbers that are equivalent", function() {
      expect(j$.matchersUtil.equals(123, 123)).toBe(true);
    });

    it("fails for Numbers that are not equivalent", function() {
      expect(j$.matchersUtil.equals(123, 456)).toBe(false);
    });

    it("passes for Dates that are equivalent", function() {
      expect(j$.matchersUtil.equals(new Date("Jan 1, 1970"), new Date("Jan 1, 1970"))).toBe(true);
    });

    it("fails for Dates that are not equivalent", function() {
      expect(j$.matchersUtil.equals(new Date("Jan 1, 1970"), new Date("Feb 3, 1991"))).toBe(false);
    });

    it("passes for Booleans that are equivalent", function() {
      expect(j$.matchersUtil.equals(true, true)).toBe(true);
    });

    it("fails for Booleans that are not equivalent", function() {
      expect(j$.matchersUtil.equals(true, false)).toBe(false);
    });

    it("passes for RegExps that are equivalent", function() {
      expect(j$.matchersUtil.equals(/foo/, /foo/)).toBe(true);
    });

    it("fails for RegExps that are not equivalent", function() {
      expect(j$.matchersUtil.equals(/foo/, /bar/)).toBe(false);
      expect(j$.matchersUtil.equals(new RegExp("foo", "i"), new RegExp("foo"))).toBe(false);
    });

    it("passes for Arrays that are equivalent", function() {
      expect(j$.matchersUtil.equals([1, 2], [1, 2])).toBe(true);
    });

    it("fails for Arrays that are not equivalent", function() {
      expect(j$.matchersUtil.equals([1, 2], [1, 2, 3])).toBe(false);
    });

    it("passes for Errors that are the same type and have the same message", function() {
      expect(j$.matchersUtil.equals(new Error("foo"), new Error("foo"))).toBe(true);
    });

    it("fails for Errors that are the same type and have different messages", function() {
      expect(j$.matchersUtil.equals(new Error("foo"), new Error("bar"))).toBe(false);
    });

    it("passes for Objects that are equivalent (simple case)", function() {
      expect(j$.matchersUtil.equals({a: "foo"}, {a: "foo"})).toBe(true);
    });

    it("fails for Objects that are not equivalent (simple case)", function() {
      expect(j$.matchersUtil.equals({a: "foo"}, {a: "bar"})).toBe(false);
    });

    it("passes for Objects that are equivalent (deep case)", function() {
      expect(j$.matchersUtil.equals({a: "foo", b: { c: "bar"}}, {a: "foo", b: { c: "bar"}})).toBe(true);
    });

    it("fails for Objects that are not equivalent (deep case)", function() {
      expect(j$.matchersUtil.equals({a: "foo", b: { c: "baz"}}, {a: "foo", b: { c: "bar"}})).toBe(false);
    });

    it("passes for Objects that are equivalent (with cycles)", function() {
      var actual = { a: "foo" },
        expected = { a: "foo" };

      actual.b = actual;
      expected.b = actual;

      expect(j$.matchersUtil.equals(actual, expected)).toBe(true);
    });

    it("fails for Objects that are not equivalent (with cycles)", function() {
      var actual = { a: "foo" },
        expected = { a: "bar" };

      actual.b = actual;
      expected.b = actual;

      expect(j$.matchersUtil.equals(actual, expected)).toBe(false);
    });

    it("fails when comparing an empty object to an empty array (issue #114)", function() {
      var emptyObject = {},
        emptyArray = [];

      expect(j$.matchersUtil.equals(emptyObject, emptyArray)).toBe(false);
      expect(j$.matchersUtil.equals(emptyArray, emptyObject)).toBe(false);
    });

    it("passes for equivalent frozen objects (GitHub issue #266)", function() {
      if (jasmine.getEnv().ieVersion < 9) { return; }

      var a = { foo: 1 },
        b = {foo: 1 };

      Object.freeze(a);
      Object.freeze(b);

      expect(j$.matchersUtil.equals(a,b)).toBe(true);
    });

    it("passes when Any is used", function() {
      var number = 3,
        anyNumber = new j$.Any(Number);

      expect(j$.matchersUtil.equals(number, anyNumber)).toBe(true);
      expect(j$.matchersUtil.equals(anyNumber, number)).toBe(true);
    });

    it("fails when Any is compared to something unexpected", function() {
      var number = 3,
        anyString = new j$.Any(String);

      expect(j$.matchersUtil.equals(number, anyString)).toBe(false);
      expect(j$.matchersUtil.equals(anyString, number)).toBe(false);
    });

    it("passes when ObjectContaining is used", function() {
      var obj = {
        foo: 3,
        bar: 7
      };

      expect(j$.matchersUtil.equals(obj, new j$.ObjectContaining({foo: 3}))).toBe(true);
    });

    it("passes when a custom equality matcher returns true", function() {
      var tester = function(a, b) { return true; };

      expect(j$.matchersUtil.equals(1, 2, [tester])).toBe(true);
    });

    it("fails for equivalents when a custom equality matcher returns false", function() {
      var tester = function(a, b) { return false; };

      expect(j$.matchersUtil.equals(1, 2, [tester])).toBe(false);
    });
  });

  describe("contains", function() {
    it("passes when expected is a substring of actual", function() {
      expect(j$.matchersUtil.contains("ABC", "B")).toBe(true);
    });

    it("fails when expected is a not substring of actual", function() {
      expect(j$.matchersUtil.contains("ABC", "X")).toBe(false);
    });

    it("passes when expected is an element in an actual array", function() {
      expect(j$.matchersUtil.contains(['foo', 'bar'], 'foo')).toBe(true);
    });

    it("fails when expected is not an element in an actual array", function() {
      expect(j$.matchersUtil.contains(['foo', 'bar'], 'baz')).toBe(false);
    });

    it("passes with mixed-element arrays", function() {
      expect(j$.matchersUtil.contains(["foo", {some: "bar"}], "foo")).toBe(true);
      expect(j$.matchersUtil.contains(["foo", {some: "bar"}], {some: "bar"})).toBe(true);
    });

    it("uses custom equality testers if passed in and actual is an Array", function() {
      var customTester = function(a, b) {return true;};

      expect(j$.matchersUtil.contains([1, 2], 2, [customTester])).toBe(true);
    });
  });

  describe("buildMessage", function() {

    it("builds an English sentence for a failure case", function() {
      var actual = "foo",
        name = "toBar",
        message = j$.matchersUtil.buildFailureMessage(name, false, actual);

      expect(message).toEqual("Expected 'foo' to bar.");
    });

    it("builds an English sentence for a 'not' failure case", function() {
      var actual = "foo",
        name = "toBar",
        isNot = true,
        message = message = j$.matchersUtil.buildFailureMessage(name, isNot, actual);

      expect(message).toEqual("Expected 'foo' not to bar.");
    });

    it("builds an English sentence for an arbitrary array of expected arguments", function() {
      var actual = "foo",
        name = "toBar",
        message = j$.matchersUtil.buildFailureMessage(name, false, actual, "quux", "corge");

      expect(message).toEqual("Expected 'foo' to bar 'quux', 'corge'.");
    });
  });
});
