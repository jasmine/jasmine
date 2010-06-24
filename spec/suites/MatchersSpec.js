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
  });

  function match(value) {
    return spec.expect(value);
  }

  function lastResult() {
    return spec.addMatcherResult.mostRecentCall.args[0];
  }

  it("toEqual with primitives, objects, dates, etc.", function() {
    expect(match(true).toEqual(true)).toEqual(true);

    expect(match({foo:'bar'}).toEqual(null)).toEqual(false);

    var functionA = function() {
      return 'hi';
    };
    var functionB = function() {
      return 'hi';
    };
    expect(match({foo:functionA}).toEqual({foo:functionB})).toEqual(false);
    expect(match({foo:functionA}).toEqual({foo:functionA})).toEqual(true);

    expect((match(false).toEqual(true))).toEqual(false);

    var circularGraph = {};
    circularGraph.referenceToSelf = circularGraph;
    expect((match(circularGraph).toEqual(circularGraph))).toEqual(true);

    expect((match(new Date(2008, 1, 3, 15, 17, 19, 1234)).toEqual(new Date(2009, 1, 3, 15, 17, 19, 1234)))).toEqual(false);
    expect((match(new Date(2008, 1, 3, 15, 17, 19, 1234)).toEqual(new Date(2008, 1, 3, 15, 17, 19, 1234)))).toEqual(true);


    expect(match(true).toNotEqual(false)).toEqual(true);
    expect((match(true).toNotEqual(true))).toEqual(false);

    expect((match(['a', 'b']).toEqual(['a', jasmine.undefined]))).toEqual(false);
    expect((match(['a', 'b']).toEqual(['a', 'b', jasmine.undefined]))).toEqual(false);

    expect((match(new String("cat")).toEqual("cat"))).toBe(true);
    expect((match(new String("cat")).toNotEqual("cat"))).toBe(false);

    expect((match(new Number(5)).toEqual(5))).toBe(true);
    expect((match(new Number('5')).toEqual(5))).toBe(true);
    expect((match(new Number(5)).toNotEqual(5))).toBe(false);
    expect((match(new Number('5')).toNotEqual(5))).toBe(false);
  });

  it("toEqual with DOM nodes", function() {
    var nodeA = document.createElement('div');
    var nodeB = document.createElement('div');
    expect((match(nodeA).toEqual(nodeA))).toEqual(true);
    expect((match(nodeA).toEqual(nodeB))).toEqual(false);
  });

  it("toEqual to build an Expectation Result", function() {
    var actual = 'a';
    var matcher = match(actual);
    var expected = 'b';
    matcher.toEqual(expected);

    var result = lastResult();

    expect(result.matcherName).toEqual("toEqual");
    expect(result.passed()).toEqual(false);
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
    expect(result.passed()).toEqual(false);
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
    expect((match(a).toBe(b))).toEqual(false);
    expect((match(a).toBe(a))).toEqual(true);
    expect((match(a).toBe(c))).toEqual(true);
    expect((match(a).toNotBe(b))).toEqual(true);
    expect((match(a).toNotBe(a))).toEqual(false);
    expect((match(a).toNotBe(c))).toEqual(false);
  });

  it("toBe to build an ExpectationResult", function() {
    var expected = 'b';
    var actual = 'a';
    var matcher = match(actual);
    matcher.toBe(expected);

    var result = lastResult();

    expect(result.matcherName).toEqual("toBe");
    expect(result.passed()).toEqual(false);
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
    expect(result.passed()).toEqual(false);
    expect(result.message).toMatch(str);
    expect(result.expected).toEqual(str);
    expect(result.actual).toEqual(str);
  });

  it("toMatch and #toNotMatch should perform regular expression matching on strings", function() {
    expect((match('foobarbel').toMatch(/bar/))).toEqual(true);
    expect((match('foobazbel').toMatch(/bar/))).toEqual(false);

    expect((match('foobarbel').toMatch("bar"))).toEqual(true);
    expect((match('foobazbel').toMatch("bar"))).toEqual(false);

    expect((match('foobarbel').toNotMatch(/bar/))).toEqual(false);
    expect((match('foobazbel').toNotMatch(/bar/))).toEqual(true);

    expect((match('foobarbel').toNotMatch("bar"))).toEqual(false);
    expect((match('foobazbel').toNotMatch("bar"))).toEqual(true);
  });

  it("toMatch w/ RegExp to build an ExpectationResult", function() {
    var actual = 'a';
    var matcher = match(actual);
    var expected = /b/;
    matcher.toMatch(expected);

    var result = lastResult();

    expect(result.matcherName).toEqual("toMatch");
    expect(result.passed()).toEqual(false);
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
    expect(result.passed()).toEqual(false);
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
    expect(result.passed()).toEqual(false);
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
    expect(result.passed()).toEqual(false);
    expect(result.message).toEqual("Expected 'a' to not match 'a'.");
    expect(result.expected).toEqual(str);
    expect(result.actual).toEqual(str);
  });

  it("toBeDefined", function() {
    expect(match('foo').toBeDefined()).toEqual(true);
    expect(match(jasmine.undefined).toBeDefined()).toEqual(false);
  });

  it("toBeDefined to build an ExpectationResult", function() {
    var matcher = match(jasmine.undefined);
    matcher.toBeDefined();

    var result = lastResult();

    expect(result.matcherName).toEqual("toBeDefined");
    expect(result.passed()).toEqual(false);
    expect(result.message).toEqual('Expected undefined to be defined.');
    expect(result.actual).toEqual(jasmine.undefined);
  });

  it("toBeUndefined", function() {
    expect(match('foo').toBeUndefined()).toEqual(false);
    expect(match(jasmine.undefined).toBeUndefined()).toEqual(true);
  });

  it("toBeNull", function() {
    expect(match(null).toBeNull()).toEqual(true);
    expect(match(jasmine.undefined).toBeNull()).toEqual(false);
    expect(match("foo").toBeNull()).toEqual(false);
  });

  it("toBeNull w/ String to build an ExpectationResult", function() {
    var actual = 'a';
    var matcher = match(actual);
    matcher.toBeNull();

    var result = lastResult();

    expect(result.matcherName).toEqual("toBeNull");
    expect(result.passed()).toEqual(false);
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
    expect(result.passed()).toEqual(false);
    expect(result.message).toMatch(jasmine.pp(actual));
    expect(result.message).toMatch('null');
    expect(result.actual).toEqual(actual);
  });

  it("toBeFalsy", function() {
    expect(match(false).toBeFalsy()).toEqual(true);
    expect(match(true).toBeFalsy()).toEqual(false);
    expect(match(jasmine.undefined).toBeFalsy()).toEqual(true);
    expect(match(0).toBeFalsy()).toEqual(true);
    expect(match("").toBeFalsy()).toEqual(true);
  });

  it("toBeFalsy to build an ExpectationResult", function() {
    var actual = 'a';
    var matcher = match(actual);
    matcher.toBeFalsy();

    var result = lastResult();

    expect(result.matcherName).toEqual("toBeFalsy");
    expect(result.passed()).toEqual(false);
    expect(result.message).toMatch(jasmine.pp(actual));
    expect(result.message).toMatch('falsy');
    expect(result.actual).toEqual(actual);
  });

  it("toBeTruthy", function() {
    expect(match(false).toBeTruthy()).toEqual(false);
    expect(match(true).toBeTruthy()).toEqual(true);
    expect(match(jasmine.undefined).toBeTruthy()).toEqual(false);
    expect(match(0).toBeTruthy()).toEqual(false);
    expect(match("").toBeTruthy()).toEqual(false);
    expect(match("hi").toBeTruthy()).toEqual(true);
    expect(match(5).toBeTruthy()).toEqual(true);
    expect(match({foo: 1}).toBeTruthy()).toEqual(true);
  });

  it("toBeTruthy to build an ExpectationResult", function() {
    var matcher = match(false);
    matcher.toBeTruthy();

    var result = lastResult();

    expect(result.matcherName).toEqual("toBeTruthy");
    expect(result.passed()).toEqual(false);
    expect(result.message).toEqual("Expected false to be truthy.");
    expect(result.actual).toEqual(false);
  });

  it("toEqual", function() {
    expect(match(jasmine.undefined).toEqual(jasmine.undefined)).toEqual(true);
    expect(match({foo:'bar'}).toEqual({foo:'bar'})).toEqual(true);
    expect(match("foo").toEqual({bar: jasmine.undefined})).toEqual(false);
    expect(match({foo: jasmine.undefined}).toEqual("goo")).toEqual(false);
    expect(match({foo: {bar :jasmine.undefined}}).toEqual("goo")).toEqual(false);
  });

  it("toEqual with jasmine.any()", function() {
    expect(match("foo").toEqual(jasmine.any(String))).toEqual(true);
    expect(match(3).toEqual(jasmine.any(Number))).toEqual(true);
    expect(match("foo").toEqual(jasmine.any(Function))).toEqual(false);
    expect(match("foo").toEqual(jasmine.any(Object))).toEqual(false);
    expect(match({someObj:'foo'}).toEqual(jasmine.any(Object))).toEqual(true);
    expect(match({someObj:'foo'}).toEqual(jasmine.any(Function))).toEqual(false);
    expect(match(function() {
    }).toEqual(jasmine.any(Object))).toEqual(false);
    expect(match(["foo", "goo"]).toEqual(["foo", jasmine.any(String)])).toEqual(true);
    expect(match(function() {
    }).toEqual(jasmine.any(Function))).toEqual(true);
    expect(match(["a", function() {
    }]).toEqual(["a", jasmine.any(Function)])).toEqual(true);
  });

  it("toEqual handles circular objects ok", function() {
    expect(match({foo: "bar", baz: jasmine.undefined}).toEqual({foo: "bar", baz: jasmine.undefined})).toEqual(true);
    expect(match({foo:['bar','baz','quux']}).toEqual({foo:['bar','baz','quux']})).toEqual(true);
    expect(match({foo: {bar:'baz'}, quux:'corge'}).toEqual({foo:{bar:'baz'}, quux:'corge'})).toEqual(true);

    var circularObject = {};
    var secondCircularObject = {};
    circularObject.field = circularObject;
    secondCircularObject.field = secondCircularObject;
    expect(match(circularObject).toEqual(secondCircularObject)).toEqual(true);
  });

  it("toNotEqual as slightly surprising behavior, but is it intentional?", function() {
    expect(match({x:"x", y:"y", z:"w"}).toNotEqual({x:"x", y:"y", z:"z"})).toEqual(true);
    expect(match({x:"x", y:"y", w:"z"}).toNotEqual({x:"x", y:"y", z:"z"})).toEqual(true);
    expect(match({x:"x", y:"y", z:"z"}).toNotEqual({w: "w", x:"x", y:"y", z:"z"})).toEqual(true);
    expect(match({w: "w", x:"x", y:"y", z:"z"}).toNotEqual({x:"x", y:"y", z:"z"})).toEqual(true);
  });

  it("toEqual handles arrays", function() {
    expect(match([1, "A"]).toEqual([1, "A"])).toEqual(true);
  });

  it("toContain and toNotContain", function() {
    expect(match('ABC').toContain('A')).toEqual(true);
    expect(match('ABC').toContain('X')).toEqual(false);

    expect(match(['A', 'B', 'C']).toContain('A')).toEqual(true);
    expect(match(['A', 'B', 'C']).toContain('F')).toEqual(false);
    expect(match(['A', 'B', 'C']).toNotContain('F')).toEqual(true);
    expect(match(['A', 'B', 'C']).toNotContain('A')).toEqual(false);

    expect(match(['A', {some:'object'}, 'C']).toContain({some:'object'})).toEqual(true);
    expect(match(['A', {some:'object'}, 'C']).toContain({some:'other object'})).toEqual(false);
  });

  it("toContain to build an ExpectationResult", function() {
    var actual = ['a','b','c'];
    var matcher = match(actual);
    var expected = 'x';
    matcher.toContain(expected);

    var result = lastResult();

    expect(result.matcherName).toEqual("toContain");
    expect(result.passed()).toEqual(false);
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
    expect(result.passed()).toEqual(false);
    expect(result.message).toMatch(jasmine.pp(actual));
    expect(result.message).toMatch('not contain');
    expect(result.message).toMatch(jasmine.pp(expected));
    expect(result.actual).toEqual(actual);
    expect(result.expected).toEqual(expected);
  });

  it("toBeLessThan should pass if actual is less than expected", function() {
    expect(match(37).toBeLessThan(42)).toEqual(true);
    expect(match(37).toBeLessThan(-42)).toEqual(false);
    expect(match(37).toBeLessThan(37)).toEqual(false);
  });

  it("toBeLessThan to build an ExpectationResult", function() {
    var actual = 3;
    var matcher = match(actual);
    var expected = 1;
    matcher.toBeLessThan(expected);

    var result = lastResult();

    expect(result.matcherName).toEqual("toBeLessThan");
    expect(result.passed()).toEqual(false);
    expect(result.message).toMatch(jasmine.pp(actual) + ' to be less than');
    expect(result.message).toMatch(jasmine.pp(expected));
    expect(result.actual).toEqual(actual);
    expect(result.expected).toEqual(expected);
  });

  it("toBeGreaterThan should pass if actual is greater than expected", function() {
    expect(match(37).toBeGreaterThan(42)).toEqual(false);
    expect(match(37).toBeGreaterThan(-42)).toEqual(true);
    expect(match(37).toBeGreaterThan(37)).toEqual(false);
  });

  it("toBeGreaterThan to build an ExpectationResult", function() {
    var actual = 1;
    var matcher = match(actual);
    var expected = 3;
    matcher.toBeGreaterThan(expected);

    var result = lastResult();

    expect(result.matcherName).toEqual("toBeGreaterThan");
    expect(result.passed()).toEqual(false);
    expect(result.message).toMatch(jasmine.pp(actual) + ' to be greater than');
    expect(result.message).toMatch(jasmine.pp(expected));
    expect(result.actual).toEqual(actual);
    expect(result.expected).toEqual(expected);
  });

  it("toThrow", function() {
    var expected = match(function() {
      throw new Error("Fake Error");
    });
    expect(expected.toThrow()).toEqual(true);
    expect(expected.toThrow("Fake Error")).toEqual(true);
    expect(expected.toThrow(new Error("Fake Error"))).toEqual(true);

    expect(expected.toThrow("Other Error")).toEqual(false);
    var result = lastResult();
    expect(result.message).toMatch("Other Error");

    expect(expected.toThrow(new Error("Other Error"))).toEqual(false);
    result = lastResult();
    expect(result.message).toMatch("Other Error");

    var exception;
    try {
      (function () {
        new jasmine.Matchers(env, 'not-a-function', spec).toThrow();
      })();
    } catch (e) {
      exception = e;
    }

    expect(exception).toBeDefined();
    expect(exception.message).toEqual('Actual is not a function');


    expect(match(function() {
    }).toThrow()).toEqual(false);
    result = lastResult();
    expect(result.message).toEqual('Expected function to throw an exception.');
  });

  describe(".not.matcher", function() {
    it("should invert the sense of any matcher", function() {
      expect(match(37).not.toBeGreaterThan(42)).toEqual(true);
      expect(match(42).not.toBeGreaterThan(37)).toEqual(false);
      expect(match("abc").not.toEqual("def")).toEqual(true);
      expect(match("abc").not.toEqual("abc")).toEqual(false);
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
        expect(function() {
          match(TestClass.normalFunction)[methodName]();
        }).toThrow('Expected a spy, but got Function.');

        expect(function() {
          match(jasmine.undefined)[methodName]();
        }).toThrow('Expected a spy, but got undefined.');

        expect(function() {
          match({some:'object'})[methodName]();
        }).toThrow('Expected a spy, but got { some : \'object\' }.');

        expect(function() {
          match("<b>")[methodName]();
        }).toThrow('Expected a spy, but got \'<b>\'.');
      };
    }

    describe("toHaveBeenCalled", function() {
      it("should pass if the spy was called", function() {
        expect(match(TestClass.spyFunction).toHaveBeenCalled()).toEqual(false);

        TestClass.spyFunction();
        expect(match(TestClass.spyFunction).toHaveBeenCalled()).toEqual(true);
      });

      it("should throw an exception when invoked with any arguments", function() {
        expect(function() {
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
        expect(match(TestClass.spyFunction).wasNotCalled()).toEqual(true);

        TestClass.spyFunction();
        expect(match(TestClass.spyFunction).wasNotCalled()).toEqual(false);
      });

      it("should throw an exception when invoked with any arguments", function() {
        expect(function() {
          match(TestClass.normalFunction).wasNotCalled("unwanted argument");
        }).toThrow('wasNotCalled does not take arguments');
      });

      it('should throw an exception when invoked on a non-spy', shouldThrowAnExceptionWhenInvokedOnANonSpy('wasNotCalled'));
    });

    describe("toHaveBeenCalledWith", function() {
      it('toHaveBeenCalledWith should return true if it was called with the expected args', function() {
        TestClass.spyFunction('a', 'b', 'c');
        expect(match(TestClass.spyFunction).toHaveBeenCalledWith('a', 'b', 'c')).toEqual(true);
      });

      it('should return false if it was not called with the expected args', function() {
        TestClass.spyFunction('a', 'b', 'c');
        var expected = match(TestClass.spyFunction);
        expect(expected.toHaveBeenCalledWith('c', 'b', 'a')).toEqual(false);
        var result = lastResult();
        expect(result.passed()).toEqual(false);
        expect(result.expected).toEqual(['c', 'b', 'a']);
        expect(result.actual.mostRecentCall.args).toEqual(['a', 'b', 'c']);
        expect(result.message).toContain(jasmine.pp(result.expected));
        expect(result.message).toContain(jasmine.pp(result.actual.mostRecentCall.args));
      });

      it('should return false if it was not called', function() {
        var expected = match(TestClass.spyFunction);
        expect(expected.toHaveBeenCalledWith('c', 'b', 'a')).toEqual(false);
        var result = lastResult();
        expect(result.passed()).toEqual(false);
        expect(result.expected).toEqual(['c', 'b', 'a']);
        expect(result.actual.argsForCall).toEqual([]);
        expect(result.message).toContain(jasmine.pp(result.expected));
      });

      it('should allow matches across multiple calls', function() {
        var expected = match(TestClass.spyFunction);
        TestClass.spyFunction('a', 'b', 'c');
        TestClass.spyFunction('d', 'e', 'f');
        expect(expected.toHaveBeenCalledWith('a', 'b', 'c')).toEqual(true);
        expect(expected.toHaveBeenCalledWith('d', 'e', 'f')).toEqual(true);
        expect(expected.toHaveBeenCalledWith('x', 'y', 'z')).toEqual(false);
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
          expect(result.passed()).toEqual(false);
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
        expect(match(TestClass.spyFunction).wasNotCalledWith('c', 'b', 'a')).toEqual(true);
      });

      it('should return false if it WAS called with the expected args', function() {
        TestClass.spyFunction('a', 'b', 'c');
        var expected = match(TestClass.spyFunction);
        expect(expected.wasNotCalledWith('a', 'b', 'c')).toEqual(false);
        var result = lastResult();
        expect(result.passed()).toEqual(false);
        expect(result.expected).toEqual(['a', 'b', 'c']);
        expect(result.actual.mostRecentCall.args).toEqual(['a', 'b', 'c']);
        expect(result.message).toContain(jasmine.pp(result.expected));
      });

      it('should return true if it was not called', function() {
        var expected = match(TestClass.spyFunction);
        expect(expected.wasNotCalledWith('c', 'b', 'a')).toEqual(true);
      });

      it('should allow matches across multiple calls', function() {
        var expected = match(TestClass.spyFunction);
        TestClass.spyFunction('a', 'b', 'c');
        TestClass.spyFunction('d', 'e', 'f');
        expect(expected.wasNotCalledWith('a', 'b', 'c')).toEqual(false);
        expect(expected.wasNotCalledWith('d', 'e', 'f')).toEqual(false);
        expect(expected.wasNotCalledWith('x', 'y', 'z')).toEqual(true);
      });

      it('should throw an exception when invoked on a non-spy', shouldThrowAnExceptionWhenInvokedOnANonSpy('wasNotCalledWith'));

    });

  });
});
