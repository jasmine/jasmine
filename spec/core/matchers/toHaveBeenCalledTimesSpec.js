describe("toHaveBeenCalledTimes", function() {
  // TODO: I'd rather not allow .not.toHaveBeenCalledTimes()
  it("passes when the actual matches the expected", function() {
    var matcher = j$.matchers.toHaveBeenCalledTimes(1),
      calledSpy = j$.createSpy('called-spy'),
      result;

    calledSpy();

    result = matcher.compare(calledSpy);
    expect(result.pass).toBe(true);
  });
  it("fails when expected numbers is not supplied", function(){
     var matcher = j$.matchers.toHaveBeenCalledTimes(1),
      spy = j$.createSpy('spy'),
      result;

    calledSpy();

    result = matcher.compare(calledSpy);
    expect(result.pass).toBe(false);
    //expect(calledSpy).toThrow();
     expect(function() { matcher.compare(spy, 'foo') }).toThrow(new Error('Expected times failed is required as an argument.'));
  });
  it("fails when the actual was called less than the expected", function() {
    var matcher = j$.matchers.toHaveBeenCalledTimes(2),
      uncalledSpy = j$.createSpy('uncalled spy'),
      result;
    
    result = matcher.compare(uncalledSpy);
    expect(result.pass).toBe(false);
  });

  it("fails when the actual was called more than expected", function() {
    var matcher = j$.matchers.toHaveBeenCalledTimes(1),
      uncalledSpy = j$.createSpy('uncalled spy'),
      result;

    calledSpy();
    calledSpy();
	
    result = matcher.compare(uncalledSpy);
    expect(result.pass).toBe(false);
  });
  
  it("throws an exception when the actual is not a spy", function() {
    var matcher = j$.matchers.toHaveBeenCalledTimes(),
      fn = function() {};

    expect(function() { matcher.compare(fn) }).toThrow(new Error("Expected a spy, but got Function."));
  });
  
  it("has a custom message on failure that tells how many times it was called", function() {
    var matcher = j$.matchers.toHaveBeenCalledTimes(),
      spy = j$.createSpy('sample-spy'),
      result;
    calledSpy();
    calledSpy();
    calledSpy();
    calledSpy();

    result = matcher.compare(spy);

    expect(result.message).toEqual('Expected spy sample-spy to have been called only once. It was called ' +  4 + ' times.');
  });
});

