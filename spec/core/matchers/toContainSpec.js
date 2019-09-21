describe("toContain", function() {
  it("delegates to jasmineUnderTest.matchersUtil.contains", function() {
    var util = {
        contains: jasmine.createSpy('delegated-contains').and.returnValue(true)
      },
      matcher = jasmineUnderTest.matchers.toContain(util),
      result;

    result = matcher.compare("ABC", "B");
    expect(util.contains).toHaveBeenCalledWith("ABC", "B");
    expect(result.pass).toBe(true);
  });

  it("works with custom equality testers", function() {
    var tester = function (a, b) {
        return a.toString() === b.toString();
      },
      matchersUtil = new jasmineUnderTest.MatchersUtil({customTesters: [tester]}),
      matcher = jasmineUnderTest.matchers.toContain(matchersUtil),
      result;

    result = matcher.compare(['1', '2'], 2);
    expect(result.pass).toBe(true);
  });
});
