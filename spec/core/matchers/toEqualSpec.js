describe("toEqual", function() {
  it("delegates to equals function", function() {
    var util = {
        equals: jasmine.createSpy('delegated-equals').and.returnValue(true)
      },
      matcherComparator = j$.matchers.toEqual(util),
      result;

    result = matcherComparator(1, 1);

    expect(util.equals).toHaveBeenCalledWith(1, 1, []);
    expect(result.pass).toBe(true);
  });

  it("delegates custom equality testers, if present", function() {
    var util = {
        equals: jasmine.createSpy('delegated-equals').and.returnValue(true)
      },
      customEqualityTesters = ['a', 'b'],
      matcherComparator = j$.matchers.toEqual(util, customEqualityTesters),
      result;

    result = matcherComparator(1, 1);

    expect(util.equals).toHaveBeenCalledWith(1, 1, ['a', 'b']);
    expect(result.pass).toBe(true);
  });
});
