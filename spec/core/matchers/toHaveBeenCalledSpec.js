describe("toHaveBeenCalled", function() {
  it("passes when the actual was called, with a custom .not fail message", function() {
    var matcher = j$.matchers.toHaveBeenCalled(),
      calledSpy = j$.createSpy('called-spy'),
      result;

    calledSpy();

    result = matcher.compare(calledSpy);
    expect(result.pass).toBe(true);
    expect(result.message).toEqual("Expected spy called-spy not to have been called.");
  });

  it("fails when the actual was not called", function() {
    var matcher = j$.matchers.toHaveBeenCalled(),
      uncalledSpy = j$.createSpy('uncalled spy');

    result = matcher.compare(uncalledSpy);
    expect(result.pass).toBe(false);
  });

  it("throws an exception when the actual is not a spy", function() {
    var matcher = j$.matchers.toHaveBeenCalled(),
      fn = function() {};

    expect(function() { matcher.compare(fn) }).toThrow(new Error("Expected a spy, but got Function."));
  });

  it("throws an exception when invoked with any arguments", function() {
    var matcher = j$.matchers.toHaveBeenCalled(),
      spy = j$.createSpy('sample spy');

    expect(function() { matcher.compare(spy, 'foo') }).toThrow(new Error("toHaveBeenCalled does not take arguments, use toHaveBeenCalledWith"));
  });

  it("has a custom message on failure", function() {
    var matcher = j$.matchers.toHaveBeenCalled(),
      spy = j$.createSpy('sample-spy'),
      result;

    result = matcher.compare(spy);

    expect(result.message).toEqual("Expected spy sample-spy to have been called.");
  });
});

