describe('HtmlSpecFilterV2', function() {
  it('should match when no string is provided', function() {
    const specFilter = new jasmineUnderTest.HtmlSpecFilterV2();

    expect(specFilter.matches('foo')).toBe(true);
    expect(specFilter.matches('*bar')).toBe(true);
  });

  it('should only match the provided string', function() {
    const specFilter = new jasmineUnderTest.HtmlSpecFilterV2({
      filterString: function() {
        return 'foo';
      }
    });

    expect(specFilter.matches('foo')).toBe(true);
    expect(specFilter.matches('bar')).toBe(false);
  });
});
