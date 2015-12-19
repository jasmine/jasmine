describe("jasmineUnderTest.pp (HTML Dependent)", function () {
  it("should stringify HTML nodes properly", function() {
    var sampleNode = document.createElement('div');
    sampleNode.innerHTML = 'foo<b>bar</b>';
    expect(jasmineUnderTest.pp(sampleNode)).toEqual("HTMLNode");
    expect(jasmineUnderTest.pp({foo: sampleNode})).toEqual("Object({ foo: HTMLNode })");
  });

  it("should print Firefox's wrapped native objects correctly", function() {
    if(jasmine.getEnv().firefoxVersion) {
      try { new CustomEvent(); } catch(e) { var err = e; };
      expect(jasmineUnderTest.pp(err)).toMatch(/Not enough arguments/);
    }
  });
});
