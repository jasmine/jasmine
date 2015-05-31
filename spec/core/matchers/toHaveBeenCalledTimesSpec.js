describe("toHaveBeenCalledTimes", function() {
  it("passes when the actual matches the expected", function() {
    var matcher = j$.matchers.toHaveBeenCalledTimes(),
      calledSpy = j$.createSpy('called-spy'),
      result;
    calledSpy();

    result = matcher.compare(calledSpy, 1);
    expect(result.pass).toBe(true);
  });

  it("fails when expected numbers is not supplied", function(){
     var matcher = j$.matchers.toHaveBeenCalledTimes(),
      spy = j$.createSpy('spy'),
      result;

    spy();
     expect(function() {
       matcher.compare(spy);
     }).toThrowError('Expected times failed is required as an argument.');
  });

  it("fails when the actual was called less than the expected", function() {
    var matcher = j$.matchers.toHaveBeenCalledTimes(),
      uncalledSpy = j$.createSpy('uncalled spy'),
      result;

    result = matcher.compare(uncalledSpy, 2);
    expect(result.pass).toBe(false);
  });

  it("fails when the actual was called more than expected", function() {
    var matcher = j$.matchers.toHaveBeenCalledTimes(),
      uncalledSpy = j$.createSpy('uncalled spy'),
      result;

    uncalledSpy();
    uncalledSpy();

    result = matcher.compare(uncalledSpy, 1);
    expect(result.pass).toBe(false);
  });

  it("throws an exception when the actual is not a spy", function() {
    var matcher = j$.matchers.toHaveBeenCalledTimes(),
      fn = function() {};

    expect(function() {
      matcher.compare(fn);
    }).toThrowError("Expected a spy, but got Function.");
  });

  it("has a custom message on failure that tells it was called only once", function() {
    var matcher = j$.matchers.toHaveBeenCalledTimes(),
      spy = j$.createSpy('sample-spy'),
      result;
    spy();
    spy();
    spy();
    spy();

    result = matcher.compare(spy, 1);

    expect(result.message).toEqual('Expected spy sample-spy to have been called once. It was called ' +  4 + ' times.');
  });

  it("has a custom message on failure that tells how many times it was called", function() {
    var matcher = j$.matchers.toHaveBeenCalledTimes(),
      spy = j$.createSpy('sample-spy'),
      result;
    spy();
    spy();
    spy();
    spy();

    result = matcher.compare(spy, 2);

    expect(result.message).toEqual('Expected spy sample-spy to have been called 2 times. It was called ' +  4 + ' times.');
  });
});

