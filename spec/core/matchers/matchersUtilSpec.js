describe("matchersUtil", function() {
  describe("equals", function() {
    it("passes for literals that are triple-equal", function() {
      expect(jasmineUnderTest.matchersUtil.equals(null, null)).toBe(true);
      expect(jasmineUnderTest.matchersUtil.equals(void 0, void 0)).toBe(true);
    });

    it("fails for things that are not equivalent", function() {
      expect(jasmineUnderTest.matchersUtil.equals({a: "foo"}, 1)).toBe(false);
    });

    it("passes for Strings that are equivalent", function() {
      expect(jasmineUnderTest.matchersUtil.equals("foo", "foo")).toBe(true);
    });

    it("fails for Strings that are not equivalent", function() {
      expect(jasmineUnderTest.matchersUtil.equals("foo", "bar")).toBe(false);
    });

    it("passes for Numbers that are equivalent", function() {
      expect(jasmineUnderTest.matchersUtil.equals(123, 123)).toBe(true);
    });

    it("fails for Numbers that are not equivalent", function() {
      expect(jasmineUnderTest.matchersUtil.equals(123, 456)).toBe(false);
    });

    it("passes for Dates that are equivalent", function() {
      expect(jasmineUnderTest.matchersUtil.equals(new Date("Jan 1, 1970"), new Date("Jan 1, 1970"))).toBe(true);
    });

    it("fails for Dates that are not equivalent", function() {
      expect(jasmineUnderTest.matchersUtil.equals(new Date("Jan 1, 1970"), new Date("Feb 3, 1991"))).toBe(false);
    });

    it("passes for Booleans that are equivalent", function() {
      expect(jasmineUnderTest.matchersUtil.equals(true, true)).toBe(true);
    });

    it("fails for Booleans that are not equivalent", function() {
      expect(jasmineUnderTest.matchersUtil.equals(true, false)).toBe(false);
    });

    it("passes for RegExps that are equivalent", function() {
      expect(jasmineUnderTest.matchersUtil.equals(/foo/, /foo/)).toBe(true);
    });

    it("fails for RegExps that are not equivalent", function() {
      expect(jasmineUnderTest.matchersUtil.equals(/foo/, /bar/)).toBe(false);
      expect(jasmineUnderTest.matchersUtil.equals(new RegExp("foo", "i"), new RegExp("foo"))).toBe(false);
    });

    it("passes for Arrays that are equivalent", function() {
      expect(jasmineUnderTest.matchersUtil.equals([1, 2], [1, 2])).toBe(true);
    });

    it("fails for Arrays that are not equivalent", function() {
      expect(jasmineUnderTest.matchersUtil.equals([1, 2], [1, 2, 3])).toBe(false);
    });

    it("fails for Arrays whose contents are equivalent, but have differing properties", function() {
      var one = [1,2,3],
          two = [1,2,3];

      one.foo = 'bar';
      two.foo = 'baz';

      expect(jasmineUnderTest.matchersUtil.equals(one, two)).toBe(false);
    });

    it("passes for Errors that are the same type and have the same message", function() {
      expect(jasmineUnderTest.matchersUtil.equals(new Error("foo"), new Error("foo"))).toBe(true);
    });

    it("fails for Errors that are the same type and have different messages", function() {
      expect(jasmineUnderTest.matchersUtil.equals(new Error("foo"), new Error("bar"))).toBe(false);
    });

    it("passes for Objects that are equivalent (simple case)", function() {
      expect(jasmineUnderTest.matchersUtil.equals({a: "foo"}, {a: "foo"})).toBe(true);
    });

    it("fails for Objects that are not equivalent (simple case)", function() {
      expect(jasmineUnderTest.matchersUtil.equals({a: "foo"}, {a: "bar"})).toBe(false);
    });

    it("passes for Objects that are equivalent (deep case)", function() {
      expect(jasmineUnderTest.matchersUtil.equals({a: "foo", b: { c: "bar"}}, {a: "foo", b: { c: "bar"}})).toBe(true);
    });

    it("fails for Objects that are not equivalent (deep case)", function() {
      expect(jasmineUnderTest.matchersUtil.equals({a: "foo", b: { c: "baz"}}, {a: "foo", b: { c: "bar"}})).toBe(false);
    });

    it("passes for Objects that are equivalent (with cycles)", function() {
      var actual = { a: "foo" },
        expected = { a: "foo" };

      actual.b = actual;
      expected.b = actual;

      expect(jasmineUnderTest.matchersUtil.equals(actual, expected)).toBe(true);
    });

    it("fails for Objects that are not equivalent (with cycles)", function() {
      var actual = { a: "foo" },
        expected = { a: "bar" };

      actual.b = actual;
      expected.b = actual;

      expect(jasmineUnderTest.matchersUtil.equals(actual, expected)).toBe(false);
    });

    it("fails when comparing an empty object to an empty array (issue #114)", function() {
      var emptyObject = {},
        emptyArray = [];

      expect(jasmineUnderTest.matchersUtil.equals(emptyObject, emptyArray)).toBe(false);
      expect(jasmineUnderTest.matchersUtil.equals(emptyArray, emptyObject)).toBe(false);
    });

    it("passes for equivalent frozen objects (GitHub issue #266)", function() {
      if (jasmine.getEnv().ieVersion < 9) { return; }

      var a = { foo: 1 },
        b = {foo: 1 };

      Object.freeze(a);
      Object.freeze(b);

      expect(jasmineUnderTest.matchersUtil.equals(a,b)).toBe(true);
    });

    it("passes for equivalent DOM nodes", function() {
      if (typeof document === 'undefined') {
        return;
      }
      var a = document.createElement("div");
      a.setAttribute("test-attr", "attr-value")
      a.appendChild(document.createTextNode('test'));

      var b = document.createElement("div");
      b.setAttribute("test-attr", "attr-value")
      b.appendChild(document.createTextNode('test'));

      expect(jasmineUnderTest.matchersUtil.equals(a,b)).toBe(true);
    });

    it("fails for DOM nodes with different attributes or child nodes", function() {
      if (typeof document === 'undefined') {
        return;
      }
      var a = document.createElement("div");
      a.setAttribute("test-attr", "attr-value")
      a.appendChild(document.createTextNode('test'));

      var b = document.createElement("div");
      b.setAttribute("test-attr", "attr-value2")
      b.appendChild(document.createTextNode('test'));

      expect(jasmineUnderTest.matchersUtil.equals(a,b)).toBe(false);

      b.setAttribute("test-attr", "attr-value");
      expect(jasmineUnderTest.matchersUtil.equals(a,b)).toBe(true);

      b.appendChild(document.createTextNode('2'));
      expect(jasmineUnderTest.matchersUtil.equals(a,b)).toBe(false);

      a.appendChild(document.createTextNode('2'));
      expect(jasmineUnderTest.matchersUtil.equals(a,b)).toBe(true);
    });

    it("passes for equivalent objects from different vm contexts", function() {
      if (typeof require !== 'function') {
        return;
      }
      var vm = require('vm');
      var sandbox = {
        obj: null
      };
      vm.runInNewContext('obj = {a: 1, b: 2}', sandbox);

      expect(jasmineUnderTest.matchersUtil.equals(sandbox.obj, {a: 1, b: 2})).toBe(true);
    });

    it("passes for equivalent arrays from different vm contexts", function() {
      if (typeof require !== 'function') {
        return;
      }

      var vm = require('vm');
      var sandbox = {
        arr: null
      };
      vm.runInNewContext('arr = [1, 2]', sandbox);

      expect(jasmineUnderTest.matchersUtil.equals(sandbox.arr, [1, 2])).toBe(true);
    });

    it("passes when Any is used", function() {
      var number = 3,
        anyNumber = new jasmineUnderTest.Any(Number);

      expect(jasmineUnderTest.matchersUtil.equals(number, anyNumber)).toBe(true);
      expect(jasmineUnderTest.matchersUtil.equals(anyNumber, number)).toBe(true);
    });

    it("fails when Any is compared to something unexpected", function() {
      var number = 3,
        anyString = new jasmineUnderTest.Any(String);

      expect(jasmineUnderTest.matchersUtil.equals(number, anyString)).toBe(false);
      expect(jasmineUnderTest.matchersUtil.equals(anyString, number)).toBe(false);
    });

    it("passes when ObjectContaining is used", function() {
      var obj = {
        foo: 3,
        bar: 7
      },
      containing = new jasmineUnderTest.ObjectContaining({foo: 3});

      expect(jasmineUnderTest.matchersUtil.equals(obj, containing)).toBe(true);
      expect(jasmineUnderTest.matchersUtil.equals(containing, obj)).toBe(true);
    });

    it("passes when an asymmetric equality tester returns true", function() {
      var tester = { asymmetricMatch: function(other) { return true; } };

      expect(jasmineUnderTest.matchersUtil.equals(false, tester)).toBe(true);
      expect(jasmineUnderTest.matchersUtil.equals(tester, false)).toBe(true);
    });

    it("fails when an asymmetric equality tester returns false", function() {
      var tester = { asymmetricMatch: function(other) { return false; } };

      expect(jasmineUnderTest.matchersUtil.equals(true, tester)).toBe(false);
      expect(jasmineUnderTest.matchersUtil.equals(tester, true)).toBe(false);
    });

    it("passes when ArrayContaining is used", function() {
      var arr = ["foo", "bar"];

      expect(jasmineUnderTest.matchersUtil.equals(arr, new jasmineUnderTest.ArrayContaining(["bar"]))).toBe(true);
    });

    it("passes when a custom equality matcher returns true", function() {
      var tester = function(a, b) { return true; };

      expect(jasmineUnderTest.matchersUtil.equals(1, 2, [tester])).toBe(true);
    });

    it("passes for two empty Objects", function () {
      expect(jasmineUnderTest.matchersUtil.equals({}, {})).toBe(true);
    });

    describe("when a custom equality matcher is installed that returns 'undefined'", function () {
      var tester = function(a, b) { return jasmine.undefined; };

      it("passes for two empty Objects", function () {
        expect(jasmineUnderTest.matchersUtil.equals({}, {}, [tester])).toBe(true);
      });
    });

    it("fails for equivalents when a custom equality matcher returns false", function() {
      var tester = function(a, b) { return false; };

      expect(jasmineUnderTest.matchersUtil.equals(1, 1, [tester])).toBe(false);
    });

    it("passes for an asymmetric equality tester that returns true when a custom equality tester return false", function() {
      var asymmetricTester = { asymmetricMatch: function(other) { return true; } },
          symmetricTester = function(a, b) { return false; };

      expect(jasmineUnderTest.matchersUtil.equals(asymmetricTester, true, [symmetricTester])).toBe(true);
      expect(jasmineUnderTest.matchersUtil.equals(true, asymmetricTester, [symmetricTester])).toBe(true);
    });

    it("passes when an Any is compared to an Any that checks for the same type", function() {
      var any1 = new jasmineUnderTest.Any(Function),
          any2 = new jasmineUnderTest.Any(Function);

      expect(jasmineUnderTest.matchersUtil.equals(any1, any2)).toBe(true);
    });

    it("passes for null prototype objects with same properties", function () {
      if (jasmine.getEnv().ieVersion < 9) { return; }

      var objA = Object.create(null),
          objB = Object.create(null);

      objA.name = 'test';
      objB.name = 'test';

      expect(jasmineUnderTest.matchersUtil.equals(objA, objB)).toBe(true);
    });

    it("fails for null prototype objects with different properties", function () {
      if (jasmine.getEnv().ieVersion < 9) { return; }

      var objA = Object.create(null),
          objB = Object.create(null);

      objA.name = 'test';
      objB.test = 'name';

      expect(jasmineUnderTest.matchersUtil.equals(objA, objB)).toBe(false);
    });
  });

  describe("contains", function() {
    it("passes when expected is a substring of actual", function() {
      expect(jasmineUnderTest.matchersUtil.contains("ABC", "BC")).toBe(true);
    });

    it("fails when expected is a not substring of actual", function() {
      expect(jasmineUnderTest.matchersUtil.contains("ABC", "X")).toBe(false);
    });

    it("passes when expected is an element in an actual array", function() {
      expect(jasmineUnderTest.matchersUtil.contains(['foo', 'bar'], 'foo')).toBe(true);
    });

    it("fails when expected is not an element in an actual array", function() {
      expect(jasmineUnderTest.matchersUtil.contains(['foo', 'bar'], 'baz')).toBe(false);
    });

    it("passes with mixed-element arrays", function() {
      expect(jasmineUnderTest.matchersUtil.contains(["foo", {some: "bar"}], "foo")).toBe(true);
      expect(jasmineUnderTest.matchersUtil.contains(["foo", {some: "bar"}], {some: "bar"})).toBe(true);
    });

    it("uses custom equality testers if passed in and actual is an Array", function() {
      var customTester = function(a, b) {return true;};

      expect(jasmineUnderTest.matchersUtil.contains([1, 2], 2, [customTester])).toBe(true);
    });

    it("fails when actual is undefined", function() {
      expect(jasmineUnderTest.matchersUtil.contains(undefined, 'A')).toBe(false);
    });

    it("fails when actual is null", function() {
      expect(jasmineUnderTest.matchersUtil.contains(null, 'A')).toBe(false);
    });

    it("passes with array-like objects", function() {
      var capturedArgs = null;
      function testFunction(){
        capturedArgs = arguments;
      }
      testFunction('foo', 'bar');
      expect(jasmineUnderTest.matchersUtil.contains(capturedArgs, 'bar')).toBe(true);
    });
  });

  describe("buildMessage", function() {

    it("builds an English sentence for a failure case", function() {
      var actual = "foo",
        name = "toBar",
        message = jasmineUnderTest.matchersUtil.buildFailureMessage(name, false, actual);

      expect(message).toEqual("Expected 'foo' to bar.");
    });

    it("builds an English sentence for a 'not' failure case", function() {
      var actual = "foo",
        name = "toBar",
        isNot = true,
        message = message = jasmineUnderTest.matchersUtil.buildFailureMessage(name, isNot, actual);

      expect(message).toEqual("Expected 'foo' not to bar.");
    });

    it("builds an English sentence for an arbitrary array of expected arguments", function() {
      var actual = "foo",
        name = "toBar",
        message = jasmineUnderTest.matchersUtil.buildFailureMessage(name, false, actual, "quux", "corge");

      expect(message).toEqual("Expected 'foo' to bar 'quux', 'corge'.");
    });
  });
});
