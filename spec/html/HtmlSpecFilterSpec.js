describe('HtmlSpecFilter', function() {
  beforeEach(function() {
    spyOn(jasmineUnderTest.getEnv(), 'deprecated');
  });

  it('emits a deprecation warning', function() {
    new jasmineUnderTest.HtmlSpecFilter();
    expect(jasmineUnderTest.getEnv().deprecated).toHaveBeenCalledWith(
      'HtmlReporter and HtmlSpecFilter are deprecated. Use HtmlReporterV2 instead.'
    );
  });

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
});
