describe("toBe", function() {
  it("passes with no message when actual === expected", function() {
    var matcher = jasmineUnderTest.matchers.toBe(jasmineUnderTest.matchersUtil),
      result;

    result = matcher.compare(1, 1);
    expect(result.pass).toBe(true);
  });

  it("passes with a custom message when expected is an array", function() {
    var matcher = jasmineUnderTest.matchers.toBe(jasmineUnderTest.matchersUtil),
      result,
      array = [1];

    result = matcher.compare(array, array);
    expect(result.pass).toBe(true);
    expect(result.message).toBe("Expected [ 1 ] not to be [ 1 ]. Tip: To check for deep equality, use .toEqual() instead of .toBe().")
  });

  it("passes with a custom message when expected is an object", function() {
    var matcher = jasmineUnderTest.matchers.toBe(jasmineUnderTest.matchersUtil),
      result,
      obj = {foo: "bar"};

    result = matcher.compare(obj, obj);
    expect(result.pass).toBe(true);
    expect(result.message).toBe("Expected Object({ foo: 'bar' }) not to be Object({ foo: 'bar' }). Tip: To check for deep equality, use .toEqual() instead of .toBe().")
  });

  it("fails with no message when actual !== expected", function() {
    var matcher = jasmineUnderTest.matchers.toBe(jasmineUnderTest.matchersUtil),
      result;

    result = matcher.compare(1, 2);
    expect(result.pass).toBe(false);
    expect(result.message).toBeUndefined();
  });

  it("fails with a custom message when expected is an array", function() {
    var matcher = jasmineUnderTest.matchers.toBe(jasmineUnderTest.matchersUtil),
      result;

    result = matcher.compare([1], [1]);
    expect(result.pass).toBe(false);
    expect(result.message).toBe("Expected [ 1 ] to be [ 1 ]. Tip: To check for deep equality, use .toEqual() instead of .toBe().")
  });

  it("fails with a custom message when expected is an object", function() {
    var matcher = jasmineUnderTest.matchers.toBe(jasmineUnderTest.matchersUtil),
      result;

    result = matcher.compare({foo: "bar"}, {foo: "bar"});
    expect(result.pass).toBe(false);
    expect(result.message).toBe("Expected Object({ foo: 'bar' }) to be Object({ foo: 'bar' }). Tip: To check for deep equality, use .toEqual() instead of .toBe().")
  });
});
