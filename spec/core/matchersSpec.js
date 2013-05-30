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
});