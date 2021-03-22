describe('toHaveClass', function() {
  beforeEach(function() {
    this.domHelpers = jasmine.getEnv().domHelpers();
  });

  it('fails for a DOM element that lacks the expected class', function() {
    var matcher = jasmineUnderTest.matchers.toHaveClass(),
      result = matcher.compare(
        this.domHelpers.createElementWithClassName(''),
        'foo'
      );

    expect(result.pass).toBe(false);
  });

  it('passes for a DOM element that has the expected class', function() {
    var matcher = jasmineUnderTest.matchers.toHaveClass(),
      el = this.domHelpers.createElementWithClassName('foo bar baz');

    expect(matcher.compare(el, 'foo').pass).toBe(true);
    expect(matcher.compare(el, 'bar').pass).toBe(true);
    expect(matcher.compare(el, 'bar').pass).toBe(true);
  });

  it('fails for a DOM element that only has other classes', function() {
    var matcher = jasmineUnderTest.matchers.toHaveClass(),
      el = this.domHelpers.createElementWithClassName('foo bar');

    expect(matcher.compare(el, 'fo').pass).toBe(false);
  });

  it('throws an exception when actual is not a DOM element', function() {
    var matcher = jasmineUnderTest.matchers.toHaveClass({
      pp: jasmineUnderTest.makePrettyPrinter()
    });

    expect(function() {
      matcher.compare('x', 'foo');
    }).toThrowError("'x' is not a DOM element");

    expect(function() {
      matcher.compare(undefined, 'foo');
    }).toThrowError('undefined is not a DOM element');

    var textNode = this.domHelpers.document.createTextNode('');
    expect(function() {
      matcher.compare(textNode, 'foo');
    }).toThrowError('HTMLNode is not a DOM element');

    expect(function() {
      matcher.compare({ classList: '' }, 'foo');
    }).toThrowError("Object({ classList: '' }) is not a DOM element");
  });
});
