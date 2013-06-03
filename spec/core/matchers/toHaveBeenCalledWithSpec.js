describe("toHaveBeenCalledWith", function() {
  it("passes when the actual was called with matching parameters", function() {
    var util = {
        contains: j$.createSpy('delegated-contains').andReturn(true)
      },
      matcher = j$.matchers.toHaveBeenCalledWith(util)
    calledSpy = j$.createSpy('called-spy'),
      result;

    calledSpy('a', 'b');
    result = matcher.compare(calledSpy, 'a', 'b');

    expect(result.pass).toBe(true);
  });

  it("fails when the actual was not called", function() {
    var util = {
        contains: j$.createSpy('delegated-contains').andReturn(false)
      },
      matcher = j$.matchers.toHaveBeenCalledWith(util),
      uncalledSpy = j$.createSpy('uncalled spy'),
      result;

    result = matcher.compare(uncalledSpy);
    expect(result.pass).toBe(false);
  });

  it("fails when the actual was called with different parameters", function() {
    var util = {
        contains: j$.createSpy('delegated-contains').andReturn(false)
      },
      matcher = j$.matchers.toHaveBeenCalledWith(util),
      calledSpy = j$.createSpy('called spy'),
      result;

    calledSpy('a');
    result = matcher.compare(calledSpy, 'a', 'b');

    expect(result.pass).toBe(false);
  });

  it("throws an exception when the actual is not a spy", function() {
    var matcher = j$.matchers.toHaveBeenCalledWith(),
      fn = function() {};

    expect(function() { matcher.compare(fn) }).toThrow(new Error("Expected a spy, but got Function."));
  });

  it("has a custom message on failure", function() {
    var matcher = j$.matchers.toHaveBeenCalledWith(),
      spy = j$.createSpy('sample-spy'),
      messages = matcher.message(spy);

    expect(messages.affirmative).toEqual("Expected spy sample-spy to have been called.")
    expect(messages.negative).toEqual("Expected spy sample-spy not to have been called.")
  });
});
