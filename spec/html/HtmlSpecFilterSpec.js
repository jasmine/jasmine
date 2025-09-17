describe('HtmlSpecFilter', function() {
  it('should match when no string is provided', function() {
    const specFilter = new jasmineUnderTest.HtmlSpecFilter();

    expect(specFilter.matches('foo')).toBe(true);
    expect(specFilter.matches('*bar')).toBe(true);
  });

  it('should only match the provided string', function() {
    const specFilter = new jasmineUnderTest.HtmlSpecFilter({
      filterString: function() {
        return 'foo';
      }
    });

    expect(specFilter.matches('foo')).toBe(true);
    expect(specFilter.matches('bar')).toBe(false);
  });

  it('copes with HtmlExactSpecFilterV2 filter strings', function() {
    const specFilter = new jasmineUnderTest.HtmlSpecFilter({
      filterString: function() {
        return '["foo","bar"]';
      }
    });

    expect(specFilter.matches('foo bar')).toBe(true);
    expect(specFilter.matches('baz foo bar qux')).toBe(true);
    expect(specFilter.matches('foo')).toBe(false);
    expect(specFilter.matches('bar')).toBe(false);
  });
});
