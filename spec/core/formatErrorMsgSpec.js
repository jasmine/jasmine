describe('formatErrorMsg', function () {
  it('should format an error with a domain', function() {
    var formator = jasmineUnderTest.formatErrorMsg('api');
    expect(formator('message')).toBe('api : message');
    expect(formator('message2')).toBe('api : message2');
  });

  it('should format an error with a domain and usage', function() {
    var formator = jasmineUnderTest.formatErrorMsg('api', 'with a param');
    expect(formator('message')).toBe('api : message\nUsage: with a param');
    expect(formator('message2')).toBe('api : message2\nUsage: with a param');
  });
});
