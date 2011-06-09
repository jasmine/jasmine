describe("jasmine.pp (HTML Dependent)", function () {
  it("should stringify HTML nodes properly", function() {
    var sampleNode = document.createElement('div');
    sampleNode.innerHTML = 'foo<b>bar</b>';
    expect(jasmine.pp(sampleNode)).toEqual("HTMLNode");
    expect(jasmine.pp({foo: sampleNode})).toEqual("{ foo : HTMLNode }");
  });
});
