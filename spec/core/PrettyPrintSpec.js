describe("j$.pp", function () {
  it("should wrap strings in single quotes", function() {
    expect(j$.pp("some string")).toEqual("'some string'");
    expect(j$.pp("som' string")).toEqual("'som' string'");
  });

  it("should stringify primitives properly", function() {
    expect(j$.pp(true)).toEqual("true");
    expect(j$.pp(false)).toEqual("false");
    expect(j$.pp(null)).toEqual("null");
    expect(j$.pp(jasmine.undefined)).toEqual("undefined");
    expect(j$.pp(3)).toEqual("3");
    expect(j$.pp(-3.14)).toEqual("-3.14");
  });

  it("should stringify arrays properly", function() {
    expect(j$.pp([1, 2])).toEqual("[ 1, 2 ]");
    expect(j$.pp([1, 'foo', {}, jasmine.undefined, null])).toEqual("[ 1, 'foo', {  }, undefined, null ]");
  });

  it("should indicate circular array references", function() {
    var array1 = [1, 2];
    var array2 = [array1];
    array1.push(array2);
    expect(j$.pp(array1)).toEqual("[ 1, 2, [ <circular reference: Array> ] ]");
  });

  it("should stringify objects properly", function() {
    expect(j$.pp({foo: 'bar'})).toEqual("{ foo : 'bar' }");
    expect(j$.pp({foo:'bar', baz:3, nullValue: null, undefinedValue: jasmine.undefined})).toEqual("{ foo : 'bar', baz : 3, nullValue : null, undefinedValue : undefined }");
    expect(j$.pp({foo: function () {
    }, bar: [1, 2, 3]})).toEqual("{ foo : Function, bar : [ 1, 2, 3 ] }");
  });

  it("should not include inherited properties when stringifying an object", function() {
    var SomeClass = function() {};
    SomeClass.prototype.foo = "inherited foo";
    var instance = new SomeClass();
    instance.bar = "my own bar";
    expect(j$.pp(instance)).toEqual("{ bar : 'my own bar' }");
  });

  it("should not recurse objects and arrays more deeply than j$.MAX_PRETTY_PRINT_DEPTH", function() {
    var originalMaxDepth = j$.MAX_PRETTY_PRINT_DEPTH;
    var nestedObject = { level1: { level2: { level3: { level4: "leaf" } } } };
    var nestedArray  = [1, [2, [3, [4, "leaf"]]]];

    try {
      j$.MAX_PRETTY_PRINT_DEPTH = 2;
      expect(j$.pp(nestedObject)).toEqual("{ level1 : { level2 : Object } }");
      expect(j$.pp(nestedArray)).toEqual("[ 1, [ 2, Array ] ]");

      j$.MAX_PRETTY_PRINT_DEPTH = 3;
      expect(j$.pp(nestedObject)).toEqual("{ level1 : { level2 : { level3 : Object } } }");
      expect(j$.pp(nestedArray)).toEqual("[ 1, [ 2, [ 3, Array ] ] ]");

      j$.MAX_PRETTY_PRINT_DEPTH = 4;
      expect(j$.pp(nestedObject)).toEqual("{ level1 : { level2 : { level3 : { level4 : 'leaf' } } } }");
      expect(j$.pp(nestedArray)).toEqual("[ 1, [ 2, [ 3, [ 4, 'leaf' ] ] ] ]");
    } finally {
      j$.MAX_PRETTY_PRINT_DEPTH = originalMaxDepth;
    }
  });

  it("should stringify RegExp objects properly", function() {
    expect(j$.pp(/x|y|z/)).toEqual("/x|y|z/");
  });

  it("should indicate circular object references", function() {
    var sampleValue = {foo: 'hello'};
    sampleValue.nested = sampleValue;
    expect(j$.pp(sampleValue)).toEqual("{ foo : 'hello', nested : <circular reference: Object> }");
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
      expect(j$.pp(sampleValue)).toEqual("{ id : 1, calculatedValue : <getter> }");
    }
    else {
      expect(j$.pp(sampleValue)).toEqual("{ id : 1 }");
    }
  });


  it('should not do HTML escaping of strings', function() {
    expect(j$.pp('some <b>html string</b> &', false)).toEqual('\'some <b>html string</b> &\'');
  });

  it("should abbreviate the global (usually window) object", function() {
    expect(j$.pp(jasmine.getGlobal())).toEqual("<global>");
  });

  it("should stringify Date objects properly", function() {
    var now = new Date();
    expect(j$.pp(now)).toEqual("Date(" + now.toString() + ")");
  });

  it("should stringify spy objects properly", function() {
    var TestObject = {
          someFunction: function() {}
        },
        env = new j$.Env();

    env.spyOn(TestObject, 'someFunction');
    expect(j$.pp(TestObject.someFunction)).toEqual("spy on someFunction");

    expect(j$.pp(j$.createSpy("something"))).toEqual("spy on something");
  });

  it("should stringify objects that implement jasmineToString", function () {
    var obj = {
      jasmineToString: function () { return "strung"; }
    };

    expect(j$.pp(obj)).toEqual("strung");
  });
});

