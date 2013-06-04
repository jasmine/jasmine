describe("toThrowError", function() {
  it("throws an error when the actual is not a function", function() {
    var matcher = j$.matchers.toThrowError();

    expect(function() {
      matcher.compare({});
    }).toThrow(new Error("Actual is not a Function")); // TODO: this needs to change for self-test
  });

  it("throws an error when the expected is not an Error, string, or RegExp", function() {
    var matcher = j$.matchers.toThrowError(),
      fn = function() {
        throw new Error("foo");
      };

    expect(function() {
      matcher.compare(fn, 1);
    }).toThrow(new Error("Expected is not an Error, string, or RegExp.")); // TODO: this needs to change for self-test
  });

  it("throws an error when the expected error type is not an Error", function() {
    var matcher = j$.matchers.toThrowError(),
      fn = function() {
        throw new Error("foo");
      };

    expect(function() {
      matcher.compare(fn, "string", "foo");
    }).toThrow(new Error("Expected error type is not an Error.")); // TODO: this needs to change for self-test
  });

  it("throws an error when the expected error message is not a string or RegExp", function() {
    var matcher = j$.matchers.toThrowError(),
      fn = function() {
        throw new Error("foo");
      };

    expect(function() {
      matcher.compare(fn, Error, 1);
    }).toThrow(new Error("Expected error message is not a string or RegExp.")); // TODO: this needs to change for self-test
  });

  it("fails if actual does not throw at all", function() {
    var matcher = j$.matchers.toThrowError(),
      fn = function() {
        return true;
      },
      result;

    result = matcher.compare(fn);

    expect(result.pass).toBe(false);
    expect(result.message).toEqual("Expected function to throw an Error.");
  });

  it("fails if thrown is not an instanceof Error", function() {
    var matcher = j$.matchers.toThrowError(),
      fn = function() {
        throw 4;
      },
      result;

    result = matcher.compare(fn);
    expect(result.pass).toBe(false);
    expect(result.message).toEqual("Expected function to throw an Error, but it threw 4.");
  });

  it("fails with the correct message if thrown is a falsy value", function() {
    var matcher = j$.matchers.toThrowError(),
      fn = function() {
        throw undefined;
      },
      result;

    result = matcher.compare(fn);
    expect(result.pass).toBe(false);
    expect(result.message).toEqual("Expected function to throw an Error, but it threw undefined.");
  });

  it("passes if thrown is an Error, but there is no expected error", function() {
    var matcher = j$.matchers.toThrowError(),
      fn = function() {
        throw new TypeError();
      },
      result;

    result = matcher.compare(fn);

    expect(result.pass).toBe(true);
    expect(result.message).toEqual("Expected function not to throw an Error, but it threw TypeError.");
  });

  it("passes if thrown is an Error and the expected is the same message", function() {
    var matcher = j$.matchers.toThrowError(),
      fn = function() {
        throw new Error("foo");
      },
      result;

    result = matcher.compare(fn, "foo");

    expect(result.pass).toBe(true);
    expect(result.message).toEqual("Expected function not to throw an execption with message 'foo'.");
  });

  it("fails if thrown is an Error and the expected is not the same message", function() {
    var matcher = j$.matchers.toThrowError(),
      fn = function() {
        throw new Error("foo");
      },
      result;

    result = matcher.compare(fn, "bar");

    expect(result.pass).toBe(false);
    expect(result.message).toEqual("Expected function to throw an execption with message 'bar'.");
  });

  it("passes if thrown is an Error and the expected is a RegExp that matches the message", function() {
    var matcher = j$.matchers.toThrowError(),
      fn = function() {
        throw new Error("a long message");
      },
      result;

    result = matcher.compare(fn, /long/);

    expect(result.pass).toBe(true);
    expect(result.message).toEqual("Expected function not to throw an execption with a message matching /long/.");
  });

  it("fails if thrown is an Error and the expected is a RegExp that does not match the message", function() {
    var matcher = j$.matchers.toThrowError(),
      fn = function() {
        throw new Error("a long message");
      },
      result;

    result = matcher.compare(fn, /foo/);

    expect(result.pass).toBe(false);
    expect(result.message).toEqual("Expected function to throw an execption with a message matching /foo/.");
  });

  it("passes if thrown is an Error and the expected the same Error", function() {
    var util = {
        equals: j$.createSpy('delegated-equal').andReturn(true)
      },
      matcher = j$.matchers.toThrowError(util),
      fn = function() {
        throw new Error();
      },
      result;

    result = matcher.compare(fn, Error);

    expect(result.pass).toBe(true);
    expect(result.message).toEqual("Expected function not to throw Error.");
  });

  it("passes if thrown is a custom error that takes arguments and the expected is the same error", function() {
    var util = {
        equals: j$.createSpy('delegated-equal').andReturn(true)
      },
      matcher = j$.matchers.toThrowError(util),
      CustomError = function CustomError(arg) { arg.x },
      fn = function() {
        throw new CustomError({ x: 1 });
      },
      result;

    CustomError.prototype = new Error();
    CustomError.prototype.constructor = CustomError;

    result = matcher.compare(fn, CustomError);

    expect(result.pass).toBe(true);
    expect(result.message).toEqual("Expected function not to throw CustomError.");
  });

  it("fails if thrown is an Error and the expected is a different Error", function() {
    var util = {
        equals: j$.createSpy('delegated-equal').andReturn(false)
      },
      matcher = j$.matchers.toThrowError(util),
      fn = function() {
        throw new Error();
      },
      result;

    result = matcher.compare(fn, TypeError);

    expect(result.pass).toBe(false);
    expect(result.message).toEqual("Expected function to throw TypeError.");
  });

  it("passes if thrown is an Error and it is equal to the expected Error and message", function() {
    var util = {
        equals: j$.createSpy('delegated-equal').andReturn(true)
      },
      matcher = j$.matchers.toThrowError(util),
      fn = function() {
        throw new Error("foo");
      },
      result;

    result = matcher.compare(fn, Error, "foo");

    expect(result.pass).toBe(true);
    expect(result.message).toEqual("Expected function not to throw Error with message \"foo\".");
  });

  it("passes if thrown is a custom error that takes arguments and it is equal to the expected custom error and message", function() {
    var util = {
        equals: j$.createSpy('delegated-equal').andReturn(true)
      },
      matcher = j$.matchers.toThrowError(util),
      CustomError = function CustomError(arg) { this.message = arg.message },
      fn = function() {
        throw new CustomError({message: "foo"});
      },
      result;

    CustomError.prototype = new Error();
    CustomError.prototype.constructor = CustomError;

    result = matcher.compare(fn, CustomError, "foo");

    expect(result.pass).toBe(true);
    expect(result.message).toEqual("Expected function not to throw Error with message \"foo\".");
  });

  it("fails if thrown is an Error and the expected is a different Error", function() {
    var util = {
        equals: j$.createSpy('delegated-equal').andReturn(false)
      },
      matcher = j$.matchers.toThrowError(util),
      fn = function() {
        throw new Error("foo");
      },
      result;

    result = matcher.compare(fn, Error, "bar");

    expect(result.pass).toBe(false);
    expect(result.message).toEqual("Expected function to throw Error with message \"bar\".");
  });

  it("passes if thrown is an Error and has the same type as the expected Error and the message matches the exepcted message", function() {
    var util = {
        equals: j$.createSpy('delegated-equal').andReturn(true)
      },
      matcher = j$.matchers.toThrowError(util),
      fn = function() {
        throw new Error("foo");
      },
      result;

    result = matcher.compare(fn, Error, /foo/);

    expect(result.pass).toBe(true);
    expect(result.message).toEqual("Expected function not to throw Error with message matching /foo/.");
  });

  it("fails if thrown is an Error and the expected is a different Error", function() {
    var util = {
        equals: j$.createSpy('delegated-equal').andReturn(false)
      },
      matcher = j$.matchers.toThrowError(util),
      fn = function() {
        throw new Error("foo");
      },
      result;

    result = matcher.compare(fn, Error, /bar/);

    expect(result.pass).toBe(false);
    expect(result.message).toEqual("Expected function to throw Error with message matching /bar/.");
  });
});
