describe("toHaveBeenCalledWith", function() {

  it("passes when the actual was called with matching parameters", function() {
    var util = {
          contains: jasmine.createSpy('delegated-contains').and.returnValue(true)
        },
        matcher = jasmineUnderTest.matchers.toHaveBeenCalledWith(util),
        calledSpy = jasmineUnderTest.createSpy('called-spy'),
        result;

    calledSpy('a', 'b');
    result = matcher.compare(calledSpy, 'a', 'b');

    expect(result.pass).toBe(true);
    expect(result.message()).toEqual("Expected spy called-spy not to have been called with [ 'a', 'b' ] but it was.");
  });

  it("passes through the custom equality testers", function() {
    var util = {
          contains: jasmine.createSpy('delegated-contains').and.returnValue(true)
        },
        customEqualityTesters = [function() { return true; }],
        matcher = jasmineUnderTest.matchers.toHaveBeenCalledWith(util, customEqualityTesters),
        calledSpy = jasmineUnderTest.createSpy('called-spy');

    calledSpy('a', 'b');
    matcher.compare(calledSpy, 'a', 'b');

    expect(util.contains).toHaveBeenCalledWith([['a', 'b']], ['a', 'b'], customEqualityTesters);
  });

  it("fails when the actual was not called", function() {
    var util = {
          contains: jasmine.createSpy('delegated-contains').and.returnValue(false)
        },
        matcher = jasmineUnderTest.matchers.toHaveBeenCalledWith(util),
        uncalledSpy = jasmineUnderTest.createSpy('uncalled spy'),
        result;

    result = matcher.compare(uncalledSpy);
    expect(result.pass).toBe(false);
    expect(result.message()).toEqual("Expected spy uncalled spy to have been called with [  ] but it was never called.");
  });

  it("fails when the actual was called with different parameters", function() {
    var util = {
          contains: jasmine.createSpy('delegated-contains').and.returnValue(false)
        },
        matcher = jasmineUnderTest.matchers.toHaveBeenCalledWith(util),
        calledSpy = jasmineUnderTest.createSpy('called spy'),
        result;

    calledSpy('a');
    calledSpy('c', 'd');
    result = matcher.compare(calledSpy, 'a', 'b');

    expect(result.pass).toBe(false);
    expect(result.message()).toEqual("Expected spy called spy to have been called with [ 'a', 'b' ] but actual calls were [ 'a' ], [ 'c', 'd' ].");
  });

  it("throws an exception when the actual is not a spy", function() {
    var matcher = jasmineUnderTest.matchers.toHaveBeenCalledWith(),
        fn = function() {};

    expect(function() { matcher.compare(fn) }).toThrowError(/Expected a spy, but got Function./);
  });
});
