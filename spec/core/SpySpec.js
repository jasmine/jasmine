describe('Spies', function () {
  describe("createSpy", function() {
    var TestClass;

    beforeEach(function() {
      TestClass = function() {};
      TestClass.prototype.someFunction = function() {};
      TestClass.prototype.someFunction.bob = "test";
    });
    
    it("preserves the properties of the spied function", function() {
      var spy = j$.createSpy(TestClass.prototype, TestClass.prototype.someFunction);

      expect(spy.bob).toEqual("test");
    });

    it("warns the user that we intend to overwrite an existing property", function() {
      TestClass.prototype.someFunction.and = "turkey";

      expect(function() {
        j$.createSpy(TestClass.prototype, TestClass.prototype.someFunction);
      }).toThrowError("Jasmine spies would overwrite the 'and' and 'calls' properties on the object being spied upon");
    });

    it("adds a spyStrategy and callTracker to the spy", function() {
      var spy = j$.createSpy(TestClass.prototype, TestClass.prototype.someFunction);

      expect(spy.and).toEqual(jasmine.any(j$.SpyStrategy));
      expect(spy.calls).toEqual(jasmine.any(j$.CallTracker));
    });

    it("tracks the argument of calls", function () {
      var spy = j$.createSpy(TestClass.prototype, TestClass.prototype.someFunction);
      var trackSpy = spyOn(spy.calls, "track");

      spy("arg");

      expect(trackSpy.calls.mostRecent().args[0].args).toEqual(["arg"]);
    });

    it("tracks the context of calls", function () {
      var spy = j$.createSpy(TestClass.prototype, TestClass.prototype.someFunction);
      var trackSpy = spyOn(spy.calls, "track");

      var contextObject = { spyMethod: spy };
      contextObject.spyMethod();

      expect(trackSpy.calls.mostRecent().args[0].object).toEqual(contextObject);
    });
  });

  describe("createSpyObj", function() {
    it("should create an object with a bunch of spy methods when you call jasmine.createSpyObj()", function() {
      var spyObj = j$.createSpyObj('BaseName', ['method1', 'method2']);

      expect(spyObj).toEqual({ method1: jasmine.any(Function), method2: jasmine.any(Function)});
      expect(spyObj.method1.and.identity()).toEqual('BaseName.method1');
      expect(spyObj.method2.and.identity()).toEqual('BaseName.method2');
    });

    it("should throw if you do not pass an array argument", function() {
      expect(function() {
        j$.createSpyObj('BaseName');
      }).toThrow("createSpyObj requires a non-empty array of method names to create spies for");
    });
  });
});
