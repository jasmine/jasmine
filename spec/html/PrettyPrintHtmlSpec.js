describe("jasmineUnderTest.pp (HTML Dependent)", function () {
  it("should stringify non-element HTML nodes properly", function() {
    var sampleNode = document.createTextNode("");
    expect(jasmineUnderTest.pp(sampleNode)).toEqual("HTMLNode");
    expect(jasmineUnderTest.pp({foo: sampleNode})).toEqual("Object({ foo: HTMLNode })");
  });

  it("should stringify empty HTML elements as their opening tags", function () {
    var simple = document.createElement('div');
    simple.className = 'foo';
    expect(jasmineUnderTest.pp(simple)).toEqual('<div class="foo">');
  });

  it("should stringify non-empty HTML elements as tags with placeholders", function() {
    var nonEmpty = document.createElement('div');
    nonEmpty.className = 'foo';
    nonEmpty.innerHTML = '<p>Irrelevant</p>';
    expect(jasmineUnderTest.pp(nonEmpty)).toEqual('<div class="foo">...</div>');
  });

  it("should print Firefox's wrapped native objects correctly", function() {
    if(jasmine.getEnv().firefoxVersion) {
      try { new CustomEvent(); } catch(e) { var err = e; };
      expect(jasmineUnderTest.pp(err)).toMatch(/Not enough arguments/);
    }
  });

  it("should stringify HTML element with text and attributes", function() {
    var el = document.createElement('div');
    el.setAttribute('things', 'foo');
    el.innerHTML = 'foo';
    expect(jasmineUnderTest.pp(el)).toEqual('<div things="foo">...</div>');
  });
});
