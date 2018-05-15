describe("Expectation", function() {
  it("makes custom matchers available to this expectation", function() {
    var matchers = {
        toFoo: function() {},
        toBar: function() {}
      },
      expectation;

    expectation = new jasmineUnderTest.Expectation({
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

    jasmineUnderTest.Expectation.addCoreMatchers(coreMatchers);

    expectation = new jasmineUnderTest.Expectation({});

    expect(expectation.toQuux).toBeDefined();
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

    expectation = new jasmineUnderTest.Expectation({
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

    expectation = new jasmineUnderTest.Expectation({
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

    expectation = new jasmineUnderTest.Expectation({
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
      error: undefined,
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

    expectation = new jasmineUnderTest.Expectation({
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
      message: "",
      error: undefined
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

    expectation = new jasmineUnderTest.Expectation({
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
      message: "I am a custom message",
      error: undefined
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

    expectation = new jasmineUnderTest.Expectation({
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
      message: "I am a custom message",
      error: undefined
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

    expectation = jasmineUnderTest.Expectation.Factory({
      customMatchers: matchers,
      actual: "an actual",
      addExpectationResult: addExpectationResult
    }).not;

    expectation.toFoo("hello");

    expect(addExpectationResult).toHaveBeenCalledWith(true, {
      matcherName: "toFoo",
      passed: true,
      message: "",
      error: undefined,
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

    expectation = jasmineUnderTest.Expectation.Factory({
      customMatchers: matchers,
      actual: "an actual",
      util: util,
      addExpectationResult: addExpectationResult,
    }).not;

    expectation.toFoo("hello");

    expect(addExpectationResult).toHaveBeenCalledWith(false, {
      matcherName: "toFoo",
      passed: false,
      expected: "hello",
      actual: actual,
      message: "default message",
      error: undefined
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

    expectation = jasmineUnderTest.Expectation.Factory({
      customMatchers: matchers,
      actual: "an actual",
      addExpectationResult: addExpectationResult
    }).not;

    expectation.toFoo("hello");

    expect(addExpectationResult).toHaveBeenCalledWith(false, {
      matcherName: "toFoo",
      passed: false,
      expected: "hello",
      actual: actual,
      message: "I am a custom message",
      error: undefined
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

    expectation = jasmineUnderTest.Expectation.Factory({
      customMatchers: matchers,
      actual: "an actual",
      addExpectationResult: addExpectationResult
    }).not;

    expectation.toFoo("hello");

    expect(addExpectationResult).toHaveBeenCalledWith(true, {
      matcherName: "toFoo",
      passed: true,
      expected: "hello",
      actual: actual,
      message: "",
      error: undefined
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

    expectation = jasmineUnderTest.Expectation.Factory({
      customMatchers: matchers,
      actual: "an actual",
      addExpectationResult: addExpectationResult,
    }).not;

    expectation.toFoo("hello");

    expect(addExpectationResult).toHaveBeenCalledWith(false, {
      matcherName: "toFoo",
      passed: false,
      expected: "hello",
      actual: actual,
      message: "I'm a custom message",
      error: undefined
    });
  });
  
  it("reports a custom error message to the spec", function() {
    var customError = new Error("I am a custom error");
    var matchers = {
        toFoo: function() {
          return {
            compare: function() {
              return {
                pass: false,
                message: "I am a custom message",
                error: customError
              };
            }
          };
        }
      },
      addExpectationResult = jasmine.createSpy("addExpectationResult"),
      expectation;

    expectation = new jasmineUnderTest.Expectation({
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
      message: "I am a custom message",
      error: customError
    });
  });

  it("reports a custom message to the spec when a 'not' comparison fails", function() {
    var customError = new Error("I am a custom error");
    var matchers = {
        toFoo: function() {
          return {
            compare: function() {
              return {
                pass: true,
                message: "I am a custom message",
                error: customError
              };
            }
          };
        }
      },
      addExpectationResult = jasmine.createSpy("addExpectationResult"),
      expectation;

    expectation = jasmineUnderTest.Expectation.Factory({
      actual: "an actual",
      customMatchers: matchers,
      addExpectationResult: addExpectationResult
    }).not;

    expectation.toFoo("hello");

    expect(addExpectationResult).toHaveBeenCalledWith(false, {
      matcherName: "toFoo",
      passed: false,
      expected: "hello",
      actual: "an actual",
      message: "I am a custom message",
      error: customError
    });
  });

  it("reports a custom message func to the spec when a 'not' comparison fails", function() {
    var customError = new Error("I am a custom error");
    var matchers = {
        toFoo: function() {
          return {
            compare: function() {
              return {
                pass: true,
                message: function() { return "I am a custom message"; },
                error: customError
              };
            }
          };
        }
      },
      addExpectationResult = jasmine.createSpy("addExpectationResult"),
      expectation;

    expectation = jasmineUnderTest.Expectation.Factory({
      actual: "an actual",
      customMatchers: matchers,
      addExpectationResult: addExpectationResult
    }).not;

    expectation.toFoo("hello");

    expect(addExpectationResult).toHaveBeenCalledWith(false, {
      matcherName: "toFoo",
      passed: false,
      expected: "hello",
      actual: "an actual",
      message: "I am a custom message",
      error: customError
    });
  });

  describe("#withContext", function() {
    it("prepends the context to the generated failure message", function() {
      var matchers = {
          toFoo: function() {
            return {
              compare: function() { return { pass: false }; }
            };
          }
        },
        util = {
          buildFailureMessage: function() { return "failure message"; }
        },
        addExpectationResult = jasmine.createSpy("addExpectationResult"),
        expectation = jasmineUnderTest.Expectation.Factory({
          customMatchers: matchers,
          util: util,
          actual: "an actual",
          addExpectationResult: addExpectationResult
        });
  
      expectation.withContext("Some context").toFoo("hello");
  
      expect(addExpectationResult).toHaveBeenCalledWith(false,
        jasmine.objectContaining({
          message: "Some context: failure message"
        })
      );
    });

    it("prepends the context to a custom failure message", function() {
      var matchers = {
          toFoo: function() {
            return {
              compare: function() { return { pass: false, message: "msg" }; }
            };
          }
        },
        addExpectationResult = jasmine.createSpy("addExpectationResult"),
        expectation = jasmineUnderTest.Expectation.Factory({
          customMatchers: matchers,
          actual: "an actual",
          addExpectationResult: addExpectationResult
        });
  
      expectation.withContext("Some context").toFoo("hello");
  
      expect(addExpectationResult).toHaveBeenCalledWith(false,
        jasmine.objectContaining({
          message: "Some context: msg"
        })
      );
    });

    it("prepends the context to a custom failure message from a function", function() {
      var matchers = {
          toFoo: function() {
            return {
              compare: function() {
                return {
                  pass: false,
                  message: function() { return "msg"; }
                };
              }
            };
          }
        },
        addExpectationResult = jasmine.createSpy("addExpectationResult"),
        expectation = jasmineUnderTest.Expectation.Factory({
          customMatchers: matchers,
          actual: "an actual",
          addExpectationResult: addExpectationResult
        });
  
      expectation.withContext("Some context").toFoo("hello");
  
      expect(addExpectationResult).toHaveBeenCalledWith(false,
        jasmine.objectContaining({
          message: "Some context: msg"
        })
      );
    });
  });
});

