describe("jasmine.pp", function () {
  it("should wrap strings in single quotes", function() {
    expect(jasmine.pp("some string")).toEqual("'some string'");
    expect(jasmine.pp("som' string")).toEqual("'som' string'");
  });

  it("should stringify primitives properly", function() {
    expect(jasmine.pp(true)).toEqual("true");
    expect(jasmine.pp(false)).toEqual("false");
    expect(jasmine.pp(null)).toEqual("null");
    expect(jasmine.pp(jasmine.undefined)).toEqual("undefined");
    expect(jasmine.pp(3)).toEqual("3");
    expect(jasmine.pp(-3.14)).toEqual("-3.14");
  });

  it("should stringify arrays properly", function() {
    expect(jasmine.pp([1, 2])).toEqual("[ 1, 2 ]");
    expect(jasmine.pp([1, 'foo', {}, jasmine.undefined, null])).toEqual("[ 1, 'foo', {  }, undefined, null ]");
  });

  it("should indicate circular array references", function() {
    var array1 = [1, 2];
    var array2 = [array1];
    array1.push(array2);
    expect(jasmine.pp(array1)).toEqual("[ 1, 2, [ <circular reference: Array> ] ]");
  });

  it("should stringify objects properly", function() {
    expect(jasmine.pp({foo: 'bar'})).toEqual("{ foo : 'bar' }");
    expect(jasmine.pp({foo:'bar', baz:3, nullValue: null, undefinedValue: jasmine.undefined})).toEqual("{ foo : 'bar', baz : 3, nullValue : null, undefinedValue : undefined }");
    expect(jasmine.pp({foo: function () {
    }, bar: [1, 2, 3]})).toEqual("{ foo : Function, bar : [ 1, 2, 3 ] }");
  });

  it("should stringify RegExp objects properly", function() {
    expect(jasmine.pp(/x|y|z/)).toEqual("/x|y|z/");
  });

  it("should indicate circular object references", function() {
    var sampleValue = {foo: 'hello'};
    sampleValue.nested = sampleValue;
    expect(jasmine.pp(sampleValue)).toEqual("{ foo : 'hello', nested : <circular reference: Object> }");
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
      expect(jasmine.pp(sampleValue)).toEqual("{ id : 1, calculatedValue : <getter> }");
    }
    else {
      expect(jasmine.pp(sampleValue)).toEqual("{ id : 1 }");
    }
  });


  it('should not do HTML escaping of strings', function() {
    expect(jasmine.pp('some <b>html string</b> &', false)).toEqual('\'some <b>html string</b> &\'');
  });

  it("should abbreviate the global (usually window) object", function() {
    expect(jasmine.pp(jasmine.getGlobal())).toEqual("<global>");
  });

  it("should stringify Date objects properly", function() {
    var now = new Date();
    expect(jasmine.pp(now)).toEqual("Date(" + now.toString() + ")");
  });

  it("should stringify spy objects properly", function() {
    var TestObject = {
      someFunction: function() {
      }
    };
    spyOn(TestObject, 'someFunction');
    expect(jasmine.pp(TestObject.someFunction)).toEqual("spy on someFunction");

    expect(jasmine.pp(jasmine.createSpy("something"))).toEqual("spy on something");
  });

});

