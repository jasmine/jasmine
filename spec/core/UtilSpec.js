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
});
