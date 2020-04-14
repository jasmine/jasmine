describe('PrettyPrinter (HTML Dependent)', function() {
  it('should stringify non-element HTML nodes properly', function() {
    var sampleNode = document.createTextNode('');
    var pp = jasmineUnderTest.makePrettyPrinter();
    expect(pp(sampleNode)).toEqual('HTMLNode');
    expect(pp({ foo: sampleNode })).toEqual('Object({ foo: HTMLNode })');
  });

  it('should stringify empty HTML elements as their opening tags', function() {
    var simple = document.createElement('div');
    var pp = jasmineUnderTest.makePrettyPrinter();
    simple.className = 'foo';
    expect(pp(simple)).toEqual('<div class="foo">');
  });

  it('should stringify non-empty HTML elements as tags with placeholders', function() {
    var pp = jasmineUnderTest.makePrettyPrinter();
    var nonEmpty = document.createElement('div');
    nonEmpty.className = 'foo';
    nonEmpty.innerHTML = '<p>Irrelevant</p>';
    expect(pp(nonEmpty)).toEqual('<div class="foo">...</div>');
  });

  it("should print Firefox's wrapped native objects correctly", function() {
    if (jasmine.getEnv().firefoxVersion) {
      var pp = jasmineUnderTest.makePrettyPrinter();
      try {
        new CustomEvent();
      } catch (e) {
        var err = e;
      }
      // Different versions of FF produce different error messages.
      expect(pp(err)).toMatch(
        /Not enough arguments|CustomEvent.*only 0.*passed/
      );
    }
  });

  it('should stringify HTML element with text and attributes', function() {
    var pp = jasmineUnderTest.makePrettyPrinter();
    var el = document.createElement('div');
    el.setAttribute('things', 'foo');
    el.innerHTML = 'foo';
    expect(pp(el)).toEqual('<div things="foo">...</div>');
  });
});
