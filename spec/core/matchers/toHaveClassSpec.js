describe('toHaveClass', function() {
  beforeEach(function() {
    this.createElementWithClassName = function(className) {
      var el = this.doc.createElement('div');
      el.className = className;
      return el;
    };

    if (typeof document !== 'undefined') {
      this.doc = document;
    } else {
      var JSDOM = require('jsdom').JSDOM;
      var dom = new JSDOM();
      this.doc = dom.window.document;
    }
  });

  it('fails for a DOM element that lacks the expected class', function() {
    var matcher = jasmineUnderTest.matchers.toHaveClass(),
      result = matcher.compare(this.createElementWithClassName(''), 'foo');

    expect(result.pass).toBe(false);
  });

  it('passes for a DOM element that has the expected class', function() {
    var matcher = jasmineUnderTest.matchers.toHaveClass(),
      el = this.createElementWithClassName('foo bar baz');

    expect(matcher.compare(el, 'foo').pass).toBe(true);
    expect(matcher.compare(el, 'bar').pass).toBe(true);
    expect(matcher.compare(el, 'bar').pass).toBe(true);
  });

  it('fails for a DOM element that only has other classes', function() {
    var matcher = jasmineUnderTest.matchers.toHaveClass(),
      el = this.createElementWithClassName('foo bar');

    expect(matcher.compare(el, 'fo').pass).toBe(false);
  });

  it('throws an exception when actual is not a DOM element', function() {
    var matcher = jasmineUnderTest.matchers.toHaveClass();

    expect(function() {
      matcher.compare('x', 'foo');
    }).toThrowError("'x' is not a DOM element");

    expect(function() {
      matcher.compare(undefined, 'foo');
    }).toThrowError('undefined is not a DOM element');

    var textNode = this.doc.createTextNode('');
    expect(function() {
      matcher.compare(textNode, 'foo')
    }).toThrowError('HTMLNode is not a DOM element');

    expect(function() {
      matcher.compare({classList: ''}, 'foo');
    }).toThrowError("Object({ classList: '' }) is not a DOM element");
  });
});
