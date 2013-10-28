describe("toThrow", function() {
  it("throws an error when the actual is not a function", function() {
    var matcher = j$.matchers.toThrow();

    expect(function() {
      matcher.compare({});
      matcherComparator({});
    }).toThrowError("Actual is not a Function");
  });

  it("fails if actual does not throw", function() {
    var matcher = j$.matchers.toThrow(),
      fn = function() {
        return true;
      },
      result;

    result = matcher.compare(fn);

    expect(result.pass).toBe(false);
    expect(result.message).toEqual("Expected function to throw an exception.");
  });

  it("passes if it throws but there is no expected", function() {
    var util = {
        equals: jasmine.createSpy('delegated-equal').and.returnValue(true)
      },
      matcher = j$.matchers.toThrow(util),
      fn = function() {
        throw 5;
      },
      result;

    result = matcher.compare(fn);

    expect(result.pass).toBe(true);
    expect(result.message).toEqual("Expected function not to throw, but it threw 5.");
  });

  it("passes even if what is thrown is falsy", function() {
    var matcher = j$.matchers.toThrow(),
      fn = function() {
        throw undefined;
      },
      result;

    result = matcher.compare(fn);
    expect(result.pass).toBe(true);
    expect(result.message).toEqual("Expected function not to throw, but it threw undefined.");
  });

  it("passes if what is thrown is equivalent to what is expected", function() {
    var util = {
        equals: jasmine.createSpy('delegated-equal').and.returnValue(true)
      },
      matcher = j$.matchers.toThrow(util),
      fn = function() {
        throw 5;
      },
      result;

    result = matcher.compare(fn, 5);

    expect(result.pass).toBe(true);
    expect(result.message).toEqual("Expected function not to throw 5.");
  });

  it("fails if what is thrown is not equivalent to what is expected", function() {
    var util = {
        equals: jasmine.createSpy('delegated-equal').and.returnValue(false)
      },
      matcher = j$.matchers.toThrow(util),
      fn = function() {
        throw 5;
      },
      result;

    result = matcher.compare(fn, "foo");

    expect(result.pass).toBe(false);
    expect(result.message).toEqual("Expected function to throw 'foo', but it threw 5.");
  });

  it("fails if what is thrown is not equivalent to undefined", function() {
    var util = {
        equals: jasmine.createSpy('delegated-equal').and.returnValue(false)
      },
      matcher = j$.matchers.toThrow(util),
      fn = function() {
        throw 5;
      },
      result;

    result = matcher.compare(fn, void 0);

    expect(result.pass).toBe(false);
    expect(result.message).toEqual("Expected function to throw undefined, but it threw 5.");
  });
});
