describe('Spies', function () {
  var env;

  beforeEach(function() {
    env = new jasmineUnderTest.Env();
  });

  describe("createSpy", function() {
    var TestClass;

    beforeEach(function() {
      TestClass = function() {};
      TestClass.prototype.someFunction = function() {};
      TestClass.prototype.someFunction.bob = "test";
    });

    it("preserves the properties of the spied function", function() {
      var spy = env.createSpy(TestClass.prototype, TestClass.prototype.someFunction);

      expect(spy.bob).toEqual("test");
    });

    it("should allow you to omit the name argument and only pass the originalFn argument", function() {
      var fn = function test() {};
      var spy = env.createSpy(fn);

      // IE doesn't do `.name`
      if (fn.name === "test") {
        expect(spy.and.identity).toEqual("test");
      } else {
        expect(spy.and.identity).toEqual("unknown");
      }
    })

    it("warns the user that we intend to overwrite an existing property", function() {
      TestClass.prototype.someFunction.and = "turkey";

      expect(function() {
        env.createSpy(TestClass.prototype, TestClass.prototype.someFunction);
      }).toThrowError("Jasmine spies would overwrite the 'and' and 'calls' properties on the object being spied upon");
    });

    it("adds a spyStrategy and callTracker to the spy", function() {
      var spy = env.createSpy(TestClass.prototype, TestClass.prototype.someFunction);

      expect(spy.and).toEqual(jasmine.any(jasmineUnderTest.SpyStrategy));
      expect(spy.calls).toEqual(jasmine.any(jasmineUnderTest.CallTracker));
    });

    it("tracks the argument of calls", function () {
      var spy = env.createSpy(TestClass.prototype, TestClass.prototype.someFunction);
      var trackSpy = spyOn(spy.calls, "track");

      spy("arg");

      expect(trackSpy.calls.mostRecent().args[0].args).toEqual(["arg"]);
    });

    it("tracks the context of calls", function () {
      var spy = env.createSpy(TestClass.prototype, TestClass.prototype.someFunction);
      var trackSpy = spyOn(spy.calls, "track");

      var contextObject = { spyMethod: spy };
      contextObject.spyMethod();

      expect(trackSpy.calls.mostRecent().args[0].object).toEqual(contextObject);
    });

    it("tracks the return value of calls", function () {
      var spy = env.createSpy(TestClass.prototype, TestClass.prototype.someFunction);
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
            spy = env.createSpy(someFunction.name, someFunction);

        expect(spy.length).toEqual(arity);
      }
    });
  });

  describe("createSpyObj", function() {
    it("should create an object with spy methods and corresponding return values when you call jasmine.createSpyObj() with an object", function () {
      var spyObj = env.createSpyObj('BaseName', {'method1': 42, 'method2': 'special sauce' });

      expect(spyObj.method1()).toEqual(42);
      expect(spyObj.method1.and.identity).toEqual('BaseName.method1');

      expect(spyObj.method2()).toEqual('special sauce');
      expect(spyObj.method2.and.identity).toEqual('BaseName.method2');
    });


    it("should create an object with a bunch of spy methods when you call jasmine.createSpyObj()", function() {
      var spyObj = env.createSpyObj('BaseName', ['method1', 'method2']);

      expect(spyObj).toEqual({ method1: jasmine.any(Function), method2: jasmine.any(Function)});
      expect(spyObj.method1.and.identity).toEqual('BaseName.method1');
      expect(spyObj.method2.and.identity).toEqual('BaseName.method2');
    });

    it("should allow you to omit the baseName", function() {
      var spyObj = env.createSpyObj(['method1', 'method2']);

      expect(spyObj).toEqual({ method1: jasmine.any(Function), method2: jasmine.any(Function)});
      expect(spyObj.method1.and.identity).toEqual('unknown.method1');
      expect(spyObj.method2.and.identity).toEqual('unknown.method2');
    });

    it("should throw if you do not pass an array or object argument", function() {
      expect(function() {
        env.createSpyObj('BaseName');
      }).toThrow("createSpyObj requires a non-empty array or object of method names to create spies for");
    });

    it("should throw if you pass an empty array argument", function() {
      expect(function() {
        env.createSpyObj('BaseName', []);
      }).toThrow("createSpyObj requires a non-empty array or object of method names to create spies for");
    });

    it("should throw if you pass an empty object argument", function() {
      expect(function() {
        env.createSpyObj('BaseName', {});
      }).toThrow("createSpyObj requires a non-empty array or object of method names to create spies for");
    });

    describe("spies", function() {
      it("counts all calls of spied methods", function() {
        var spyObj = env.createSpyObj('BaseName', ['method1', 'method2']);
        spyObj.method1();
        spyObj.method2();

        expect(spyObj.spies.calls.count()).toEqual(2);
        expect(spyObj.method1.calls.count()).toEqual(1);
        expect(spyObj.method2.calls.count()).toEqual(1);
      });

      it("tracks the params from each execution", function() {
        var spyObj = env.createSpyObj('BaseName', ['method1', 'method2']);
        spyObj.method1("a");
        spyObj.method2("b", "c");

        expect(spyObj.spies.calls.argsFor(0)).toEqual(["a"]);
        expect(spyObj.spies.calls.argsFor(1)).toEqual(["b", "c"]);
      });
    });
  });

  it("can use different strategies for different arguments", function() {
    var spy = env.createSpy('foo');
    spy.and.returnValue(42);
    spy.withArgs('baz', 'grault').and.returnValue(-1);
    spy.withArgs('thud').and.returnValue('bob');

    expect(spy('foo')).toEqual(42);
    expect(spy('baz', 'grault')).toEqual(-1);
    expect(spy('thud')).toEqual('bob');
    expect(spy('baz', 'grault', 'waldo')).toEqual(42);
  });

  it("uses custom equality testers when selecting a strategy", function() {
    var spy = env.createSpy('foo');
    spy.and.returnValue(42);
    spy.withArgs(jasmineUnderTest.any(String)).and.returnValue(-1);

    expect(spy('foo')).toEqual(-1);
    expect(spy({})).toEqual(42);
  });

  it("can reconfigure an argument-specific strategy", function() {
    var spy = env.createSpy('foo');
    spy.withArgs('foo').and.returnValue(42);
    spy.withArgs('foo').and.returnValue(17);
    expect(spy('foo')).toEqual(17);
  });

  describe("When withArgs is used without a base strategy", function() {
    it("uses the matching strategy", function() {
      var spy = env.createSpy('foo');
      spy.withArgs('baz').and.returnValue(-1);

      expect(spy('baz')).toEqual(-1);
    });

    it("throws if the args don't match", function() {
      var spy = env.createSpy('foo');
      spy.withArgs('bar').and.returnValue(-1);

      expect(function() { spy('baz', {qux: 42}); }).toThrowError('Spy \'foo\' receieved a call with arguments [ \'baz\', Object({ qux: 42 }) ] but all configured strategies specify other arguments.');
    });
  });
});
