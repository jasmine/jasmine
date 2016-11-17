describe("jasmineUnderTest.util", function() {
  describe("isArray_", function() {
    it("should return true if the argument is an array", function() {
      expect(jasmineUnderTest.isArray_([])).toBe(true);
      expect(jasmineUnderTest.isArray_(['a'])).toBe(true);
    });

    it("should return false if the argument is not an array", function() {
      expect(jasmineUnderTest.isArray_(undefined)).toBe(false);
      expect(jasmineUnderTest.isArray_({})).toBe(false);
      expect(jasmineUnderTest.isArray_(function() {})).toBe(false);
      expect(jasmineUnderTest.isArray_('foo')).toBe(false);
      expect(jasmineUnderTest.isArray_(5)).toBe(false);
      expect(jasmineUnderTest.isArray_(null)).toBe(false);
    });
  });

  describe("isObject_", function() {
    it("should return true if the argument is an object", function() {
      expect(jasmineUnderTest.isObject_({})).toBe(true);
      expect(jasmineUnderTest.isObject_({an: "object"})).toBe(true);
    });

    it("should return false if the argument is not an object", function() {
      expect(jasmineUnderTest.isObject_(undefined)).toBe(false);
      expect(jasmineUnderTest.isObject_([])).toBe(false);
      expect(jasmineUnderTest.isObject_(function() {})).toBe(false);
      expect(jasmineUnderTest.isObject_('foo')).toBe(false);
      expect(jasmineUnderTest.isObject_(5)).toBe(false);
      expect(jasmineUnderTest.isObject_(null)).toBe(false);
    });
  });

  describe("isUndefined", function() {
    it("reports if a variable is defined", function() {
      var a;
      expect(jasmineUnderTest.util.isUndefined(a)).toBe(true);
      expect(jasmineUnderTest.util.isUndefined(undefined)).toBe(true);

      var undefined = "diz be undefined yo";
      expect(jasmineUnderTest.util.isUndefined(undefined)).toBe(false);
    });
  });

  describe("getPropertyDescriptor", function() {
    // IE 8 doesn't support `definePropery` on non-DOM nodes
    if (jasmine.getEnv().ieVersion < 9) { return; }

    it("get property descriptor from object", function() {
      var obj = {prop: 1},
        actual = jasmineUnderTest.util.getPropertyDescriptor(obj, 'prop'),
        expected = Object.getOwnPropertyDescriptor(obj, 'prop');

      expect(actual).toEqual(expected);
    });

    it("get property descriptor from object property", function() {
      var proto = {prop: 1},
        obj = Object.create(proto),
        actual = jasmineUnderTest.util.getPropertyDescriptor(proto, 'prop'),
        expected = Object.getOwnPropertyDescriptor(proto, 'prop');

      expect(actual).toEqual(expected);
    });
  });

  describe("objectDifference", function() {
    it("given two objects A and B, returns the properties in A not present in B", function() {
      var a = {
        foo: 3,
        bar: 4,
        baz: 5
      };

      var b = {
        bar: 6,
        quux: 7
      };

      expect(jasmineUnderTest.util.objectDifference(a, b)).toEqual({foo: 3, baz: 5})
    });

    it("only looks at own properties of both objects", function() {
      function Foo() {}

      Foo.prototype.x = 1;
      Foo.prototype.y = 2;

      var a = new Foo();
      a.x = 1;

      var b = new Foo();
      b.y = 2;

      expect(jasmineUnderTest.util.objectDifference(a, b)).toEqual({x: 1});
      expect(jasmineUnderTest.util.objectDifference(b, a)).toEqual({y: 2});
    })
  })
});
