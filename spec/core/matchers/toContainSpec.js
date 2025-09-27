describe('toContain', function() {
  it('delegates to privateUnderTest.MatchersUtil.contains', function() {
    const matchersUtil = {
        contains: jasmine.createSpy('delegated-contains').and.returnValue(true)
      },
      matcher = privateUnderTest.matchers.toContain(matchersUtil);

    const result = matcher.compare('ABC', 'B');
    expect(matchersUtil.contains).toHaveBeenCalledWith('ABC', 'B');
    expect(result.pass).toBe(true);
  });

  it('works with custom equality testers', function() {
    const tester = function(a, b) {
        return a.toString() === b.toString();
      },
      matchersUtil = new privateUnderTest.MatchersUtil({
        customTesters: [tester]
      }),
      matcher = privateUnderTest.matchers.toContain(matchersUtil);

    const result = matcher.compare(['1', '2'], 2);
    expect(result.pass).toBe(true);
  });
});
