describe('Spies', function() {
  var env;

  beforeEach(function() {
    env = new jasmineUnderTest.Env();
  });

  afterEach(function() {
    env.cleanup_();
  });

  describe('createSpy', function() {
    var TestClass;

    beforeEach(function() {
      TestClass = function() {};
      TestClass.prototype.someFunction = function() {};
      TestClass.prototype.someFunction.bob = 'test';
    });

    it('preserves the properties of the spied function', function() {
      var spy = env.createSpy(
        TestClass.prototype,
        TestClass.prototype.someFunction
      );

      expect(spy.bob).toEqual('test');
    });

    it('should allow you to omit the name argument and only pass the originalFn argument', function() {
      var fn = function test() {};
      var spy = env.createSpy(fn);

      expect(spy.and.identity).toEqual('test');
    });

    it('warns the user that we intend to overwrite an existing property', function() {
      TestClass.prototype.someFunction.and = 'turkey';

      expect(function() {
        env.createSpy(TestClass.prototype, TestClass.prototype.someFunction);
      }).toThrowError(
        "Jasmine spies would overwrite the 'and' and 'calls' properties on the object being spied upon"
      );
    });

    it('adds a spyStrategy and callTracker to the spy', function() {
      var spy = env.createSpy(
        TestClass.prototype,
        TestClass.prototype.someFunction
      );

      expect(spy.and).toEqual(jasmine.any(jasmineUnderTest.SpyStrategy));
      expect(spy.calls).toEqual(jasmine.any(jasmineUnderTest.CallTracker));
    });

    it('tracks the argument of calls', function() {
      var spy = env.createSpy(
        TestClass.prototype,
        TestClass.prototype.someFunction
      );
      var trackSpy = spyOn(spy.calls, 'track');

      spy('arg');

      expect(trackSpy.calls.mostRecent().args[0].args).toEqual(['arg']);
    });

    it('tracks the context of calls', function() {
      var spy = env.createSpy(
        TestClass.prototype,
        TestClass.prototype.someFunction
      );
      var trackSpy = spyOn(spy.calls, 'track');

      var contextObject = { spyMethod: spy };
      contextObject.spyMethod();

      expect(trackSpy.calls.mostRecent().args[0].object).toEqual(contextObject);
    });

    it('tracks the return value of calls', function() {
      var spy = env.createSpy(
        TestClass.prototype,
        TestClass.prototype.someFunction
      );
      var trackSpy = spyOn(spy.calls, 'track');

      spy.and.returnValue('return value');
      spy();

      expect(trackSpy.calls.mostRecent().args[0].returnValue).toEqual(
        'return value'
      );
    });

    it('preserves arity of original function', function() {
      var functions = [
        function nullary() {},
        function unary(arg) {},
        function binary(arg1, arg2) {},
        function ternary(arg1, arg2, arg3) {},
        function quaternary(arg1, arg2, arg3, arg4) {},
        function quinary(arg1, arg2, arg3, arg4, arg5) {},
        function senary(arg1, arg2, arg3, arg4, arg5, arg6) {}
      ];

      for (var arity = 0; arity < functions.length; arity++) {
        var someFunction = functions[arity],
          spy = env.createSpy(someFunction.name, someFunction);

        expect(spy.length).toEqual(arity);
      }
    });
  });

  describe('createSpyObj', function() {
    it('should create an object with spy methods and corresponding return values when you call jasmine.createSpyObj() with an object', function() {
      var spyObj = env.createSpyObj('BaseName', {
        method1: 42,
        method2: 'special sauce'
      });

      expect(spyObj.method1()).toEqual(42);
      expect(spyObj.method1.and.identity).toEqual('BaseName.method1');

      expect(spyObj.method2()).toEqual('special sauce');
      expect(spyObj.method2.and.identity).toEqual('BaseName.method2');
    });

    it('should create an object with a bunch of spy methods when you call jasmine.createSpyObj()', function() {
      var spyObj = env.createSpyObj('BaseName', ['method1', 'method2']);

      expect(spyObj).toEqual({
        method1: jasmine.any(Function),
        method2: jasmine.any(Function)
      });
      expect(spyObj.method1.and.identity).toEqual('BaseName.method1');
      expect(spyObj.method2.and.identity).toEqual('BaseName.method2');
    });

    it('should allow you to omit the baseName', function() {
      var spyObj = env.createSpyObj(['method1', 'method2']);

      expect(spyObj).toEqual({
        method1: jasmine.any(Function),
        method2: jasmine.any(Function)
      });
      expect(spyObj.method1.and.identity).toEqual('unknown.method1');
      expect(spyObj.method2.and.identity).toEqual('unknown.method2');
    });

    it('should throw if you do not pass an array or object argument', function() {
      expect(function() {
        env.createSpyObj('BaseName');
      }).toThrow(
        'createSpyObj requires a non-empty array or object of method names to create spies for'
      );
    });

    it('should throw if you pass an empty array argument', function() {
      expect(function() {
        env.createSpyObj('BaseName', []);
      }).toThrow(
        'createSpyObj requires a non-empty array or object of method names to create spies for'
      );
    });

    it('should throw if you pass an empty object argument', function() {
      expect(function() {
        env.createSpyObj('BaseName', {});
      }).toThrow(
        'createSpyObj requires a non-empty array or object of method names to create spies for'
      );
    });

    it('creates an object with spy properties if a second list is passed', function() {
      var spyObj = env.createSpyObj('base', ['method1'], ['prop1']);

      expect(spyObj).toEqual({
        method1: jasmine.any(Function),
        prop1: undefined
      });

      var descriptor = Object.getOwnPropertyDescriptor(spyObj, 'prop1');
      expect(descriptor.get.and.identity).toEqual('base.prop1.get');
      expect(descriptor.set.and.identity).toEqual('base.prop1.set');
    });

    it('creates an object with property names and return values if second object is passed', function() {
      var spyObj = env.createSpyObj('base', ['method1'], {
        prop1: 'foo',
        prop2: 37
      });

      expect(spyObj).toEqual({
        method1: jasmine.any(Function),
        prop1: 'foo',
        prop2: 37
      });

      expect(spyObj.prop1).toEqual('foo');
      expect(spyObj.prop2).toEqual(37);
      spyObj.prop2 = 4;
      expect(spyObj.prop2).toEqual(37);
      expect(
        Object.getOwnPropertyDescriptor(spyObj, 'prop2').set.calls.count()
      ).toBe(1);
    });

    it('allows base name to be omitted when assigning methods and properties', function() {
      var spyObj = env.createSpyObj({ m: 3 }, { p: 4 });

      expect(spyObj.m()).toEqual(3);
      expect(spyObj.p).toEqual(4);
      expect(
        Object.getOwnPropertyDescriptor(spyObj, 'p').get.and.identity
      ).toEqual('unknown.p.get');
    });
  });

  it('can use different strategies for different arguments', function() {
    var spy = env.createSpy('foo');
    spy.and.returnValue(42);
    spy.withArgs('baz', 'grault').and.returnValue(-1);
    spy.withArgs('thud').and.returnValue('bob');

    expect(spy('foo')).toEqual(42);
    expect(spy('baz', 'grault')).toEqual(-1);
    expect(spy('thud')).toEqual('bob');
    expect(spy('baz', 'grault', 'waldo')).toEqual(42);
  });

  it('uses asymmetric equality testers when selecting a strategy', function() {
    var spy = env.createSpy('foo');
    spy.and.returnValue(42);
    spy.withArgs(jasmineUnderTest.any(String)).and.returnValue(-1);

    expect(spy('foo')).toEqual(-1);
    expect(spy({})).toEqual(42);
  });

  it('uses the provided matchersUtil selecting a strategy', function() {
    const matchersUtil = new jasmineUnderTest.MatchersUtil({
      customTesters: [
        function(a, b) {
          if ((a === 'bar' && b === 'baz') || (a === 'baz' && b === 'bar')) {
            return true;
          }
        }
      ]
    });
    const spy = new jasmineUnderTest.Spy('aSpy', matchersUtil);
    spy.and.returnValue('default strategy return value');
    spy.withArgs('bar').and.returnValue('custom strategy return value');
    expect(spy('foo')).toEqual('default strategy return value');
    expect(spy('baz')).toEqual('custom strategy return value');
  });

  it('can reconfigure an argument-specific strategy', function() {
    var spy = env.createSpy('foo');
    spy.withArgs('foo').and.returnValue(42);
    spy.withArgs('foo').and.returnValue(17);
    expect(spy('foo')).toEqual(17);
  });

  describe('any promise-based strategy', function() {
    it('works with global Promise library', function(done) {
      var spy = env.createSpy('foo').and.resolveTo(42);
      spy()
        .then(function(result) {
          expect(result).toEqual(42);
          done();
        })
        .catch(done.fail);
    });
  });

  describe('when withArgs is used without a base strategy', function() {
    it('uses the matching strategy', function() {
      var spy = env.createSpy('foo');
      spy.withArgs('baz').and.returnValue(-1);

      expect(spy('baz')).toEqual(-1);
    });

    it("throws if the args don't match", function() {
      var spy = env.createSpy('foo');
      spy.withArgs('bar').and.returnValue(-1);

      expect(function() {
        spy('baz', { qux: 42 });
      }).toThrowError(
        "Spy 'foo' received a call with arguments [ 'baz', Object({ qux: 42 }) ] but all configured strategies specify other arguments."
      );
    });
  });
});
