describe("toHaveBeenCalledLastTimeWith", function() {
  it("passes when the actual was called with matching parameters", function() {
    var util = {
          equals: jasmine.createSpy('delegated-equals').and.returnValue(true)
        },
        matcher = j$.matchers.toHaveBeenCalledLastTimeWith(util),
        calledSpy = j$.createSpy('called-spy'),
        result;

    calledSpy('a', 'b');
    result = matcher.compare(calledSpy, 'a', 'b');

    expect(result.pass).toBe(true);
    expect(result.message()).toEqual("Expected spy called-spy not to have been called last time with [ 'a', 'b' ] but it was.");
  });

  it("passes through the custom equality testers", function() {
    var util = {
          equals: jasmine.createSpy('delegated-equals').and.returnValue(true)
        },
        customEqualityTesters = [function() { return true; }],
        matcher = j$.matchers.toHaveBeenCalledLastTimeWith(util, customEqualityTesters),
        calledSpy = j$.createSpy('called-spy');

    calledSpy('a', 'b');
    matcher.compare(calledSpy, 'a', 'b');

    expect(util.equals).toHaveBeenCalledWith(['a', 'b'], ['a', 'b'], customEqualityTesters);
  });

  it("fails when the actual was not called", function() {
    var util = {
          equals: jasmine.createSpy('delegated-equals').and.returnValue(false)
        },
        matcher = j$.matchers.toHaveBeenCalledLastTimeWith(util),
        uncalledSpy = j$.createSpy('uncalled spy'),
        result;

    result = matcher.compare(uncalledSpy);
    expect(result.pass).toBe(false);
    expect(result.message()).toEqual("Expected spy uncalled spy to have been called last time with [  ] but it was never called.");
  });

  it("fails when the actual was called with different parameters", function() {
    var util = {
          equals: jasmine.createSpy('delegated-equals').and.returnValue(false)
        },
        matcher = j$.matchers.toHaveBeenCalledLastTimeWith(util),
        calledSpy = j$.createSpy('called spy'),
        result;

    calledSpy('a', 'b');
    calledSpy('c', 'd');
    result = matcher.compare(calledSpy, 'a', 'b');

    expect(result.pass).toBe(false);
    expect(result.message()).toEqual("Expected spy called spy to have been called last time with [ 'a', 'b' ] but actual call was [ 'c', 'd' ].");
  });

  it("throws an exception when the actual is not a spy", function() {
    var matcher = j$.matchers.toHaveBeenCalledLastTimeWith(),
        fn = function() {};

    expect(function() { matcher.compare(fn) }).toThrow(new Error("Expected a spy, but got Function."));
  });
});
