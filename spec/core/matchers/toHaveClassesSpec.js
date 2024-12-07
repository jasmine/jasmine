describe('toHaveClasses', function() {
  it('fails for a DOM element that lacks all the expected classes', function() {
    const matcher = jasmineUnderTest.matchers.toHaveClasses(),
      result = matcher.compare(
        specHelpers.domHelpers.createElementWithClassName(''),
        ['foo', 'bar']
      );

    expect(result.pass).toBe(false);
  });

  it('passes for a DOM element that has all the expected classes', function() {
    const matcher = jasmineUnderTest.matchers.toHaveClasses(),
      el = specHelpers.domHelpers.createElementWithClassName('foo bar baz');

    expect(matcher.compare(el, ['foo', 'bar']).pass).toBe(true);
  });

  it('fails for a DOM element that only has some matching classes', function() {
    const matcher = jasmineUnderTest.matchers.toHaveClasses(),
      el = specHelpers.domHelpers.createElementWithClassName('foo bar');

    expect(matcher.compare(el, ['foo', 'can']).pass).toBe(false);
  });

  it('throws an exception when actual is not a DOM element', function() {
    const matcher = jasmineUnderTest.matchers.toHaveClasses({
      pp: jasmineUnderTest.makePrettyPrinter()
    });

    expect(function() {
      matcher.compare('x', ['foo']);
    }).toThrowError("'x' is not a DOM element");

    expect(function() {
      matcher.compare(undefined, ['foo']);
    }).toThrowError('undefined is not a DOM element');

    const textNode = specHelpers.domHelpers.document.createTextNode('');
    expect(function() {
      matcher.compare(textNode, ['foo']);
    }).toThrowError('HTMLNode is not a DOM element');

    expect(function() {
      matcher.compare({ classList: '' }, ['foo']);
    }).toThrowError("Object({ classList: '' }) is not a DOM element");
  });
});
