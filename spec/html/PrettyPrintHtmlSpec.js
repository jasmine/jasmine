describe("jasmine.pp (HTML Dependent)", function () {
  it("should stringify HTML nodes properly", function() {
    var sampleNode = document.createElement('div');
    sampleNode.innerHTML = 'foo<b>bar</b>';
    expect(j$.pp(sampleNode)).toEqual("HTMLNode");
    expect(j$.pp({foo: sampleNode})).toEqual("{ foo : HTMLNode }");
  });
});
