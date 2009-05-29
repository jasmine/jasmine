describe("jasmine.pp", function () {
  it("should wrap strings in single quotes", function() {
    expect(jasmine.pp("some string")).toEqual("'some string'");
    expect(jasmine.pp("som' string")).toEqual("'som' string'");
  });

  it("should stringify primitives properly", function() {
    expect(jasmine.pp(true)).toEqual("true");
    expect(jasmine.pp(false)).toEqual("false");
    expect(jasmine.pp(null)).toEqual("null");
    expect(jasmine.pp(undefined)).toEqual("undefined");
    expect(jasmine.pp(3)).toEqual("3");
    expect(jasmine.pp(-3.14)).toEqual("-3.14");
  });

  it("should stringify arrays properly", function() {
    expect(jasmine.pp([1, 2])).toEqual("[ 1, 2 ]");
    expect(jasmine.pp([1, 'foo', {}, undefined, null])).toEqual("[ 1, 'foo', {  }, undefined, null ]");
  });

  it("should indicate circular array references", function() {
    var array1 = [1, 2];
    var array2 = [array1];
    array1.push(array2);
    expect(jasmine.pp(array1)).toEqual("[ 1, 2, [ <circular reference: Array> ] ]");
  });

  it("should stringify objects properly", function() {
    expect(jasmine.pp({foo: 'bar'})).toEqual("{ foo : 'bar' }");
    expect(jasmine.pp({foo:'bar', baz:3, nullValue: null, undefinedValue: undefined})).toEqual("{ foo : 'bar', baz : 3, nullValue : null, undefinedValue : undefined }");
    expect(jasmine.pp({foo: function () { }, bar: [1, 2, 3]})).toEqual("{ foo : Function, bar : [ 1, 2, 3 ] }");
  });

  it("should indicate circular object references", function() {
    var sampleValue = {foo: 'hello'};
    sampleValue.nested = sampleValue;
    expect(jasmine.pp(sampleValue)).toEqual("{ foo : 'hello', nested : <circular reference: Object> }");
  });

  it("should indicate getters on objects as such", function() {
    var sampleValue = {id: 1};
    sampleValue.__defineGetter__('calculatedValue', function() { throw new Error("don't call me!"); });
    expect(jasmine.pp(sampleValue)).toEqual("{ id : 1, calculatedValue : <getter> }");
  });

  it("should stringify HTML nodes properly", function() {
    var sampleNode = document.createElement('div');
    sampleNode.innerHTML = 'foo<b>bar</b>';
    expect(jasmine.pp(sampleNode)).toEqual("HTMLNode");
    expect(jasmine.pp({foo: sampleNode})).toEqual("{ foo : HTMLNode }");
  });

  it('should not do HTML escaping of strings', function() {
    expect(jasmine.pp('some <b>html string</b> &', false)).toEqual('\'some <b>html string</b> &\'');
  });

  it("should abbreviate window objects", function() {
    expect(jasmine.pp(window)).toEqual("<window>");
  });

});

