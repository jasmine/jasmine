describe('nothing', function() {
  it('should pass', function() {
    var matcher = jasmineUnderTest.matchers.nothing(),
      result = matcher.compare();

    expect(result.pass).toBe(true);
  });
});
