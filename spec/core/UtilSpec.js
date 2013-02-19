describe("jasmine.util", function() {
  describe("isArray_", function() {
    it("should return true if the argument is an array", function() {
      expect(jasmine.isArray_([])).toBe(true);
      expect(jasmine.isArray_(['a'])).toBe(true);
    });

    it("should return false if the argument is not an array", function() {
      expect(jasmine.isArray_(undefined)).toBe(false);
      expect(jasmine.isArray_({})).toBe(false);
      expect(jasmine.isArray_(function() {})).toBe(false);
      expect(jasmine.isArray_('foo')).toBe(false);
      expect(jasmine.isArray_(5)).toBe(false);
      expect(jasmine.isArray_(null)).toBe(false);
    });
  });
});
