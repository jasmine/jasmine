describe('HtmlSpecFilter', function() {
  let env, deprecator;

  beforeEach(function() {
    deprecator = jasmine.createSpyObj('deprecator', [
      'verboseDeprecations',
      'addDeprecationWarning'
    ]);
    env = new privateUnderTest.Env({ deprecator });
  });

  afterEach(function() {
    env.cleanup_();
  });

  it('emits a deprecation warning', function() {
    new jasmineUnderTest.HtmlSpecFilter({ env });
    expect(deprecator.addDeprecationWarning).toHaveBeenCalledWith(
      jasmine.anything(),
      'HtmlReporter and HtmlSpecFilter are deprecated. Use HtmlReporterV2 instead.',
      undefined
    );
  });

  it('should match when no string is provided', function() {
    const specFilter = new jasmineUnderTest.HtmlSpecFilter({ env });

    expect(specFilter.matches('foo')).toBe(true);
    expect(specFilter.matches('*bar')).toBe(true);
  });

  it('should only match the provided string', function() {
    const specFilter = new jasmineUnderTest.HtmlSpecFilter({
      env,
      filterString: function() {
        return 'foo';
      }
    });

    expect(specFilter.matches('foo')).toBe(true);
    expect(specFilter.matches('bar')).toBe(false);
  });
});
