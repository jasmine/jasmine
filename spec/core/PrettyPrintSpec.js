describe("jasmineUnderTest.pp", function () {
  it("should wrap strings in single quotes", function() {
    expect(jasmineUnderTest.pp("some string")).toEqual("'some string'");
    expect(jasmineUnderTest.pp("som' string")).toEqual("'som' string'");
  });

  it("should stringify primitives properly", function() {
    expect(jasmineUnderTest.pp(true)).toEqual("true");
    expect(jasmineUnderTest.pp(false)).toEqual("false");
    expect(jasmineUnderTest.pp(null)).toEqual("null");
    expect(jasmineUnderTest.pp(jasmine.undefined)).toEqual("undefined");
    expect(jasmineUnderTest.pp(3)).toEqual("3");
    expect(jasmineUnderTest.pp(-3.14)).toEqual("-3.14");
    expect(jasmineUnderTest.pp(-0)).toEqual("-0");
  });

  describe('stringify arrays', function() {
    it("should stringify arrays properly", function() {
      expect(jasmineUnderTest.pp([1, 2])).toEqual("[ 1, 2 ]");
      expect(jasmineUnderTest.pp([1, 'foo', {}, jasmine.undefined, null])).toEqual("[ 1, 'foo', Object({  }), undefined, null ]");
    });

    it("should truncate arrays that are longer than jasmineUnderTest.MAX_PRETTY_PRINT_ARRAY_LENGTH", function() {
      var originalMaxLength = jasmineUnderTest.MAX_PRETTY_PRINT_ARRAY_LENGTH;
      var array = [1, 2, 3];

      try {
        jasmineUnderTest.MAX_PRETTY_PRINT_ARRAY_LENGTH = 2;
        expect(jasmineUnderTest.pp(array)).toEqual("[ 1, 2, ... ]");
      } finally {
        jasmineUnderTest.MAX_PRETTY_PRINT_ARRAY_LENGTH = originalMaxLength;
      }
    });

    it("should stringify arrays with properties properly", function() {
      var arr = [1, 2];
      arr.foo = 'bar';
      arr.baz = {};
      expect(jasmineUnderTest.pp(arr)).toEqual("[ 1, 2, foo: 'bar', baz: Object({  }) ]");
    });

    it("should stringify empty arrays with properties properly", function() {
      var empty = [];
      empty.foo = 'bar';
      empty.baz = {};
      expect(jasmineUnderTest.pp(empty)).toEqual("[ foo: 'bar', baz: Object({  }) ]");
    });

    it("should stringify long arrays with properties properly", function() {
      var originalMaxLength = jasmineUnderTest.MAX_PRETTY_PRINT_ARRAY_LENGTH;
      var long = [1,2,3];
      long.foo = 'bar';
      long.baz = {};

      try {
        jasmineUnderTest.MAX_PRETTY_PRINT_ARRAY_LENGTH = 2;
        expect(jasmineUnderTest.pp(long)).toEqual("[ 1, 2, ..., foo: 'bar', baz: Object({  }) ]");
      } finally {
        jasmineUnderTest.MAX_PRETTY_PRINT_ARRAY_LENGTH = originalMaxLength;
      }
    });

    it("should indicate circular array references", function() {
      var array1 = [1, 2];
      var array2 = [array1];
      array1.push(array2);
      expect(jasmineUnderTest.pp(array1)).toEqual("[ 1, 2, [ <circular reference: Array> ] ]");
    });

    it("should not indicate circular references incorrectly", function() {
      var array = [ [1] ];
      expect(jasmineUnderTest.pp(array)).toEqual("[ [ 1 ] ]");
    });
  });

  it("should stringify objects properly", function() {
    expect(jasmineUnderTest.pp({foo: 'bar'})).toEqual("Object({ foo: 'bar' })");
    expect(jasmineUnderTest.pp({foo:'bar', baz:3, nullValue: null, undefinedValue: jasmine.undefined})).toEqual("Object({ foo: 'bar', baz: 3, nullValue: null, undefinedValue: undefined })");
    expect(jasmineUnderTest.pp({foo: function () {
    }, bar: [1, 2, 3]})).toEqual("Object({ foo: Function, bar: [ 1, 2, 3 ] })");
  });

  it("should not include inherited properties when stringifying an object", function() {
    var SomeClass = function SomeClass() {};
    SomeClass.prototype.foo = "inherited foo";
    var instance = new SomeClass();
    instance.bar = "my own bar";
    expect(jasmineUnderTest.pp(instance)).toEqual("SomeClass({ bar: 'my own bar' })");
  });

  it("should not recurse objects and arrays more deeply than jasmineUnderTest.MAX_PRETTY_PRINT_DEPTH", function() {
    var originalMaxDepth = jasmineUnderTest.MAX_PRETTY_PRINT_DEPTH;
    var nestedObject = { level1: { level2: { level3: { level4: "leaf" } } } };
    var nestedArray  = [1, [2, [3, [4, "leaf"]]]];

    try {
      jasmineUnderTest.MAX_PRETTY_PRINT_DEPTH = 2;
      expect(jasmineUnderTest.pp(nestedObject)).toEqual("Object({ level1: Object({ level2: Object }) })");
      expect(jasmineUnderTest.pp(nestedArray)).toEqual("[ 1, [ 2, Array ] ]");

      jasmineUnderTest.MAX_PRETTY_PRINT_DEPTH = 3;
      expect(jasmineUnderTest.pp(nestedObject)).toEqual("Object({ level1: Object({ level2: Object({ level3: Object }) }) })");
      expect(jasmineUnderTest.pp(nestedArray)).toEqual("[ 1, [ 2, [ 3, Array ] ] ]");

      jasmineUnderTest.MAX_PRETTY_PRINT_DEPTH = 4;
      expect(jasmineUnderTest.pp(nestedObject)).toEqual("Object({ level1: Object({ level2: Object({ level3: Object({ level4: 'leaf' }) }) }) })");
      expect(jasmineUnderTest.pp(nestedArray)).toEqual("[ 1, [ 2, [ 3, [ 4, 'leaf' ] ] ] ]");
    } finally {
      jasmineUnderTest.MAX_PRETTY_PRINT_DEPTH = originalMaxDepth;
    }
  });

  it("should stringify immutable circular objects", function(){
    if(Object.freeze){
      var frozenObject = {foo: {bar: 'baz'}};
      frozenObject.circular = frozenObject;
      frozenObject = Object.freeze(frozenObject);
      expect(jasmineUnderTest.pp(frozenObject)).toEqual("Object({ foo: Object({ bar: 'baz' }), circular: <circular reference: Object> })");
    }
  });

  it("should stringify RegExp objects properly", function() {
    expect(jasmineUnderTest.pp(/x|y|z/)).toEqual("/x|y|z/");
  });

  it("should indicate circular object references", function() {
    var sampleValue = {foo: 'hello'};
    sampleValue.nested = sampleValue;
    expect(jasmineUnderTest.pp(sampleValue)).toEqual("Object({ foo: 'hello', nested: <circular reference: Object> })");
  });

  it("should indicate getters on objects as such", function() {
    var sampleValue = {id: 1};
    if (sampleValue.__defineGetter__) {
      //not supported in IE!
      sampleValue.__defineGetter__('calculatedValue', function() {
        throw new Error("don't call me!");
      });
    }
    if (sampleValue.__defineGetter__) {
      expect(jasmineUnderTest.pp(sampleValue)).toEqual("Object({ id: 1, calculatedValue: <getter> })");
    }
    else {
      expect(jasmineUnderTest.pp(sampleValue)).toEqual("Object({ id: 1 })");
    }
  });


  it('should not do HTML escaping of strings', function() {
    expect(jasmineUnderTest.pp('some <b>html string</b> &', false)).toEqual('\'some <b>html string</b> &\'');
  });

  it("should abbreviate the global (usually window) object", function() {
    expect(jasmineUnderTest.pp(jasmine.getGlobal())).toEqual("<global>");
  });

  it("should stringify Date objects properly", function() {
    var now = new Date();
    expect(jasmineUnderTest.pp(now)).toEqual("Date(" + now.toString() + ")");
  });

  it("should stringify spy objects properly", function() {
    var TestObject = {
          someFunction: function() {}
        },
        env = new jasmineUnderTest.Env();

    var spyRegistry = new jasmineUnderTest.SpyRegistry({currentSpies: function() {return [];}});

    spyRegistry.spyOn(TestObject, 'someFunction');
    expect(jasmineUnderTest.pp(TestObject.someFunction)).toEqual("spy on someFunction");

    expect(jasmineUnderTest.pp(jasmineUnderTest.createSpy("something"))).toEqual("spy on something");
  });

  it("should stringify objects that implement jasmineToString", function () {
    var obj = {
      jasmineToString: function () { return "strung"; }
    };

    expect(jasmineUnderTest.pp(obj)).toEqual("strung");
  });

  it("should stringify objects that implement custom toString", function () {
    var obj = {
      toString: function () { return "my toString"; }
    };

    expect(jasmineUnderTest.pp(obj)).toEqual("my toString");
  });

  it("should stringify objects from anonymous constructors with custom toString", function () {
    var MyAnonymousConstructor = (function() { return function () {}; })();
    MyAnonymousConstructor.toString = function () { return ''; };

    var a = new MyAnonymousConstructor();

    expect(jasmineUnderTest.pp(a)).toEqual("<anonymous>({  })");
  });

  it("should handle objects with null prototype", function() {
    if (jasmine.getEnv().ieVersion < 9) { return; }

    var obj = Object.create(null);
    obj.foo = 'bar';

    expect(jasmineUnderTest.pp(obj)).toEqual("null({ foo: 'bar' })");
  });
});
