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
});
