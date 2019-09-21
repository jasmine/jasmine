describe("toHaveBeenCalledWith", function() {

  it("passes when the actual was called with matching parameters", function() {
    var util = {
          contains: jasmine.createSpy('delegated-contains').and.returnValue(true)
        },
        matcher = jasmineUnderTest.matchers.toHaveBeenCalledWith(util),
        calledSpy = new jasmineUnderTest.Env().createSpy('called-spy'),
        result;

    calledSpy('a', 'b');
    result = matcher.compare(calledSpy, 'a', 'b');

    expect(result.pass).toBe(true);
    expect(result.message()).toEqual("Expected spy called-spy not to have been called with:\n  [ 'a', 'b' ]\nbut it was.");
  });

  it("supports custom equality testers", function() {
    var customEqualityTesters = [function() { return true; }],
      matchersUtil = new jasmineUnderTest.MatchersUtil({customTesters: customEqualityTesters}),
      matcher = jasmineUnderTest.matchers.toHaveBeenCalledWith(matchersUtil),
      calledSpy = new jasmineUnderTest.Env().createSpy('called-spy'),
      result;

    calledSpy('a', 'b');
    result = matcher.compare(calledSpy, 'a', 'b');
    expect(result.pass).toBe(true);
  });

  it("fails when the actual was not called", function() {
    var util = {
          contains: jasmine.createSpy('delegated-contains').and.returnValue(false)
        },
        matcher = jasmineUnderTest.matchers.toHaveBeenCalledWith(util),
        uncalledSpy = new jasmineUnderTest.Env().createSpy('uncalled spy'),
        result;

    result = matcher.compare(uncalledSpy);
    expect(result.pass).toBe(false);
    expect(result.message()).toEqual("Expected spy uncalled spy to have been called with:\n  [  ]\nbut it was never called.");
  });

  it("fails when the actual was called with different parameters", function() {
    var util = new jasmineUnderTest.MatchersUtil(),
        matcher = jasmineUnderTest.matchers.toHaveBeenCalledWith(util),
        calledSpy = new jasmineUnderTest.Env().createSpy('called spy'),
        result;

    calledSpy('a');
    calledSpy('c', 'd');
    calledSpy('a', 'b', 'c');
    result = matcher.compare(calledSpy, 'a', 'b');

    expect(result.pass).toBe(false);
    expect(result.message()).toEqual(
      "Expected spy called spy to have been called with:\n" +
      "  [ 'a', 'b' ]\n" +
      "but actual calls were:\n" +
      "  [ 'a' ],\n" +
      "  [ 'c', 'd' ],\n" +
      "  [ 'a', 'b', 'c' ].\n\n" +
      "Call 0:\n" +
      "  Expected $.length = 1 to equal 2.\n" +
      "  Expected $[1] = undefined to equal 'b'.\n" +
      "Call 1:\n" +
      "  Expected $[0] = 'c' to equal 'a'.\n" +
      "  Expected $[1] = 'd' to equal 'b'.\n" +
      "Call 2:\n" +
      "  Expected $.length = 3 to equal 2.\n" +
      "  Unexpected $[2] = 'c' in array.");
  });

  it("throws an exception when the actual is not a spy", function() {
    var matcher = jasmineUnderTest.matchers.toHaveBeenCalledWith(),
        fn = function() {};

    expect(function() { matcher.compare(fn) }).toThrowError(/Expected a spy, but got Function./);
  });
});
