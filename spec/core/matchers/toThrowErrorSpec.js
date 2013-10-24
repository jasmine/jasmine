describe("toThrowError", function() {
  it("throws an error when the actual is not a function", function() {
    var matcherComparator = j$.matchers.toThrowError();

    expect(function() {
      matcherComparator({});
    }).toThrowError("Actual is not a Function");
  });

  it("throws an error when the expected is not an Error, string, or RegExp", function() {
    var matcherComparator = j$.matchers.toThrowError(),
      fn = function() {
        throw new Error("foo");
      };

    expect(function() {
      matcherComparator(fn, 1);
    }).toThrowError("Expected is not an Error, string, or RegExp.");
  });

  it("throws an error when the expected error type is not an Error", function() {
    var matcherComparator = j$.matchers.toThrowError(),
      fn = function() {
        throw new Error("foo");
      };

    expect(function() {
      matcherComparator(fn, void 0, "foo");
    }).toThrowError("Expected error type is not an Error.");
  });

  it("throws an error when the expected error message is not a string or RegExp", function() {
    var matcherComparator = j$.matchers.toThrowError(),
      fn = function() {
        throw new Error("foo");
      };

    expect(function() {
      matcherComparator(fn, Error, 1);
    }).toThrowError("Expected error message is not a string or RegExp.");
  });

  it("fails if actual does not throw at all", function() {
    var matcherComparator = j$.matchers.toThrowError(),
      fn = function() {
        return true;
      },
      result;

    result = matcherComparator(fn);

    expect(result.pass).toBe(false);
    expect(result.message).toEqual("Expected function to throw an Error.");
  });

  it("fails if thrown is not an instanceof Error", function() {
    var matcherComparator = j$.matchers.toThrowError(),
      fn = function() {
        throw 4;
      },
      result;

    result = matcherComparator(fn);
    expect(result.pass).toBe(false);
    expect(result.message).toEqual("Expected function to throw an Error, but it threw 4.");
  });

  it("fails with the correct message if thrown is a falsy value", function() {
    var matcherComparator = j$.matchers.toThrowError(),
      fn = function() {
        throw undefined;
      },
      result;

    result = matcherComparator(fn);
    expect(result.pass).toBe(false);
    expect(result.message).toEqual("Expected function to throw an Error, but it threw undefined.");
  });

  it("passes if thrown is a type of Error, but there is no expected error", function() {
    var matcherComparator = j$.matchers.toThrowError(),
      fn = function() {
        throw new TypeError();
      },
      result;

    result = matcherComparator(fn);

    expect(result.pass).toBe(true);
    expect(result.message).toEqual("Expected function not to throw an Error, but it threw TypeError.");
  });

  it("passes if thrown is an Error and the expected is the same message", function() {
    var matcherComparator = j$.matchers.toThrowError(),
      fn = function() {
        throw new Error("foo");
      },
      result;

    result = matcherComparator(fn, "foo");

    expect(result.pass).toBe(true);
    expect(result.message).toEqual("Expected function not to throw an exception with message 'foo'.");
  });

  it("fails if thrown is an Error and the expected is not the same message", function() {
    var matcherComparator = j$.matchers.toThrowError(),
      fn = function() {
        throw new Error("foo");
      },
      result;

    result = matcherComparator(fn, "bar");

    expect(result.pass).toBe(false);
    expect(result.message).toEqual("Expected function to throw an exception with message 'bar', but it threw an exception with message 'foo'.");
  });

  it("passes if thrown is an Error and the expected is a RegExp that matches the message", function() {
    var matcherComparator = j$.matchers.toThrowError(),
      fn = function() {
        throw new Error("a long message");
      },
      result;

    result = matcherComparator(fn, /long/);

    expect(result.pass).toBe(true);
    expect(result.message).toEqual("Expected function not to throw an exception with a message matching /long/.");
  });

  it("fails if thrown is an Error and the expected is a RegExp that does not match the message", function() {
    var matcherComparator = j$.matchers.toThrowError(),
      fn = function() {
        throw new Error("a long message");
      },
      result;

    result = matcherComparator(fn, /foo/);

    expect(result.pass).toBe(false);
    expect(result.message).toEqual("Expected function to throw an exception with a message matching /foo/, but it threw an exception with message 'a long message'.");
  });

  it("passes if thrown is an Error and the expected the same Error", function() {
    var util = {
        equals: jasmine.createSpy('delegated-equal').and.returnValue(true)
      },
      matcherComparator = j$.matchers.toThrowError(util),
      fn = function() {
        throw new Error();
      },
      result;

    result = matcherComparator(fn, Error);

    expect(result.pass).toBe(true);
    expect(result.message).toEqual("Expected function not to throw Error.");
  });

  it("passes if thrown is a custom error that takes arguments and the expected is the same error", function() {
    var util = {
        equals: jasmine.createSpy('delegated-equal').and.returnValue(true)
      },
      matcherComparator = j$.matchers.toThrowError(util),
      CustomError = function CustomError(arg) { arg.x },
      fn = function() {
        throw new CustomError({ x: 1 });
      },
      result;

    CustomError.prototype = new Error();
    CustomError.prototype.constructor = CustomError;

    result = matcherComparator(fn, CustomError);

    expect(result.pass).toBe(true);
    expect(result.message).toEqual("Expected function not to throw CustomError.");
  });

  it("fails if thrown is an Error and the expected is a different Error", function() {
    var util = {
        equals: jasmine.createSpy('delegated-equal').and.returnValue(false)
      },
      matcherComparator = j$.matchers.toThrowError(util),
      fn = function() {
        throw new Error();
      },
      result;

    result = matcherComparator(fn, TypeError);

    expect(result.pass).toBe(false);
    expect(result.message).toEqual("Expected function to throw TypeError, but it threw Error.");
  });

  it("passes if thrown is a type of Error and it is equal to the expected Error and message", function() {
    var util = {
        equals: jasmine.createSpy('delegated-equal').and.returnValue(true)
      },
      matcherComparator = j$.matchers.toThrowError(util),
      fn = function() {
        throw new TypeError("foo");
      },
      result;

    result = matcherComparator(fn, TypeError, "foo");

    expect(result.pass).toBe(true);
    expect(result.message).toEqual("Expected function not to throw TypeError with message \"foo\".");
  });

  it("passes if thrown is a custom error that takes arguments and it is equal to the expected custom error and message", function() {
    var util = {
        equals: jasmine.createSpy('delegated-equal').and.returnValue(true)
      },
      matcherComparator = j$.matchers.toThrowError(util),
      CustomError = function CustomError(arg) { this.message = arg.message },
      fn = function() {
        throw new CustomError({message: "foo"});
      },
      result;

    CustomError.prototype = new Error();
    CustomError.prototype.constructor = CustomError;

    result = matcherComparator(fn, CustomError, "foo");

    expect(result.pass).toBe(true);
    expect(result.message).toEqual("Expected function not to throw CustomError with message \"foo\".");
  });

  it("fails if thrown is a type of Error and the expected is a different Error", function() {
    var util = {
        equals: jasmine.createSpy('delegated-equal').and.returnValue(false)
      },
      matcherComparator = j$.matchers.toThrowError(util),
      fn = function() {
        throw new TypeError("foo");
      },
      result;

    result = matcherComparator(fn, TypeError, "bar");

    expect(result.pass).toBe(false);
    expect(result.message).toEqual("Expected function to throw TypeError with message \"bar\", but it threw TypeError with message \"foo\".");
  });

  it("passes if thrown is a type of Error and has the same type as the expected Error and the message matches the exepcted message", function() {
    var util = {
        equals: jasmine.createSpy('delegated-equal').and.returnValue(true)
      },
      matcherComparator = j$.matchers.toThrowError(util),
      fn = function() {
        throw new TypeError("foo");
      },
      result;

    result = matcherComparator(fn, TypeError, /foo/);

    expect(result.pass).toBe(true);
    expect(result.message).toEqual("Expected function not to throw TypeError with message matching /foo/.");
  });

  it("fails if thrown is a type of Error and the expected is a different Error", function() {
    var util = {
        equals: jasmine.createSpy('delegated-equal').and.returnValue(false)
      },
      matcherComparator = j$.matchers.toThrowError(util),
      fn = function() {
        throw new TypeError("foo");
      },
      result;

    result = matcherComparator(fn, TypeError, /bar/);

    expect(result.pass).toBe(false);
    expect(result.message).toEqual("Expected function to throw TypeError with message matching /bar/, but it threw TypeError with message \"foo\".");
  });
});
