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

  describe("inherit(childClass, parentClass)", function() {
    var ParentClass, ChildClass, childInstance;

    beforeEach(function() {
      ParentClass = function() {};
      ChildClass  = function() {};
      jasmine.util.inherit(ChildClass, ParentClass);
      childInstance = new ChildClass();
    });

    it("sets the given child class's prototype to be an instance of the parent class", function() {
      expect(ChildClass.prototype instanceof ParentClass).toBeTruthy();
      expect(childInstance instanceof ChildClass).toBeTruthy();
    });

    it("sets the 'constructor' property correctly on the prototype", function() {
      expect(childInstance.constructor).toBe(ChildClass);
    });
  });

  describe("subclass(parentClass)", function() {
    var ParentClass, ChildClass, childInstance;

    beforeEach(function() {
      ParentClass = function(param) { this.parentParam = param };
      ChildClass = jasmine.util.subclass(ParentClass);
      childInstance = new ChildClass("foo");
    });

    it("returns a constructor function", function() {
      expect(typeof ChildClass).toBe("function");
    });

    it("sets the constructor's prototype correctly", function() {
      expect(childInstance instanceof ChildClass).toBeTruthy();
      expect(childInstance instanceof ParentClass).toBeTruthy();
    });

    it("sets the 'constructor' property correctly", function() {
      expect(childInstance.constructor).toBe(ChildClass);
    });

    it("sets up the new constructor function to call the parent constructor", function() {
      expect(childInstance.parentParam).toBe("foo");
    });
  });
});
