describe("Matchers", function() {
  describe("toBe", function() {
    it("passes when actual === expected", function() {
      var matcher = j$.matchers.toBe(),
        result;

      result = matcher.compare(1, 1);
      expect(result.pass).toBe(true);
    });

    it("fails when actual !== expected", function() {
      var matcher = j$.matchers.toBe(),
        result;

      result = matcher.compare(1, 2);
      expect(result.pass).toBe(false);
    });
  });

  describe("toBeCloseTo", function() {
    it("passes when within two decimal places by default", function() {
      var matcher = j$.matchers.toBeCloseTo(),
        result;

      result = matcher.compare(0, 0);
      expect(result.pass).toBe(true);

      result = matcher.compare(0, 0.001);
      expect(result.pass).toBe(true);
    });

    it("fails when not within two decimal places by default", function() {
      var matcher = j$.matchers.toBeCloseTo(),
        result;

      result = matcher.compare(0, 0.01);
      expect(result.pass).toBe(false);
    });

    it("accepts an optional precision argument", function() {
      var matcher = j$.matchers.toBeCloseTo(),
        result;

      result = matcher.compare(0, 0.1, 0);
      expect(result.pass).toBe(true);

      result = matcher.compare(0, 0.0001, 3);
      expect(result.pass).toBe(true);
    });

    it("rounds expected values", function() {
      var matcher = j$.matchers.toBeCloseTo(),
        result;

      result = matcher.compare(1.23, 1.229);
      expect(result.pass).toBe(true);

      result = matcher.compare(1.23, 1.226);
      expect(result.pass).toBe(true);

      result = matcher.compare(1.23, 1.225);
      expect(result.pass).toBe(true);

      result = matcher.compare(1.23, 1.2249999);
      expect(result.pass).toBe(false);

      result = matcher.compare(1.23, 1.234);
      expect(result.pass).toBe(true);
    });
  });

  describe("toBeDefined", function() {
    it("matches for defined values", function() {
      var matcher = j$.matchers.toBeDefined(),
        result;


      result = matcher.compare('foo');
      expect(result.pass).toBe(true);
    });

    it("fails when matching undefined values", function() {
      var matcher = j$.matchers.toBeDefined(),
        result;

      result = matcher.compare(void 0);
      expect(result.pass).toBe(false);
    })
  });

  describe("toBeFalsy", function() {
    it("passes for 'falsy' values", function() {
      var matcher = j$.matchers.toBeFalsy(),
        result;

      result = matcher.compare(false);
      expect(result.pass).toBe(true);

      result = matcher.compare(0);
      expect(result.pass).toBe(true);

      result = matcher.compare('');
      expect(result.pass).toBe(true);

      result = matcher.compare(null);
      expect(result.pass).toBe(true);

      result = matcher.compare(void 0);
      expect(result.pass).toBe(true);
    });

    it("fails for 'truthy' values", function() {
      var matcher = j$.matchers.toBeFalsy(),
        result;

      result = matcher.compare(true);
      expect(result.pass).toBe(false);

      result = matcher.compare(1);
      expect(result.pass).toBe(false);

      result = matcher.compare("foo");
      expect(result.pass).toBe(false);

      result = matcher.compare({});
      expect(result.pass).toBe(false);
    });
  });

  describe("toBeGreaterThan", function() {
    it("passes when actual > expected", function() {
      var matcher = j$.matchers.toBeGreaterThan(),
        result;

      result = matcher.compare(2, 1);
      expect(result.pass).toBe(true);
    });

    it("fails when actual <= expected", function() {
      var matcher = j$.matchers.toBeGreaterThan();

      result = matcher.compare(1, 1);
      expect(result.pass).toBe(false);

      result = matcher.compare(1, 2);
      expect(result.pass).toBe(false);
    });
  });

  describe("toBeLessThan", function() {
    it("passes when actual < expected", function() {
      var matcher = j$.matchers.toBeLessThan(),
        result;

      result = matcher.compare(1, 2);
      expect(result.pass).toBe(true);
    });

    it("fails when actual <= expected", function() {
      var matcher = j$.matchers.toBeLessThan(),
        result;

      result = matcher.compare(1, 1);
      expect(result.pass).toBe(false);

      result = matcher.compare(2, 1);
      expect(result.pass).toBe(false);
    });
  });

  describe("toBeNaN", function() {
    it("passes for NaN with a custom .not fail", function() {
      var matcher = j$.matchers.toBeNaN(),
        result;

      result = matcher.compare(Number.NaN);
      expect(result.pass).toBe(true);
      expect(result.message).toEqual("Expected actual not to be NaN.");
    });

    it("fails for anything not a NaN", function() {
      var matcher = j$.matchers.toBeNaN();

      result = matcher.compare(1);
      expect(result.pass).toBe(false);

      result = matcher.compare(null);
      expect(result.pass).toBe(false);

      result = matcher.compare(void 0);
      expect(result.pass).toBe(false);

      result = matcher.compare('');
      expect(result.pass).toBe(false);

      result = matcher.compare(Number.POSITIVE_INFINITY);
      expect(result.pass).toBe(false);
    });

    it("has a custom message on failure", function() {
      var matcher = j$.matchers.toBeNaN(),
        result = matcher.compare(0);

      expect(result.message).toEqual("Expected 0 to be NaN.");
    });
  });

  describe("toBeNull", function() {
    it("passes for null", function() {
      var matcher = j$.matchers.toBeNull(),
        result;

      result = matcher.compare(null);
      expect(result.pass).toBe(true);
    });

    it("fails for non-null", function() {
      var matcher = j$.matchers.toBeNull(),
        result;

      result = matcher.compare('foo');
      expect(result.pass).toBe(false);
    });
  });

  describe("toBeTruthy", function() {
    it("passes for 'truthy' values", function() {
      var matcher = j$.matchers.toBeTruthy(),
        result;

      result = matcher.compare(true);
      expect(result.pass).toBe(true);

      result = matcher.compare(1);
      expect(result.pass).toBe(true);

      result = matcher.compare("foo");
      expect(result.pass).toBe(true);

      result = matcher.compare({});
      expect(result.pass).toBe(true);
    });

    it("fails for 'falsy' values", function() {
      var matcher = j$.matchers.toBeTruthy(),
        result;

      result = matcher.compare(false);
      expect(result.pass).toBe(false);

      result = matcher.compare(0);
      expect(result.pass).toBe(false);

      result = matcher.compare('');
      expect(result.pass).toBe(false);

      result = matcher.compare(null);
      expect(result.pass).toBe(false);

      result = matcher.compare(void 0);
      expect(result.pass).toBe(false);
    });
  });

  describe("toBeUndefined", function() {
    it("passes for undefined values", function() {
      var matcher = j$.matchers.toBeUndefined(),
        result;

      result = matcher.compare(void 0);
      expect(result.pass).toBe(true);

    });

    it("fails when matching defined values", function() {
      var matcher = j$.matchers.toBeUndefined();

      result = matcher.compare('foo');
      expect(result.pass).toBe(false);
    })
  });

  describe("toContain", function() {
    it("delegates to j$.matchersUtil.contains", function() {
      var util = {
          contains: j$.createSpy('delegated-contains').andReturn(true)
        },
        matcher = j$.matchers.toContain(util);

      result = matcher.compare("ABC", "B");
      expect(util.contains).toHaveBeenCalledWith("ABC", "B", []);
      expect(result.pass).toBe(true);
    });

    it("delegates to j$.matchersUtil.contains, passing in equality testers if present", function() {
      var util = {
          contains: j$.createSpy('delegated-contains').andReturn(true)
        },
        customEqualityTesters = ['a', 'b'],
        matcher = j$.matchers.toContain(util, customEqualityTesters);

      result = matcher.compare("ABC", "B");
      expect(util.contains).toHaveBeenCalledWith("ABC", "B", ['a', 'b']);
      expect(result.pass).toBe(true);
    });
  });

  describe("toEqual", function() {
    it("delegates to equals function", function() {
      var util = {
          equals: j$.createSpy('delegated-equals').andReturn(true)
        },
        matcher = j$.matchers.toEqual(util),
        result;

      result = matcher.compare(1, 1);

      expect(util.equals).toHaveBeenCalledWith(1, 1, []);
      expect(result.pass).toBe(true);
    });

    it("delegates custom equality testers, if present", function() {
      var util = {
          equals: j$.createSpy('delegated-equals').andReturn(true)
        },
        customEqualityTesters = ['a', 'b'],
        matcher = j$.matchers.toEqual(util, customEqualityTesters),
        result;

      result = matcher.compare(1, 1);

      expect(util.equals).toHaveBeenCalledWith(1, 1, ['a', 'b']);
      expect(result.pass).toBe(true);
    });
  });

  describe("toHaveBeenCalled", function() {
    it("passes when the actual was called, with a custom .not fail message", function() {
      var matcher = j$.matchers.toHaveBeenCalled(),
        calledSpy = j$.createSpy('called-spy'),
        result;

      calledSpy();

      result = matcher.compare(calledSpy);
      expect(result.pass).toBe(true);
      expect(result.message).toEqual("Expected spy called-spy not to have been called.");
    });

    it("fails when the actual was not called", function() {
      var matcher = j$.matchers.toHaveBeenCalled(),
        uncalledSpy = j$.createSpy('uncalled spy');

      result = matcher.compare(uncalledSpy);
      expect(result.pass).toBe(false);
    });

    it("throws an exception when the actual is not a spy", function() {
      var matcher = j$.matchers.toHaveBeenCalled(),
        fn = function() {};

      expect(function() { matcher.compare(fn) }).toThrow(new Error("Expected a spy, but got Function."));
    });

    it("throws an exception when invoked with any arguments", function() {
      var matcher = j$.matchers.toHaveBeenCalled(),
        spy = j$.createSpy('sample spy');

      expect(function() { matcher.compare(spy, 'foo') }).toThrow(new Error("toHaveBeenCalled does not take arguments, use toHaveBeenCalledWith"));
    });

    it("has a custom message on failure", function() {
      var matcher = j$.matchers.toHaveBeenCalled(),
        spy = j$.createSpy('sample-spy'),
        result;

      result = matcher.compare(spy);

      expect(result.message).toEqual("Expected spy sample-spy to have been called.");
    });
  });

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

  describe("toMatch", function() {
    it("passes when RegExps are equivalent", function() {
      var matcher = j$.matchers.toMatch(),
        result;

      result = matcher.compare(/foo/, /foo/);
      expect(result.pass).toBe(true);
    });

    it("fails when RegExps are not equivalent", function() {
      var matcher = j$.matchers.toMatch(),
        result;

      result = matcher.compare(/bar/, /foo/);
      expect(result.pass).toBe(false);
    });

    it("passes when the actual matches the expected string as a pattern", function() {
      var matcher = j$.matchers.toMatch(),
        result;

      result = matcher.compare('foosball', 'foo');
      expect(result.pass).toBe(true);
    });

    it("fails when the actual matches the expected string as a pattern", function() {
      var matcher = j$.matchers.toMatch(),
        result;

      result = matcher.compare('bar', 'foo');
      expect(result.pass).toBe(false);
    });
  });

  describe("toThrow", function() {
    it("throws an error when the actual is not a function", function() {
      var matcher = j$.matchers.toThrow();

      expect(function() {
        matcher.compare({});
      }).toThrow(new Error("Actual is not a Function")); // TODO: this needs to change for self-test
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
          equals: j$.createSpy('delegated-equal').andReturn(true)
        },
        matcher = j$.matchers.toThrow(util),
        fn = function() {
          throw 5;
        },
        result;

      result = matcher.compare(fn);

      expect(result.pass).toBe(true);
      expect(result.message).toEqual("Expected function not to throw.");
    });

    it("passes even if what is thrown is falsy", function() {
      var matcher = j$.matchers.toThrow(),
        fn = function() {
          throw undefined;
        },
        result;

      result = matcher.compare(fn);
      expect(result.pass).toBe(true);
      expect(result.message).toEqual("Expected function not to throw.");
    });

    it("passes if what is thrown is equivalent to what is expected", function() {
      var util = {
          equals: j$.createSpy('delegated-equal').andReturn(true)
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
          equals: j$.createSpy('delegated-equal').andReturn(false)
        },
        matcher = j$.matchers.toThrow(util),
        fn = function() {
          throw 5;
        },
        result;

      result = matcher.compare(fn, "foo");

      expect(result.pass).toBe(false);
      expect(result.message).toEqual("Expected function to throw 'foo'.");
    });

    it("fails if what is thrown is not equivalent to undefined", function() {
      var util = {
          equals: j$.createSpy('delegated-equal').andReturn(false)
        },
        matcher = j$.matchers.toThrow(util),
        fn = function() {
          throw 5;
        },
        result;

      result = matcher.compare(fn, void 0);

      expect(result.pass).toBe(false);
      expect(result.message).toEqual("Expected function to throw undefined.");
    });
  });

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
});
