describe("jasmine.util", function() {
  describe("extend", function () {
    it("should add properies to a destination object ", function() {
      var destination = {baz: 'baz'};
      jasmine.util.extend(destination, {
        foo: 'foo', bar: 'bar'
      });
      expect(destination).toEqual({foo: 'foo', bar: 'bar', baz: 'baz'});
    });

    it("should replace properies that already exist on a destination object", function() {
      var destination = {foo: 'foo'};
      jasmine.util.extend(destination, {
        foo: 'bar'
      });
      expect(destination).toEqual({foo: 'bar'});
      jasmine.util.extend(destination, {
        foo: null
      });
      expect(destination).toEqual({foo: null});
    });
  });

  describe("isArray_", function() {
    it("should return true if the argument is an array", function() {
      expect(jasmine.isArray_([])).toBe(true);
      expect(jasmine.isArray_(['a'])).toBe(true);
      expect(jasmine.isArray_(new Array())).toBe(true);
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
