describe("toHaveBeenCalledOnceWith", function () {

  it("passes when the actual was called only once and with matching parameters", function () {
    var util = jasmineUnderTest.matchersUtil,
      matcher = jasmineUnderTest.matchers.toHaveBeenCalledOnceWith(util),
      calledSpy = new jasmineUnderTest.Spy('called-spy'),
      result;

    calledSpy('a', 'b');
    result = matcher.compare(calledSpy, 'a', 'b');

    expect(result.pass).toBe(true);
    expect(result.message).toEqual("Expected spy called-spy to have been called 0 times, multiple times, or once, but with arguments different from:\n  [ 'a', 'b' ]\nBut the actual call was:\n  [ 'a', 'b' ].\n\n");
  });

  it("passes through the custom equality testers", function () {
    var util = jasmineUnderTest.matchersUtil;
    spyOn(util, 'contains').and.returnValue(false);

    var customEqualityTesters = [function () { return true; }],
      matcher = jasmineUnderTest.matchers.toHaveBeenCalledOnceWith(util, customEqualityTesters),
      calledSpy = new jasmineUnderTest.Spy('called-spy');

    calledSpy('a', 'b');
    matcher.compare(calledSpy, 'a', 'b');

    expect(util.contains).toHaveBeenCalledWith([['a', 'b']], ['a', 'b'], customEqualityTesters);
  });

  it("fails when the actual was never called", function () {
    var util = jasmineUnderTest.matchersUtil,
      matcher = jasmineUnderTest.matchers.toHaveBeenCalledOnceWith(util),
      calledSpy = new jasmineUnderTest.Spy('called-spy'),
      result;

    result = matcher.compare(calledSpy, 'a', 'b');

    expect(result.pass).toBe(false);
    expect(result.message).toEqual("Expected spy called-spy to have been called only once, and with given args:\n  [ 'a', 'b' ]\nBut it was never called.\n\n");
  });

  it("fails when the actual was called once with different parameters", function () {
    var util = jasmineUnderTest.matchersUtil,
      matcher = jasmineUnderTest.matchers.toHaveBeenCalledOnceWith(util),
      calledSpy = new jasmineUnderTest.Spy('called-spy'),
      result;

    calledSpy('a', 'c');
    result = matcher.compare(calledSpy, 'a', 'b');

    expect(result.pass).toBe(false);
    expect(result.message).toEqual("Expected spy called-spy to have been called only once, and with given args:\n  [ 'a', 'b' ]\nBut the actual call was:\n  [ 'a', 'c' ].\nExpected $[1] = 'c' to equal 'b'.\n\n");
  });

  it("fails when the actual was called multiple times with expected parameters", function () {
    var util = jasmineUnderTest.matchersUtil,
      matcher = jasmineUnderTest.matchers.toHaveBeenCalledOnceWith(util),
      calledSpy = new jasmineUnderTest.Spy('called-spy'),
      result;

    calledSpy('a', 'b');
    calledSpy('a', 'b');
    result = matcher.compare(calledSpy, 'a', 'b');

    expect(result.pass).toBe(false);
    expect(result.message).toEqual("Expected spy called-spy to have been called only once, and with given args:\n  [ 'a', 'b' ]\nBut the actual calls were:\n  [ 'a', 'b' ],\n  [ 'a', 'b' ].\n\n");
  });

  it("fails when the actual was called multiple times (one of them - with expected parameters)", function () {
    var util = jasmineUnderTest.matchersUtil,
      matcher = jasmineUnderTest.matchers.toHaveBeenCalledOnceWith(util),
      calledSpy = new jasmineUnderTest.Spy('called-spy'),
      result;

    calledSpy('a', 'b');
    calledSpy('a', 'c');
    result = matcher.compare(calledSpy, 'a', 'b');

    expect(result.pass).toBe(false);
    expect(result.message).toEqual("Expected spy called-spy to have been called only once, and with given args:\n  [ 'a', 'b' ]\nBut the actual calls were:\n  [ 'a', 'b' ],\n  [ 'a', 'c' ].\n\n");
  });

  it("throws an exception when the actual is not a spy", function () {
    var matcher = jasmineUnderTest.matchers.toHaveBeenCalledOnceWith(),
      fn = function () { };

    expect(function () { matcher.compare(fn) }).toThrowError(/Expected a spy, but got Function./);
  });
});
