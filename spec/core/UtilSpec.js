describe("j$.util", function() {
  describe("isArray_", function() {
    it("should return true if the argument is an array", function() {
      expect(j$.isArray_([])).toBe(true);
      expect(j$.isArray_(['a'])).toBe(true);
    });

    it("should return false if the argument is not an array", function() {
      expect(j$.isArray_(undefined)).toBe(false);
      expect(j$.isArray_({})).toBe(false);
      expect(j$.isArray_(function() {})).toBe(false);
      expect(j$.isArray_('foo')).toBe(false);
      expect(j$.isArray_(5)).toBe(false);
      expect(j$.isArray_(null)).toBe(false);
    });
  });

  describe("isUndefined", function() {
    it("reports if a variable is defined", function() {
      var a;
      expect(j$.util.isUndefined(a)).toBe(true);
      expect(j$.util.isUndefined(undefined)).toBe(true);

      var undefined = "diz be undefined yo";
      expect(j$.util.isUndefined(undefined)).toBe(false);
    });
  });
});
