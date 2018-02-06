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

  describe('stringify sets', function() {
    it("should stringify sets properly", function() {
      jasmine.getEnv().requireFunctioningSets();
      var set = new Set();
      set.add(1);
      set.add(2);
      expect(jasmineUnderTest.pp(set)).toEqual("Set( 1, 2 )");
    });

    it("should truncate sets with more elments than jasmineUnderTest.MAX_PRETTY_PRINT_ARRAY_LENGTH", function() {
      jasmine.getEnv().requireFunctioningSets();
      var originalMaxSize = jasmineUnderTest.MAX_PRETTY_PRINT_ARRAY_LENGTH;

      try {
        jasmineUnderTest.MAX_PRETTY_PRINT_ARRAY_LENGTH = 2;
        var set = new Set();
        set.add('a');
        set.add('b');
        set.add('c');
        expect(jasmineUnderTest.pp(set)).toEqual("Set( 'a', 'b', ... )");
      } finally {
        jasmineUnderTest.MAX_PRETTY_PRINT_ARRAY_LENGTH = originalMaxSize;
      }
    })
  });

  describe('stringify maps', function() {
    it("should stringify maps properly", function() {
      jasmine.getEnv().requireFunctioningMaps();
      var map = new Map();
      map.set(1,2);
      expect(jasmineUnderTest.pp(map)).toEqual("Map( [ 1, 2 ] )");
    });

    it("should truncate maps with more elments than jasmineUnderTest.MAX_PRETTY_PRINT_ARRAY_LENGTH", function() {
      jasmine.getEnv().requireFunctioningMaps();
      var originalMaxSize = jasmineUnderTest.MAX_PRETTY_PRINT_ARRAY_LENGTH;

      try {
        jasmineUnderTest.MAX_PRETTY_PRINT_ARRAY_LENGTH = 2;
        var map = new Map();
        map.set("a",1);
        map.set("b",2);
        map.set("c",3);
        expect(jasmineUnderTest.pp(map)).toEqual("Map( [ 'a', 1 ], [ 'b', 2 ], ... )");
      } finally {
        jasmineUnderTest.MAX_PRETTY_PRINT_ARRAY_LENGTH = originalMaxSize;
      }
    })
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

  it("should truncate objects with too many keys", function () {
    var originalMaxLength = jasmineUnderTest.MAX_PRETTY_PRINT_ARRAY_LENGTH;
    var long = {a: 1, b: 2, c: 3};

    try {
      jasmineUnderTest.MAX_PRETTY_PRINT_ARRAY_LENGTH = 2;
      expect(jasmineUnderTest.pp(long)).toEqual("Object({ a: 1, b: 2, ... })");
    } finally {
      jasmineUnderTest.MAX_PRETTY_PRINT_ARRAY_LENGTH = originalMaxLength;
    }
  });

  function withMaxChars(maxChars, fn) {
    var originalMaxChars = jasmineUnderTest.MAX_PRETTY_PRINT_CHARS;

    try {
      jasmineUnderTest.MAX_PRETTY_PRINT_CHARS = maxChars;
      fn();
    } finally {
      jasmineUnderTest.MAX_PRETTY_PRINT_CHARS = originalMaxChars;
    }
  }

  it("should truncate outputs that are too long", function() {
    var big = [
      { a: 1, b: "a long string" },
      {}
    ];

    withMaxChars(34, function() {
      expect(jasmineUnderTest.pp(big)).toEqual("[ Object({ a: 1, b: 'a long st ...");
    });
  });

  it("should not serialize more objects after hitting MAX_PRETTY_PRINT_CHARS", function() {
    var a = { jasmineToString: function() { return 'object a'; } },
      b = { jasmineToString: function() { return 'object b'; } },
      c = { jasmineToString: jasmine.createSpy('c jasmineToString').and.returnValue('') },
      d = { jasmineToString: jasmine.createSpy('d jasmineToString').and.returnValue('') };

    withMaxChars(30, function() {
      jasmineUnderTest.pp([{a: a, b: b, c: c}, d]);
      expect(c.jasmineToString).not.toHaveBeenCalled();
      expect(d.jasmineToString).not.toHaveBeenCalled();
    });
  });

  it("should print 'null' as the constructor of an object with its own constructor property", function() {
    expect(jasmineUnderTest.pp({constructor: function() {}})).toContain("null({");
    expect(jasmineUnderTest.pp({constructor: 'foo'})).toContain("null({");
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

    var spyRegistry = new jasmineUnderTest.SpyRegistry({
      currentSpies: function() {return [];},
      createSpy: function(name, originalFn) {
        return jasmineUnderTest.Spy(name, originalFn);
      }
    });

    spyRegistry.spyOn(TestObject, 'someFunction');
    expect(jasmineUnderTest.pp(TestObject.someFunction)).toEqual("spy on someFunction");

    expect(jasmineUnderTest.pp(env.createSpy("something"))).toEqual("spy on something");
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

    // Simulate object from another global context (e.g. an iframe or Web Worker) that does not actually have a custom
    // toString despite obj.toString !== Object.prototype.toString
    var objFromOtherContext = {
      foo: 'bar',
      toString: function () { return Object.prototype.toString.call(this); }
    };

    expect(jasmineUnderTest.pp(objFromOtherContext)).toEqual("Object({ foo: 'bar', toString: Function })");
  });

  it("should stringify objects have have a toString that isn't a function", function() {
    var obj = {
      toString: "foo"
    };

    expect(jasmineUnderTest.pp(obj)).toEqual("Object({ toString: 'foo' })");
  });

  it("should stringify objects from anonymous constructors with custom toString", function () {
    var MyAnonymousConstructor = (function() { return function () {}; })();
    MyAnonymousConstructor.toString = function () { return ''; };

    var a = new MyAnonymousConstructor();

    expect(jasmineUnderTest.pp(a)).toEqual("<anonymous>({  })");
  });

  it("should handle objects with null prototype", function() {
    var obj = Object.create(null);
    obj.foo = 'bar';

    expect(jasmineUnderTest.pp(obj)).toEqual("null({ foo: 'bar' })");
  });
});
