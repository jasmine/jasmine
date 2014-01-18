describe("toContain", function() {
  it("delegates to j$.matchersUtil.contains", function() {
    var util = {
        contains: jasmine.createSpy('delegated-contains').and.returnValue(true)
      },
      matcher = j$.matchers.toContain(util),
      result;

    result = matcher.compare("ABC", "B");
    expect(util.contains).toHaveBeenCalledWith("ABC", "B", []);
    expect(result.pass).toBe(true);
  });

  it("delegates to j$.matchersUtil.contains, passing in equality testers if present", function() {
    var util = {
        contains: jasmine.createSpy('delegated-contains').and.returnValue(true)
      },
      customEqualityTesters = ['a', 'b'],
      matcher = j$.matchers.toContain(util, customEqualityTesters),
      result;

    result = matcher.compare("ABC", "B");
    expect(util.contains).toHaveBeenCalledWith("ABC", "B", ['a', 'b']);
    expect(result.pass).toBe(true);
  });
});
