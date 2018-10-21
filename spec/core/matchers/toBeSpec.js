describe("toBe", function() {
  it("passes when actual === expected", function() {
    var matcher = jasmineUnderTest.matchers.toBe(),
      result;

    result = matcher.compare(1, 1);
    expect(result.pass).toBe(true);
  });

  it("fails with no message when actual !== expected", function() {
    var matcher = jasmineUnderTest.matchers.toBe(),
      result;

    result = matcher.compare(1, 2);
    expect(result.pass).toBe(false);
    expect(result.message).toBeUndefined();
  });

  it("fails with a custom message when expected is an array", function() {
    var matcher = jasmineUnderTest.matchers.toBe(),
    result;

    result = matcher.compare([1], [1]);
    expect(result.pass).toBe(false);
    expect(result.message).toBe("Expected [ 1 ] to be [ 1 ]. Tip: To check for deep equality, use .toEqual() instead of .toBe().")
  });

  it("fails with a custom message when expected is an object", function() {
    var matcher = jasmineUnderTest.matchers.toBe(),
    result;

    result = matcher.compare({foo: "bar"}, {foo: "bar"});
    expect(result.pass).toBe(false);
    expect(result.message).toBe("Expected Object({ foo: 'bar' }) to be Object({ foo: 'bar' }). Tip: To check for deep equality, use .toEqual() instead of .toBe().")
  });
});
