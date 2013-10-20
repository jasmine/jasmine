describe("toHaveBeenCalledWith", function() {
  it("passes when the actual was called with matching parameters", function() {
    var util = {
          contains: jasmine.createSpy('delegated-contains').and.returnValue(true)
        },
        matcherComparator = j$.matchers.toHaveBeenCalledWith(util),
        calledSpy = j$.createSpy('called-spy'),
        result;

    calledSpy('a', 'b');
    result = matcherComparator(calledSpy, 'a', 'b');

    expect(result.pass).toBe(true);
    expect(result.message).toEqual("Expected spy called-spy not to have been called with [ 'a', 'b' ] but it was.");
  });

  it("fails when the actual was not called", function() {
    var util = {
          contains: jasmine.createSpy('delegated-contains').and.returnValue(false)
        },
        matcherComparator = j$.matchers.toHaveBeenCalledWith(util),
        uncalledSpy = j$.createSpy('uncalled spy'),
        result;

    result = matcherComparator(uncalledSpy);
    expect(result.pass).toBe(false);
    expect(result.message).toEqual("Expected spy uncalled spy to have been called with [  ] but it was never called.");
  });

  it("fails when the actual was called with different parameters", function() {
    var util = {
          contains: jasmine.createSpy('delegated-contains').and.returnValue(false)
        },
        matcherComparator = j$.matchers.toHaveBeenCalledWith(util),
        calledSpy = j$.createSpy('called spy'),
        result;

    calledSpy('a');
    calledSpy('c', 'd');
    result = matcherComparator(calledSpy, 'a', 'b');

    expect(result.pass).toBe(false);
    expect(result.message).toEqual("Expected spy called spy to have been called with [ 'a', 'b' ] but actual calls were [ 'a' ], [ 'c', 'd' ].");
  });

  it("throws an exception when the actual is not a spy", function() {
    var matcherComparator = j$.matchers.toHaveBeenCalledWith(),
        fn = function() {};

    expect(function() { matcherComparator(fn) }).toThrow(new Error("Expected a spy, but got Function."));
  });
});
