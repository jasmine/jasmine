describe("Expectation", function() {
  it("makes custom matchers available to this expectation", function() {
    var matchers = {
        toFoo: function() {},
        toBar: function() {}
      },
      expectation;

    expectation = new j$.Expectation({
      customMatchers: matchers
    });

    expect(expectation.toFoo).toBeDefined();
    expect(expectation.toBar).toBeDefined();
  });

  it(".addCoreMatchers makes matchers available to any expectation", function() {
    var coreMatchers = {
        toQuux: function() {}
      },
      expectation;

    j$.Expectation.addCoreMatchers(coreMatchers);

    expectation = new j$.Expectation({});

    expect(expectation.toQuux).toBeDefined();
  });

  it("Factory builds an expectation/negative expectation", function() {
    var builtExpectation = j$.Expectation.Factory();

    expect(builtExpectation instanceof j$.Expectation).toBe(true);
    expect(builtExpectation.not instanceof j$.Expectation).toBe(true);
    expect(builtExpectation.not.isNot).toBe(true);
  });

  it("wraps matchers's compare functions, passing in matcher dependencies", function() {
    var fakeCompare = function() { return { pass: true }; },
      matcherFactory = jasmine.createSpy("matcher").and.returnValue({ compare: fakeCompare }),
      matchers = {
        toFoo: matcherFactory
      },
      util = {},
      customEqualityTesters = ['a'],
      addExpectationResult = jasmine.createSpy("addExpectationResult"),
      expectation;

    expectation = new j$.Expectation({
      util: util,
      customMatchers: matchers,
      customEqualityTesters: customEqualityTesters,
      actual: "an actual",
      addExpectationResult: addExpectationResult
    });

    expectation.toFoo("hello");

    expect(matcherFactory).toHaveBeenCalledWith(util, customEqualityTesters)
  });

  it("wraps matchers's compare functions, passing the actual and expected", function() {
    var fakeCompare = jasmine.createSpy('fake-compare').and.returnValue({pass: true}),
      matchers = {
        toFoo: function() {
          return {
            compare: fakeCompare
          };
        }
      },
      util = {
        buildFailureMessage: jasmine.createSpy('buildFailureMessage')
      },
      addExpectationResult = jasmine.createSpy("addExpectationResult"),
      expectation;

    expectation = new j$.Expectation({
      util: util,
      customMatchers: matchers,
      actual: "an actual",
      addExpectationResult: addExpectationResult
    });

    expectation.toFoo("hello");

    expect(fakeCompare).toHaveBeenCalledWith("an actual", "hello");
  });

  it("reports a passing result to the spec when the comparison passes", function() {
    var matchers = {
        toFoo: function() {
          return {
            compare: function() { return { pass: true }; }
          };
        }
      },
      util = {
        buildFailureMessage: jasmine.createSpy('buildFailureMessage')
      },
      addExpectationResult = jasmine.createSpy("addExpectationResult"),
      expectation;

    expectation = new j$.Expectation({
      customMatchers: matchers,
      util: util,
      actual: "an actual",
      addExpectationResult: addExpectationResult
    });

    expectation.toFoo("hello");

    expect(addExpectationResult).toHaveBeenCalledWith(true, {
      matcherName: "toFoo",
      passed: true,
      message: "",
      expected: "hello",
      actual: "an actual"
    });
  });

  it("reports a failing result to the spec when the comparison fails", function() {
    var matchers = {
        toFoo: function() {
          return {
            compare: function() { return { pass: false }; }
          };
        }
      },
      util = {
        buildFailureMessage: function() { return ""; }
      },
      addExpectationResult = jasmine.createSpy("addExpectationResult"),
      expectation;

    expectation = new j$.Expectation({
      customMatchers: matchers,
      util: util,
      actual: "an actual",
      addExpectationResult: addExpectationResult
    });

    expectation.toFoo("hello");

    expect(addExpectationResult).toHaveBeenCalledWith(false, {
      matcherName: "toFoo",
      passed: false,
      expected: "hello",
      actual: "an actual",
      message: ""
    });
  });

  it("reports a failing result and a custom fail message to the spec when the comparison fails", function() {
    var matchers = {
        toFoo: function() {
          return {
            compare: function() {
              return {
                pass: false,
                message: "I am a custom message"
              };
            }
          };
        }
      },
      addExpectationResult = jasmine.createSpy("addExpectationResult"),
      expectation;

    expectation = new j$.Expectation({
      actual: "an actual",
      customMatchers: matchers,
      addExpectationResult: addExpectationResult
    });

    expectation.toFoo("hello");

    expect(addExpectationResult).toHaveBeenCalledWith(false, {
      matcherName: "toFoo",
      passed: false,
      expected: "hello",
      actual: "an actual",
      message: "I am a custom message"
    });
  });

  it("reports a failing result with a custom fail message function to the spec when the comparison fails", function() {
    var matchers = {
        toFoo: function() {
          return {
            compare: function() {
              return {
                pass: false,
                message: function() { return "I am a custom message"; }
              };
            }
          };
        }
      },
      addExpectationResult = jasmine.createSpy("addExpectationResult"),
      expectation;

    expectation = new j$.Expectation({
      customMatchers: matchers,
      actual: "an actual",
      addExpectationResult: addExpectationResult
    });

    expectation.toFoo("hello");

    expect(addExpectationResult).toHaveBeenCalledWith(false, {
      matcherName: "toFoo",
      passed: false,
      expected: "hello",
      actual: "an actual",
      message: "I am a custom message"
    });
  });

  it("reports a passing result to the spec when the comparison fails for a negative expectation", function() {
    var matchers = {
        toFoo: function() {
          return {
            compare: function() { return { pass: false }; }
          };
        }
      },
      util = {
        buildFailureMessage: function() { return ""; }
      },
      addExpectationResult = jasmine.createSpy("addExpectationResult"),
      actual = "an actual",
      expectation;

    expectation = new j$.Expectation({
      customMatchers: matchers,
      actual: "an actual",
      addExpectationResult: addExpectationResult,
      isNot: true
    });

    expectation.toFoo("hello");

    expect(addExpectationResult).toHaveBeenCalledWith(true, {
      matcherName: "toFoo",
      passed: true,
      message: "",
      expected: "hello",
      actual: actual
    });
  });

  it("reports a failing result to the spec when the comparison passes for a negative expectation", function() {
    var matchers = {
        toFoo: function() {
          return {
            compare: function() { return { pass: true }; }
          };
        }
      },
      util = {
        buildFailureMessage: function() { return "default message"; }
      },
      addExpectationResult = jasmine.createSpy("addExpectationResult"),
      actual = "an actual",
      expectation;

    expectation = new j$.Expectation({
      customMatchers: matchers,
      actual: "an actual",
      util: util,
      addExpectationResult: addExpectationResult,
      isNot: true
    });

    expectation.toFoo("hello");

    expect(addExpectationResult).toHaveBeenCalledWith(false, {
      matcherName: "toFoo",
      passed: false,
      expected: "hello",
      actual: actual,
      message: "default message"
    });
  });

  it("reports a failing result and a custom fail message to the spec when the comparison passes for a negative expectation", function() {
    var matchers = {
        toFoo: function() {
          return {
            compare: function() {
              return {
                pass: true,
                message: "I am a custom message"
              };
            }
          };
        }
      },
      addExpectationResult = jasmine.createSpy("addExpectationResult"),
      actual = "an actual",
      expectation;

    expectation = new j$.Expectation({
      customMatchers: matchers,
      actual: "an actual",
      addExpectationResult: addExpectationResult,
      isNot: true
    });

    expectation.toFoo("hello");

    expect(addExpectationResult).toHaveBeenCalledWith(false, {
      matcherName: "toFoo",
      passed: false,
      expected: "hello",
      actual: actual,
      message: "I am a custom message"
    });
  });

  it("reports a passing result to the spec when the 'not' comparison passes, given a negativeCompare", function() {
    var matchers = {
        toFoo: function() {
          return {
            compare: function() { return { pass: true }; },
            negativeCompare: function() { return { pass: true }; }
          };
        }
      },
      addExpectationResult = jasmine.createSpy("addExpectationResult"),
      actual = "an actual",
      expectation;

    expectation = new j$.Expectation({
      customMatchers: matchers,
      actual: "an actual",
      addExpectationResult: addExpectationResult,
      isNot: true
    });

    expectation.toFoo("hello");

    expect(addExpectationResult).toHaveBeenCalledWith(true, {
      matcherName: "toFoo",
      passed: true,
      expected: "hello",
      actual: actual,
      message: ""
    });
  });

  it("reports a failing result and a custom fail message to the spec when the 'not' comparison fails, given a negativeCompare", function() {
    var matchers = {
        toFoo: function() {
          return {
            compare: function() { return { pass: true }; },
            negativeCompare: function() {
              return {
                pass: false,
                message: "I'm a custom message"
              };
            }
          };
        }
      },
      addExpectationResult = jasmine.createSpy("addExpectationResult"),
      actual = "an actual",
      expectation;

    expectation = new j$.Expectation({
      customMatchers: matchers,
      actual: "an actual",
      addExpectationResult: addExpectationResult,
      isNot: true
    });

    expectation.toFoo("hello");

    expect(addExpectationResult).toHaveBeenCalledWith(false, {
      matcherName: "toFoo",
      passed: false,
      expected: "hello",
      actual: actual,
      message: "I'm a custom message"
    });
  });

});

