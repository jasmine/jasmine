describe("jasmine.Matchers", function() {
  var env, spec;

  beforeEach(function() {
    env = new jasmine.Env();
    env.updateInterval = 0;

    var suite = env.describe("suite", function() {
      spec = env.it("spec", function() {
      });
    });
    spyOn(spec, 'addMatcherResult');

    this.addMatchers({
      toPass: function() {
        return lastResult().passed();
      },
      toFail: function() {
        return !lastResult().passed();
      }
    });
  });

  function match(value) {
    return spec.expect(value);
  }

  function lastResult() {
    return spec.addMatcherResult.mostRecentCall.args[0];
  }

  function catchException(fn) {
    try {
      fn.call();
    } catch (e) {
      return e;
    }
    throw new Error("expected function to throw an exception");
  }

  it("toEqual with primitives, objects, dates, etc.", function() {
    expect(match(true).toEqual(true)).toPass();

    expect(match({foo:'bar'}).toEqual(null)).toFail();

    var functionA = function() {
      return 'hi';
    };
    var functionB = function() {
      return 'hi';
    };
    expect(match({foo:functionA}).toEqual({foo:functionB})).toFail();
    expect(match({foo:functionA}).toEqual({foo:functionA})).toPass();

    expect((match(false).toEqual(true))).toFail();

    var circularGraph = {};
    circularGraph.referenceToSelf = circularGraph;
    expect((match(circularGraph).toEqual(circularGraph))).toPass();

    expect((match(new Date(2008, 1, 3, 15, 17, 19, 1234)).toEqual(new Date(2009, 1, 3, 15, 17, 19, 1234)))).toFail();
    expect((match(new Date(2008, 1, 3, 15, 17, 19, 1234)).toEqual(new Date(2008, 1, 3, 15, 17, 19, 1234)))).toPass();


    expect(match(true).toNotEqual(false)).toPass();
    expect((match(true).toNotEqual(true))).toFail();

    expect((match(['a', 'b']).toEqual(['a', jasmine.undefined]))).toFail();
    expect((match(['a', 'b']).toEqual(['a', 'b', jasmine.undefined]))).toFail();

    expect((match("cat").toEqual("cat"))).toPass();
    expect((match("cat").toNotEqual("cat"))).toFail();

    expect((match(5).toEqual(5))).toPass();
    expect((match(parseInt('5', 10)).toEqual(5))).toPass();
    expect((match(5).toNotEqual(5))).toFail();
    expect((match(parseInt('5', 10)).toNotEqual(5))).toFail();
  });

  it("toEqual to build an Expectation Result", function() {
    var actual = 'a';
    var matcher = match(actual);
    var expected = 'b';
    matcher.toEqual(expected);

    var result = lastResult();

    expect(result.matcherName).toEqual("toEqual");
    expect(result.passed()).toFail();
    expect(result.message).toMatch(jasmine.pp(actual));
    expect(result.message).toMatch(jasmine.pp(expected));
    expect(result.expected).toEqual(expected);
    expect(result.actual).toEqual(actual);
  });

  it("toNotEqual to build an Expectation Result", function() {
    var str = 'a';
    var matcher = match(str);
    matcher.toNotEqual(str);

    var result = lastResult();

    expect(result.matcherName).toEqual("toNotEqual");
    expect(result.passed()).toFail();
    expect(result.message).toMatch(jasmine.pp(str));
    expect(result.message).toMatch('not');
    expect(result.expected).toEqual(str);
    expect(result.actual).toEqual(str);
  });

  it('toBe should return true only if the expected and actual items === each other', function() {
    var a = {};
    var b = {};
    //noinspection UnnecessaryLocalVariableJS
    var c = a;
    expect((match(a).toBe(b))).toFail();
    expect((match(a).toBe(a))).toPass();
    expect((match(a).toBe(c))).toPass();
    expect((match(a).toNotBe(b))).toPass();
    expect((match(a).toNotBe(a))).toFail();
    expect((match(a).toNotBe(c))).toFail();
  });

  it("toBe to build an ExpectationResult", function() {
    var expected = 'b';
    var actual = 'a';
    var matcher = match(actual);
    matcher.toBe(expected);

    var result = lastResult();

    expect(result.matcherName).toEqual("toBe");
    expect(result.passed()).toFail();
    expect(result.message).toMatch(jasmine.pp(actual));
    expect(result.message).toMatch(jasmine.pp(expected));
    expect(result.expected).toEqual(expected);
    expect(result.actual).toEqual(actual);
  });

  it("toNotBe to build an ExpectationResult", function() {
    var str = 'a';
    var matcher = match(str);
    matcher.toNotBe(str);

    var result = lastResult();

    expect(result.matcherName).toEqual("toNotBe");
    expect(result.passed()).toFail();
    expect(result.message).toMatch(str);
    expect(result.expected).toEqual(str);
    expect(result.actual).toEqual(str);
  });

  it("toMatch and #toNotMatch should perform regular expression matching on strings", function() {
    expect((match('foobarbel').toMatch(/bar/))).toPass();
    expect((match('foobazbel').toMatch(/bar/))).toFail();

    expect((match('foobarbel').toMatch("bar"))).toPass();
    expect((match('foobazbel').toMatch("bar"))).toFail();

    expect((match('foobarbel').toNotMatch(/bar/))).toFail();
    expect((match('foobazbel').toNotMatch(/bar/))).toPass();

    expect((match('foobarbel').toNotMatch("bar"))).toFail();
    expect((match('foobazbel').toNotMatch("bar"))).toPass();
  });

  it("toMatch w/ RegExp to build an ExpectationResult", function() {
    var actual = 'a';
    var matcher = match(actual);
    var expected = /b/;
    matcher.toMatch(expected);

    var result = lastResult();

    expect(result.matcherName).toEqual("toMatch");
    expect(result.passed()).toFail();
    expect(result.message).toMatch(jasmine.pp(actual));
    expect(result.message).toMatch(expected.toString());
    expect(result.expected).toEqual(expected);
    expect(result.actual).toEqual(actual);
  });

  it("toMatch w/ String to build an ExpectationResult", function() {
    var actual = 'a';
    var matcher = match(actual);
    var expected = 'b';
    matcher.toMatch(expected);

    var result = lastResult();

    expect(result.matcherName).toEqual("toMatch");
    expect(result.passed()).toFail();
    expect(result.message).toEqual("Expected 'a' to match 'b'.");
    expect(result.expected).toEqual(expected);
    expect(result.actual).toEqual(actual);
  });

  it("toNotMatch w/ RegExp to build an ExpectationResult", function() {
    var actual = 'a';
    var matcher = match(actual);
    var expected = /a/;
    matcher.toNotMatch(expected);

    var result = lastResult();

    expect(result.matcherName).toEqual("toNotMatch");
    expect(result.passed()).toFail();
    expect(result.message).toEqual("Expected 'a' to not match /a/.");
    expect(result.expected).toEqual(expected);
    expect(result.actual).toEqual(actual);
  });

  it("toNotMatch w/ String to build an ExpectationResult", function() {
    var str = 'a';
    var matcher = match(str);
    matcher.toNotMatch(str);

    var result = lastResult();

    expect(result.matcherName).toEqual("toNotMatch");
    expect(result.passed()).toFail();
    expect(result.message).toEqual("Expected 'a' to not match 'a'.");
    expect(result.expected).toEqual(str);
    expect(result.actual).toEqual(str);
  });

  it("toBeDefined", function() {
    expect(match('foo').toBeDefined()).toPass();
    expect(match(jasmine.undefined).toBeDefined()).toFail();
  });

  it("toBeDefined to build an ExpectationResult", function() {
    var matcher = match(jasmine.undefined);
    matcher.toBeDefined();

    var result = lastResult();

    expect(result.matcherName).toEqual("toBeDefined");
    expect(result.passed()).toFail();
    expect(result.message).toEqual('Expected undefined to be defined.');
    expect(result.actual).toEqual(jasmine.undefined);
  });

  it("toBeUndefined", function() {
    expect(match('foo').toBeUndefined()).toFail();
    expect(match(jasmine.undefined).toBeUndefined()).toPass();
  });

  it("toBeNull", function() {
    expect(match(null).toBeNull()).toPass();
    expect(match(jasmine.undefined).toBeNull()).toFail();
    expect(match("foo").toBeNull()).toFail();
  });

  it("toBeNull w/ String to build an ExpectationResult", function() {
    var actual = 'a';
    var matcher = match(actual);
    matcher.toBeNull();

    var result = lastResult();

    expect(result.matcherName).toEqual("toBeNull");
    expect(result.passed()).toFail();
    expect(result.message).toMatch(jasmine.pp(actual));
    expect(result.message).toMatch('null');
    expect(result.actual).toEqual(actual);
  });

  it("toBeNull w/ Object to build an ExpectationResult", function() {
    var actual = {a: 'b'};
    var matcher = match(actual);
    matcher.toBeNull();

    var result = lastResult();

    expect(result.matcherName).toEqual("toBeNull");
    expect(result.passed()).toFail();
    expect(result.message).toMatch(jasmine.pp(actual));
    expect(result.message).toMatch('null');
    expect(result.actual).toEqual(actual);
  });

  it("toBeFalsy", function() {
    expect(match(false).toBeFalsy()).toPass();
    expect(match(true).toBeFalsy()).toFail();
    expect(match(jasmine.undefined).toBeFalsy()).toPass();
    expect(match(0).toBeFalsy()).toPass();
    expect(match("").toBeFalsy()).toPass();
  });

  it("toBeFalsy to build an ExpectationResult", function() {
    var actual = 'a';
    var matcher = match(actual);
    matcher.toBeFalsy();

    var result = lastResult();

    expect(result.matcherName).toEqual("toBeFalsy");
    expect(result.passed()).toFail();
    expect(result.message).toMatch(jasmine.pp(actual));
    expect(result.message).toMatch('falsy');
    expect(result.actual).toEqual(actual);
  });

  it("toBeTruthy", function() {
    expect(match(false).toBeTruthy()).toFail();
    expect(match(true).toBeTruthy()).toPass();
    expect(match(jasmine.undefined).toBeTruthy()).toFail();
    expect(match(0).toBeTruthy()).toFail();
    expect(match("").toBeTruthy()).toFail();
    expect(match("hi").toBeTruthy()).toPass();
    expect(match(5).toBeTruthy()).toPass();
    expect(match({foo: 1}).toBeTruthy()).toPass();
  });

  it("toBeTruthy to build an ExpectationResult", function() {
    var matcher = match(false);
    matcher.toBeTruthy();

    var result = lastResult();

    expect(result.matcherName).toEqual("toBeTruthy");
    expect(result.passed()).toFail();
    expect(result.message).toEqual("Expected false to be truthy.");
    expect(result.actual).toFail();
  });

  it("toEqual", function() {
    expect(match(jasmine.undefined).toEqual(jasmine.undefined)).toPass();
    expect(match({foo:'bar'}).toEqual({foo:'bar'})).toPass();
    expect(match("foo").toEqual({bar: jasmine.undefined})).toFail();
    expect(match({foo: jasmine.undefined}).toEqual("goo")).toFail();
    expect(match({foo: {bar :jasmine.undefined}}).toEqual("goo")).toFail();
  });

  it("toEqual with jasmine.any()", function() {
    expect(match("foo").toEqual(jasmine.any(String))).toPass();
    expect(match(3).toEqual(jasmine.any(Number))).toPass();
    expect(match("foo").toEqual(jasmine.any(Function))).toFail();
    expect(match("foo").toEqual(jasmine.any(Object))).toFail();
    expect(match({someObj:'foo'}).toEqual(jasmine.any(Object))).toPass();
    expect(match({someObj:'foo'}).toEqual(jasmine.any(Function))).toFail();
    expect(match(
      function() {
      }).toEqual(jasmine.any(Object))).toFail();
    expect(match(["foo", "goo"]).toEqual(["foo", jasmine.any(String)])).toPass();
    expect(match(
      function() {
      }).toEqual(jasmine.any(Function))).toPass();
    expect(match(["a", function() {
    }]).toEqual(["a", jasmine.any(Function)])).toPass();
  });

  it("toEqual handles circular objects ok", function() {
    expect(match({foo: "bar", baz: jasmine.undefined}).toEqual({foo: "bar", baz: jasmine.undefined})).toPass();
    expect(match({foo:['bar','baz','quux']}).toEqual({foo:['bar','baz','quux']})).toPass();
    expect(match({foo: {bar:'baz'}, quux:'corge'}).toEqual({foo:{bar:'baz'}, quux:'corge'})).toPass();

    var circularObject = {};
    var secondCircularObject = {};
    circularObject.field = circularObject;
    secondCircularObject.field = secondCircularObject;
    expect(match(circularObject).toEqual(secondCircularObject)).toPass();
  });

  it("toNotEqual as slightly surprising behavior, but is it intentional?", function() {
    expect(match({x:"x", y:"y", z:"w"}).toNotEqual({x:"x", y:"y", z:"z"})).toPass();
    expect(match({x:"x", y:"y", w:"z"}).toNotEqual({x:"x", y:"y", z:"z"})).toPass();
    expect(match({x:"x", y:"y", z:"z"}).toNotEqual({w: "w", x:"x", y:"y", z:"z"})).toPass();
    expect(match({w: "w", x:"x", y:"y", z:"z"}).toNotEqual({x:"x", y:"y", z:"z"})).toPass();
  });

  it("toEqual handles arrays", function() {
    expect(match([1, "A"]).toEqual([1, "A"])).toPass();
  });

  it("toContain and toNotContain", function() {
    expect(match('ABC').toContain('A')).toPass();
    expect(match('ABC').toContain('X')).toFail();

    expect(match(['A', 'B', 'C']).toContain('A')).toPass();
    expect(match(['A', 'B', 'C']).toContain('F')).toFail();
    expect(match(['A', 'B', 'C']).toNotContain('F')).toPass();
    expect(match(['A', 'B', 'C']).toNotContain('A')).toFail();

    expect(match(['A', {some:'object'}, 'C']).toContain({some:'object'})).toPass();
    expect(match(['A', {some:'object'}, 'C']).toContain({some:'other object'})).toFail();
  });

  it("toContain to build an ExpectationResult", function() {
    var actual = ['a','b','c'];
    var matcher = match(actual);
    var expected = 'x';
    matcher.toContain(expected);

    var result = lastResult();

    expect(result.matcherName).toEqual("toContain");
    expect(result.passed()).toFail();
    expect(result.message).toMatch(jasmine.pp(actual));
    expect(result.message).toMatch('contain');
    expect(result.message).toMatch(jasmine.pp(expected));
    expect(result.actual).toEqual(actual);
    expect(result.expected).toEqual(expected);
  });

  it("toNotContain to build an ExpectationResult", function() {
    var actual = ['a','b','c'];
    var matcher = match(actual);
    var expected = 'b';
    matcher.toNotContain(expected);

    var result = lastResult();

    expect(result.matcherName).toEqual("toNotContain");
    expect(result.passed()).toFail();
    expect(result.message).toMatch(jasmine.pp(actual));
    expect(result.message).toMatch('not contain');
    expect(result.message).toMatch(jasmine.pp(expected));
    expect(result.actual).toEqual(actual);
    expect(result.expected).toEqual(expected);
  });

  it("toBeLessThan should pass if actual is less than expected", function() {
    expect(match(37).toBeLessThan(42)).toPass();
    expect(match(37).toBeLessThan(-42)).toFail();
    expect(match(37).toBeLessThan(37)).toFail();
  });

  it("toBeLessThan to build an ExpectationResult", function() {
    var actual = 3;
    var matcher = match(actual);
    var expected = 1;
    matcher.toBeLessThan(expected);

    var result = lastResult();

    expect(result.matcherName).toEqual("toBeLessThan");
    expect(result.passed()).toFail();
    expect(result.message).toMatch(jasmine.pp(actual) + ' to be less than');
    expect(result.message).toMatch(jasmine.pp(expected));
    expect(result.actual).toEqual(actual);
    expect(result.expected).toEqual(expected);
  });

  it("toBeGreaterThan should pass if actual is greater than expected", function() {
    expect(match(37).toBeGreaterThan(42)).toFail();
    expect(match(37).toBeGreaterThan(-42)).toPass();
    expect(match(37).toBeGreaterThan(37)).toFail();
  });

  it("toBeGreaterThan to build an ExpectationResult", function() {
    var actual = 1;
    var matcher = match(actual);
    var expected = 3;
    matcher.toBeGreaterThan(expected);

    var result = lastResult();

    expect(result.matcherName).toEqual("toBeGreaterThan");
    expect(result.passed()).toFail();
    expect(result.message).toMatch(jasmine.pp(actual) + ' to be greater than');
    expect(result.message).toMatch(jasmine.pp(expected));
    expect(result.actual).toEqual(actual);
    expect(result.expected).toEqual(expected);
  });

  describe("toBeCloseTo", function() {
    it("returns 'true' iff actual and expected are equal within 2 decimal points of precision", function() {
      expect(0).toBeCloseTo(0);
      expect(1).toBeCloseTo(1);
      expect(1).not.toBeCloseTo(1.1);
      expect(1).not.toBeCloseTo(1.01);
      expect(1).toBeCloseTo(1.001);

      expect(1.23).toBeCloseTo(1.234);
      expect(1.23).toBeCloseTo(1.233);
      expect(1.23).toBeCloseTo(1.232);
      expect(1.23).not.toBeCloseTo(1.24);

      expect(-1.23).toBeCloseTo(-1.234);
      expect(-1.23).not.toBeCloseTo(-1.24);
    });

    it("accepts an optional precision argument", function() {
      expect(1).toBeCloseTo(1.1, 0);
      expect(1.2).toBeCloseTo(1.23, 1);

      expect(1.234).toBeCloseTo(1.2343, 3);
      expect(1.234).not.toBeCloseTo(1.233, 3);
    });

    it("rounds", function() {
      expect(1.23).toBeCloseTo(1.229);
      expect(1.23).toBeCloseTo(1.226);
      expect(1.23).toBeCloseTo(1.225);
      expect(1.23).not.toBeCloseTo(1.2249999);

      expect(1.23).toBeCloseTo(1.234);
      expect(1.23).toBeCloseTo(1.2349999);
      expect(1.23).not.toBeCloseTo(1.235);

      expect(-1.23).toBeCloseTo(-1.234);
      expect(-1.23).not.toBeCloseTo(-1.235);
      expect(-1.23).not.toBeCloseTo(-1.236);
    });
  });

  describe("toThrow", function() {
    describe("when code block throws an exception", function() {
      var throwingFn;

      beforeEach(function() {
        throwingFn = function() {
          throw new Error("Fake Error");
        };
      });

      it("should match any exception", function() {
        expect(match(throwingFn).toThrow()).toPass();
      });

      it("should match exceptions specified by message", function() {
        expect(match(throwingFn).toThrow("Fake Error")).toPass();
        expect(match(throwingFn).toThrow("Other Error")).toFail();
        expect(lastResult().message).toMatch("Other Error");
      });

      it("should match exceptions specified by Error", function() {
        expect(match(throwingFn).toThrow(new Error("Fake Error"))).toPass();
        expect(match(throwingFn).toThrow(new Error("Other Error"))).toFail();
        expect(lastResult().message).toMatch("Other Error");
      });

      describe("and matcher is inverted with .not", function() {
        it("should match any exception", function() {
          expect(match(throwingFn).not.toThrow()).toFail();
          expect(lastResult().message).toMatch(/Expected function not to throw an exception/);
        });

        it("should match exceptions specified by message", function() {
          expect(match(throwingFn).not.toThrow("Fake Error")).toFail();
//          expect(lastResult().message).toMatch(/Expected function not to throw Fake Error./);
          expect(match(throwingFn).not.toThrow("Other Error")).toPass();
        });

        it("should match exceptions specified by Error", function() {
          expect(match(throwingFn).not.toThrow(new Error("Fake Error"))).toFail();
//          expect(lastResult().message).toMatch("Other Error");
          expect(match(throwingFn).not.toThrow(new Error("Other Error"))).toPass();
        });
      });
    });

    describe("when actual is not a function", function() {
      it("should fail with an exception", function() {
        var exception = catchException(function() {
          match('not-a-function').toThrow();
        });
        expect(exception).toBeDefined();
        expect(exception.message).toEqual('Actual is not a function');
      });

      describe("and matcher is inverted with .not", function() {
        it("should fail with an exception", function() {
          var exception = catchException(function() {
            match('not-a-function').not.toThrow();
          });
          expect(exception).toBeDefined();
          expect(exception.message).toEqual('Actual is not a function');
        });
      });
    });


    describe("when code block does not throw an exception", function() {
      it("should fail (or pass when inverted with .not)", function() {
        expect(match(
          function() {
          }).toThrow()).toFail();
        expect(lastResult().message).toEqual('Expected function to throw an exception.');
      });
    });
  });

  describe(".not.matcher", function() {
    it("should invert the sense of any matcher", function() {
      expect(match(37).not.toBeGreaterThan(42)).toPass();
      expect(match(42).not.toBeGreaterThan(37)).toFail();
      expect(match("abc").not.toEqual("def")).toPass();
      expect(match("abc").not.toEqual("abc")).toFail();
    });

    it("should provide an inverted default message", function() {
      match(37).not.toBeGreaterThan(42);
      expect(lastResult().message).toEqual("Passed.");

      match(42).not.toBeGreaterThan(37);
      expect(lastResult().message).toEqual("Expected 42 not to be greater than 37.");
    });

    it("should use the second message when the matcher sets an array of custom messages", function() {
      spec.addMatchers({
        custom: function() {
          this.message = function() {
            return ['Expected it was called.', 'Expected it wasn\'t called.'];
          };
          return this.actual;
        }
      });

      match(true).custom();
      expect(lastResult().message).toEqual("Passed.");
      match(false).custom();
      expect(lastResult().message).toEqual("Expected it was called.");
      match(true).not.custom();
      expect(lastResult().message).toEqual("Expected it wasn't called.");
      match(false).not.custom();
      expect(lastResult().message).toEqual("Passed.");
    });
  });

  describe("spy matchers >>", function() {
    var TestClass;
    beforeEach(function() {
      TestClass = {
        normalFunction: function() {
        },
        spyFunction: jasmine.createSpy("My spy")
      };
    });

    function shouldThrowAnExceptionWhenInvokedOnANonSpy(methodName) {
      return function() {
        expect(
          function() {
            match(TestClass.normalFunction)[methodName]();
          }).toThrow('Expected a spy, but got Function.');

        expect(
          function() {
            match(jasmine.undefined)[methodName]();
          }).toThrow('Expected a spy, but got undefined.');

        expect(
          function() {
            match({some:'object'})[methodName]();
          }).toThrow('Expected a spy, but got { some : \'object\' }.');

        expect(
          function() {
            match("<b>")[methodName]();
          }).toThrow('Expected a spy, but got \'<b>\'.');
      };
    }

    describe("toHaveBeenCalled", function() {
      it("should pass if the spy was called", function() {
        expect(match(TestClass.spyFunction).toHaveBeenCalled()).toFail();

        TestClass.spyFunction();
        expect(match(TestClass.spyFunction).toHaveBeenCalled()).toPass();
      });

      it("should throw an exception when invoked with any arguments", function() {
        expect(
          function() {
            match(TestClass.normalFunction).toHaveBeenCalled("unwanted argument");
          }).toThrow('toHaveBeenCalled does not take arguments, use toHaveBeenCalledWith');
      });

      it('should throw an exception when invoked on a non-spy', shouldThrowAnExceptionWhenInvokedOnANonSpy('toHaveBeenCalled'));
    });

    describe("wasCalled", function() {
      it("should alias toHaveBeenCalled", function() {
        spyOn(TestClass, 'normalFunction');

        TestClass.normalFunction();

        expect(TestClass.normalFunction).wasCalled();
      });
    });


    describe("wasNotCalled", function() {
      it("should pass iff the spy was not called", function() {
        expect(match(TestClass.spyFunction).wasNotCalled()).toPass();

        TestClass.spyFunction();
        expect(match(TestClass.spyFunction).wasNotCalled()).toFail();
      });

      it("should throw an exception when invoked with any arguments", function() {
        expect(
          function() {
            match(TestClass.normalFunction).wasNotCalled("unwanted argument");
          }).toThrow('wasNotCalled does not take arguments');
      });

      it('should throw an exception when invoked on a non-spy', shouldThrowAnExceptionWhenInvokedOnANonSpy('wasNotCalled'));
    });

    describe("toHaveBeenCalledWith", function() {
      it('toHaveBeenCalledWith should return true if it was called with the expected args', function() {
        TestClass.spyFunction('a', 'b', 'c');
        expect(match(TestClass.spyFunction).toHaveBeenCalledWith('a', 'b', 'c')).toPass();
      });

      it('should return false if it was not called with the expected args', function() {
        TestClass.spyFunction('a', 'b', 'c');
        var expected = match(TestClass.spyFunction);
        expect(expected.toHaveBeenCalledWith('c', 'b', 'a')).toFail();
        var result = lastResult();
        expect(result.passed()).toFail();
        expect(result.expected).toEqual(['c', 'b', 'a']);
        expect(result.actual.mostRecentCall.args).toEqual(['a', 'b', 'c']);
        expect(result.message).toContain(jasmine.pp(result.expected));
        expect(result.message).toContain(jasmine.pp(result.actual.mostRecentCall.args));
      });

      it('should return false if it was not called', function() {
        var expected = match(TestClass.spyFunction);
        expect(expected.toHaveBeenCalledWith('c', 'b', 'a')).toFail();
        var result = lastResult();
        expect(result.passed()).toFail();
        expect(result.expected).toEqual(['c', 'b', 'a']);
        expect(result.actual.argsForCall).toEqual([]);
        expect(result.message).toContain(jasmine.pp(result.expected));
      });

      it('should allow matches across multiple calls', function() {
        TestClass.spyFunction('a', 'b', 'c');
        TestClass.spyFunction('d', 'e', 'f');
        var expected = match(TestClass.spyFunction);
        expect(expected.toHaveBeenCalledWith('a', 'b', 'c')).toPass();
        expect(expected.toHaveBeenCalledWith('d', 'e', 'f')).toPass();
        expect(expected.toHaveBeenCalledWith('x', 'y', 'z')).toFail();
      });

      it("should return a decent message", function() {
        TestClass.spyFunction('a', 'b', 'c');
        TestClass.spyFunction('d', 'e', 'f');
        var expected = match(TestClass.spyFunction);
        expect(expected.toHaveBeenCalledWith('a', 'b')).toFail();
        expect(lastResult().message).toEqual("Expected spy My spy to have been called with [ 'a', 'b' ] but was called with [ [ 'a', 'b', 'c' ], [ 'd', 'e', 'f' ] ]");
      });

      it("should return a decent message when inverted", function() {
        TestClass.spyFunction('a', 'b', 'c');
        TestClass.spyFunction('d', 'e', 'f');
        var expected = match(TestClass.spyFunction);
        expect(expected.not.toHaveBeenCalledWith('a', 'b', 'c')).toFail();
        expect(lastResult().message).toEqual("Expected spy My spy not to have been called with [ 'a', 'b', 'c' ] but was called with [ [ 'a', 'b', 'c' ], [ 'd', 'e', 'f' ] ]");
      });

      it('should throw an exception when invoked on a non-spy', shouldThrowAnExceptionWhenInvokedOnANonSpy('toHaveBeenCalledWith'));

      describe("to build an ExpectationResult", function () {
        beforeEach(function() {
          var currentSuite;
          var spec;
          currentSuite = env.describe('default current suite', function() {
            spec = env.it();
          }, spec);
          TestClass = { someFunction: function(a, b) {
          } };
          spec.spyOn(TestClass, 'someFunction');
        });

        it("should should handle the case of a spy", function() {
          TestClass.someFunction('a', 'c');
          var matcher = match(TestClass.someFunction);
          matcher.toHaveBeenCalledWith('a', 'b');

          var result = lastResult();
          expect(result.matcherName).toEqual("toHaveBeenCalledWith");
          expect(result.passed()).toFail();
          expect(result.message).toContain(jasmine.pp(['a', 'b']));
          expect(result.message).toContain(jasmine.pp(['a', 'c']));
          expect(result.actual).toEqual(TestClass.someFunction);
          expect(result.expected).toEqual(['a','b']);
        });
      });
    });

    describe("wasCalledWith", function() {
      it("should alias toHaveBeenCalledWith", function() {
        spyOn(TestClass, 'normalFunction');

        TestClass.normalFunction(123);

        expect(TestClass.normalFunction).wasCalledWith(123);
      });
    });

    describe("wasNotCalledWith", function() {
      it('should return true if the spy was NOT called with the expected args', function() {
        TestClass.spyFunction('a', 'b', 'c');
        expect(match(TestClass.spyFunction).wasNotCalledWith('c', 'b', 'a')).toPass();
      });

      it('should return false if it WAS called with the expected args', function() {
        TestClass.spyFunction('a', 'b', 'c');
        var expected = match(TestClass.spyFunction);
        expect(expected.wasNotCalledWith('a', 'b', 'c')).toFail();
        var result = lastResult();
        expect(result.passed()).toFail();
        expect(result.expected).toEqual(['a', 'b', 'c']);
        expect(result.actual.mostRecentCall.args).toEqual(['a', 'b', 'c']);
        expect(result.message).toContain(jasmine.pp(result.expected));
      });

      it('should return true if it was not called', function() {
        var expected = match(TestClass.spyFunction);
        expect(expected.wasNotCalledWith('c', 'b', 'a')).toPass();
      });

      it('should allow matches across multiple calls', function() {
        var expected = match(TestClass.spyFunction);
        TestClass.spyFunction('a', 'b', 'c');
        TestClass.spyFunction('d', 'e', 'f');
        expect(expected.wasNotCalledWith('a', 'b', 'c')).toFail();
        expect(expected.wasNotCalledWith('d', 'e', 'f')).toFail();
        expect(expected.wasNotCalledWith('x', 'y', 'z')).toPass();
      });

      it('should throw an exception when invoked on a non-spy', shouldThrowAnExceptionWhenInvokedOnANonSpy('wasNotCalledWith'));
    });
  });

  describe("all matchers", function() {
    it("should return null, for future-proofing, since we might eventually allow matcher chaining", function() {
      expect(match(true).toBe(true)).toBeUndefined();
    });
  });
});
