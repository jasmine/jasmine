describe("toHaveBeenCalledOnce", function() {
 it("passes when the actual was called one time", function() {
    var matcher = j$.matchers.toHaveBeenCalledOnce(),
      calledSpy = j$.createSpy('called spy'),
      result;

    calledSpy();
	
    result = matcher.compare(calledSpy);
    expect(result.pass).toBe(true);
  });
  
  it("fails when the actual was called more than once", function() {
    var matcher = j$.matchers.toHaveBeenCalledOnce(),
      calledSpy = j$.createSpy('called spy'),
      result;

    calledSpy();
    calledSpy();
	
    result = matcher.compare(calledSpy);
    expect(result.pass).toBe(false);
  });
  
  it("throws an exception when the actual is not a spy", function() {
    var matcher = j$.matchers.toHaveBeenCalledOnce(),
      fn = function() {};

    expect(function() { matcher.compare(fn) }).toThrow(new Error("Expected a spy, but got Function."));
  });

  it("throws an exception when invoked with any arguments", function() {
    var matcher = j$.matchers.toHaveBeenCalledOnce(1),
      spy = j$.createSpy('sample spy');

    expect(function() { matcher.compare(spy, 'foo') }).toThrow(new Error("toHaveBeenCalledOnce does not take arguments, use toHaveBeenCalledTimes."));
  });

  it("has a custom message on failure that tells how many times it was called", function() {
    var matcher = j$.matchers.toHaveBeenCalledOnce(),
      spy = j$.createSpy('sample-spy'),
      result;
    spy();
    spy();
    spy();
    spy();

    result = matcher.compare(spy);

    expect(result.message).toEqual('Expected spy sample-spy to have been called only once. It was called ' +  4 + ' times.');
  });
});

