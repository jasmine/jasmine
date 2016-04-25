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
});
