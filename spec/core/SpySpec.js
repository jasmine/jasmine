describe('Spies', function () {
  describe("createSpy", function() {
    var TestClass;

    beforeEach(function() {
      TestClass = function() {};
      TestClass.prototype.someFunction = function() {};
      TestClass.prototype.someFunction.bob = "test";
    });

    it("preserves the properties of the spied function", function() {
      var spy = jasmineUnderTest.createSpy(TestClass.prototype, TestClass.prototype.someFunction);

      expect(spy.bob).toEqual("test");
    });

    it("warns the user that we intend to overwrite an existing property", function() {
      TestClass.prototype.someFunction.and = "turkey";

      expect(function() {
        jasmineUnderTest.createSpy(TestClass.prototype, TestClass.prototype.someFunction);
      }).toThrowError("Jasmine spies would overwrite the 'and' and 'calls' properties on the object being spied upon");
    });

    it("adds a spyStrategy and callTracker to the spy", function() {
      var spy = jasmineUnderTest.createSpy(TestClass.prototype, TestClass.prototype.someFunction);

      expect(spy.and).toEqual(jasmine.any(jasmineUnderTest.SpyStrategy));
      expect(spy.calls).toEqual(jasmine.any(jasmineUnderTest.CallTracker));
    });

    it("tracks the argument of calls", function () {
      var spy = jasmineUnderTest.createSpy(TestClass.prototype, TestClass.prototype.someFunction);
      var trackSpy = spyOn(spy.calls, "track");

      spy("arg");

      expect(trackSpy.calls.mostRecent().args[0].args).toEqual(["arg"]);
    });

    it("tracks the context of calls", function () {
      var spy = jasmineUnderTest.createSpy(TestClass.prototype, TestClass.prototype.someFunction);
      var trackSpy = spyOn(spy.calls, "track");

      var contextObject = { spyMethod: spy };
      contextObject.spyMethod();

      expect(trackSpy.calls.mostRecent().args[0].object).toEqual(contextObject);
    });

    it("tracks the return value of calls", function () {
      var spy = jasmineUnderTest.createSpy(TestClass.prototype, TestClass.prototype.someFunction);
      var trackSpy = spyOn(spy.calls, "track");

      spy.and.returnValue("return value");
      spy();

      expect(trackSpy.calls.mostRecent().args[0].returnValue).toEqual("return value");
    });

    it("preserves arity of original function", function () {
      var functions = [
        function nullary () {},
        function unary (arg) {},
        function binary (arg1, arg2) {},
        function ternary (arg1, arg2, arg3) {},
        function quaternary (arg1, arg2, arg3, arg4) {},
        function quinary (arg1, arg2, arg3, arg4, arg5) {},
        function senary (arg1, arg2, arg3, arg4, arg5, arg6) {}
      ];

      for (var arity = 0; arity < functions.length; arity++) {
        var someFunction = functions[arity],
            spy = jasmineUnderTest.createSpy(someFunction.name, someFunction);

        expect(spy.length).toEqual(arity);
      }
    });
  });

  describe("createSpyObj", function() {
    it("should create an object with spy methods and corresponding return values when you call jasmine.createSpyObj() with an object", function () {
      var spyObj = jasmineUnderTest.createSpyObj('BaseName', {'method1': 42, 'method2': 'special sauce' });

      expect(spyObj.method1()).toEqual(42);
      expect(spyObj.method1.and.identity()).toEqual('BaseName.method1');

      expect(spyObj.method2()).toEqual('special sauce');
      expect(spyObj.method2.and.identity()).toEqual('BaseName.method2');
    });


    it("should create an object with a bunch of spy methods when you call jasmine.createSpyObj()", function() {
      var spyObj = jasmineUnderTest.createSpyObj('BaseName', ['method1', 'method2']);

      expect(spyObj).toEqual({ method1: jasmine.any(Function), method2: jasmine.any(Function)});
      expect(spyObj.method1.and.identity()).toEqual('BaseName.method1');
      expect(spyObj.method2.and.identity()).toEqual('BaseName.method2');
    });

    it("should allow you to omit the baseName", function() {
      var spyObj = jasmineUnderTest.createSpyObj(['method1', 'method2']);

      expect(spyObj).toEqual({ method1: jasmine.any(Function), method2: jasmine.any(Function)});
      expect(spyObj.method1.and.identity()).toEqual('unknown.method1');
      expect(spyObj.method2.and.identity()).toEqual('unknown.method2');
    });

    it("should throw if you do not pass an array or object argument", function() {
      expect(function() {
        jasmineUnderTest.createSpyObj('BaseName');
      }).toThrow("createSpyObj requires a non-empty array or object of method names to create spies for");
    });

    it("should throw if you pass an empty array argument", function() {
      expect(function() {
        jasmineUnderTest.createSpyObj('BaseName', []);
      }).toThrow("createSpyObj requires a non-empty array or object of method names to create spies for");
    });

    it("should throw if you pass an empty object argument", function() {
      expect(function() {
        jasmineUnderTest.createSpyObj('BaseName', {});
      }).toThrow("createSpyObj requires a non-empty array or object of method names to create spies for");
    });
  });

  describe("createSpyForClass", function() {

    // transpiled Typescript class using tsc targeting ES5
    var TscClassTranspiledToES5 = (function () {
      function TestClass() {
      }
      TestClass.prototype.testMethod1 = function () {
        return "";
      };
      TestClass.prototype.testMethod2 = function () {
        return "";
      };
      return TestClass;
    }());


    it("should create an object with spy methods when you call jasmine.createSpyForClass() with a Typescript class", function () {
      var spyObj = jasmineUnderTest.createSpyForClass(TscClassTranspiledToES5);

      spyObj.testMethod1.and.returnValue(42);
      spyObj.testMethod2.and.returnValue("special sauce");

      expect(spyObj.testMethod1()).toEqual(42);
      expect(spyObj.testMethod1.and.identity()).toEqual('TestClass.testMethod1');

      expect(spyObj.testMethod2()).toEqual("special sauce");
      expect(spyObj.testMethod2.and.identity()).toEqual('TestClass.testMethod2');
    });
  });
});
