describe("j$.pp (HTML Dependent)", function () {
  it("should stringify HTML nodes properly", function() {
    var sampleNode = document.createElement('div');
    sampleNode.innerHTML = 'foo<b>bar</b>';
    expect(j$.pp(sampleNode)).toEqual("HTMLNode");
    expect(j$.pp({foo: sampleNode})).toEqual("{ foo : HTMLNode }");
  });

  it("should print Firefox's wrapped native objects correctly", function() {
    if(jasmine.getEnv().firefoxVersion) {
      try { new CustomEvent(); } catch(e) { var err = e; };
      expect(j$.pp(err)).toMatch(/Exception.*Not enough arguments/);
    }
  });
});
