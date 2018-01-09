describe("toHaveBeenCalled", function() {
  it("passes when the actual was called, with a custom .not fail message", function() {
    var matcher = jasmineUnderTest.matchers.toHaveBeenCalled(),
      calledSpy = new jasmineUnderTest.Env().createSpy('called-spy'),
      result;

    calledSpy();

    result = matcher.compare(calledSpy);
    expect(result.pass).toBe(true);
    expect(result.message).toEqual("Expected spy called-spy not to have been called.");
  });

  it("fails when the actual was not called", function() {
    var matcher = jasmineUnderTest.matchers.toHaveBeenCalled(),
      uncalledSpy = new jasmineUnderTest.Env().createSpy('uncalled spy'),
      result;

    result = matcher.compare(uncalledSpy);
    expect(result.pass).toBe(false);
  });

  it("throws an exception when the actual is not a spy", function() {
    var matcher = jasmineUnderTest.matchers.toHaveBeenCalled(),
      fn = function() {};

    expect(function() { matcher.compare(fn) }).toThrowError(Error, /Expected a spy, but got Function./);
  });

  it("throws an exception when invoked with any arguments", function() {
    var matcher = jasmineUnderTest.matchers.toHaveBeenCalled(),
      spy = new jasmineUnderTest.Env().createSpy('sample spy');

    expect(function() { matcher.compare(spy, 'foo') }).toThrowError(Error, /Does not take arguments, use toHaveBeenCalledWith/);
  });

  it("has a custom message on failure", function() {
    var matcher = jasmineUnderTest.matchers.toHaveBeenCalled(),
      spy = new jasmineUnderTest.Env().createSpy('sample-spy'),
      result;

    result = matcher.compare(spy);

    expect(result.message).toEqual("Expected spy sample-spy to have been called.");
  });
});

