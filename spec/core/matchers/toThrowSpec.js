describe("toThrow", function() {
  it("throw an error when the acutal is not a function ", function() {
    var matcher = j$.matchers.toThrow();

    expect(function() {
      matcher.compare({});
    }).toThrow(new Error("Actual is not a Function"));
  });

  it("throws an error when the expected can't be turned into an exception", function() {
    var matcher = j$.matchers.toThrow(),
      fn = function() {
        throw "foo";
      },
      result;

    expect(function() {
      matcher.compare(fn, 1);
    }).toThrow(new Error("Expected cannot be treated as an exception."));
  });

  it("passes if the actual throws any exception", function() {
    var matcher = j$.matchers.toThrow(),
      fn = function() {
        throw "foo";
      },
      result;

    result = matcher.compare(fn);

    expect(result.pass).toBe(true);
    expect(result.message).toEqual("Expected function not to throw an exception.");
  });

  it("fails if the actual does not throw an exception", function() {
    var matcher = j$.matchers.toThrow(),
      fn = function() {
        return 0;
      },
      result;

    result = matcher.compare(fn);

    expect(result.pass).toBe(false);
    expect(result.message).toEqual("Expected function to throw an exception.");
  });

  it("passes if the actual throws an exception with the expected message", function() {
    var matcher = j$.matchers.toThrow(),
      fn = function() {
        throw "foo";
      },
      result;

    result = matcher.compare(fn, "foo");

    expect(result.pass).toBe(true);
    expect(result.message).toEqual("Expected function not to throw an exception \"foo\".");
  });

  it("fails if the actual throws an exception with a different message", function() {
    var matcher = j$.matchers.toThrow(),
      fn = function() {
        throw "foo";
      },
      result;

    result = matcher.compare(fn, "bar");

    expect(result.pass).toBe(false);
    expect(result.message).toEqual("Expected function to throw an exception \"bar\".");
  });

  it("passes if the actual throws an exception and matches the message of the expected exception", function() {
    var matcher = j$.matchers.toThrow(),
      fn = function() {
        throw "foo";
      },
      result;

    result = matcher.compare(fn, new Error("foo"));

    expect(result.pass).toBe(true);
    expect(result.message).toEqual("Expected function not to throw an exception \"foo\".");
  });

  it("fails if the actual throws an exception and it does not match the message of the expected exception with a custom message", function() {
    var matcher = j$.matchers.toThrow(),
      fn = function() {
        throw "foo";
      },
      result;

    result = matcher.compare(fn, new Error("bar"));

    expect(result.pass).toBe(false);
    expect(result.message).toEqual("Expected function to throw an exception \"bar\".");
  });

  it("passes if the actual throws an exception and the message matches the expected regular expression", function() {
    var matcher = j$.matchers.toThrow(),
      fn = function() {
        throw "a long message";
      },
      result;

    result = matcher.compare(fn, /long/);

    expect(result.pass).toBe(true);
    expect(result.message).toEqual("Expected function not to throw an exception matching /long/.");
  });

  it("fails if the actual throws an exception and the message does not match the expected regular expression", function() {
    var matcher = j$.matchers.toThrow(),
      fn = function() {
        throw "a long message";
      },
      result;

    result = matcher.compare(fn, /short/);

    expect(result.pass).toBe(false);
    expect(result.message).toEqual("Expected function to throw an exception matching /short/.");
  });

  it("passes if the actual throws an exception with an undefined message", function() {
    var matcher = j$.matchers.toThrow(),
      fn = function() {
        throw void 0;
      },
      result;

    result = matcher.compare(fn);

    expect(result.pass).toBe(true);
    expect(result.message).toEqual("Expected function not to throw an exception.");
  });

  it("passes if the actual throws an exception with an empty message", function() {
    var matcher = j$.matchers.toThrow(),
      fn = function() {
        throw "";
      },
      result;

    result = matcher.compare(fn);

    expect(result.pass).toBe(true);
    expect(result.message).toEqual("Expected function not to throw an exception.");
  });
});