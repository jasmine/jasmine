describe('Expectation', function() {
  it('makes custom matchers available to this expectation', function() {
    var matchers = {
        toFoo: function() {},
        toBar: function() {}
      },
      expectation;

    expectation = jasmineUnderTest.Expectation.factory({
      customMatchers: matchers
    });

    expect(expectation.toFoo).toBeDefined();
    expect(expectation.toBar).toBeDefined();
  });

  it('.addCoreMatchers makes matchers available to any expectation', function() {
    var coreMatchers = {
        toQuux: function() {}
      },
      expectation;

    jasmineUnderTest.Expectation.addCoreMatchers(coreMatchers);

    expectation = jasmineUnderTest.Expectation.factory({});

    expect(expectation.toQuux).toBeDefined();
  });

  it("wraps matchers's compare functions, passing in matcher dependencies", function() {
    var fakeCompare = function() {
        return { pass: true };
      },
      matcherFactory = jasmine
        .createSpy('matcher')
        .and.returnValue({ compare: fakeCompare }),
      matchers = {
        toFoo: matcherFactory
      },
      matchersUtil = {
        buildFailureMessage: jasmine.createSpy('buildFailureMessage')
      },
      addExpectationResult = jasmine.createSpy('addExpectationResult'),
      expectation;

    expectation = jasmineUnderTest.Expectation.factory({
      matchersUtil: matchersUtil,
      customMatchers: matchers,
      actual: 'an actual',
      addExpectationResult: addExpectationResult
    });

    expectation.toFoo('hello');

    expect(matcherFactory).toHaveBeenCalledWith(matchersUtil);
  });

  it("wraps matchers's compare functions, passing the actual and expected", function() {
    var fakeCompare = jasmine
        .createSpy('fake-compare')
        .and.returnValue({ pass: true }),
      matchers = {
        toFoo: function() {
          return {
            compare: fakeCompare
          };
        }
      },
      matchersUtil = {
        buildFailureMessage: jasmine.createSpy('buildFailureMessage')
      },
      addExpectationResult = jasmine.createSpy('addExpectationResult'),
      expectation;

    expectation = jasmineUnderTest.Expectation.factory({
      matchersUtil: matchersUtil,
      customMatchers: matchers,
      actual: 'an actual',
      addExpectationResult: addExpectationResult
    });

    expectation.toFoo('hello');

    expect(fakeCompare).toHaveBeenCalledWith('an actual', 'hello');
  });

  it('reports a passing result to the spec when the comparison passes', function() {
    var matchers = {
        toFoo: function() {
          return {
            compare: function() {
              return { pass: true };
            }
          };
        }
      },
      matchersUtil = {
        buildFailureMessage: jasmine.createSpy('buildFailureMessage')
      },
      addExpectationResult = jasmine.createSpy('addExpectationResult'),
      expectation;

    expectation = jasmineUnderTest.Expectation.factory({
      customMatchers: matchers,
      matchersUtil: matchersUtil,
      actual: 'an actual',
      addExpectationResult: addExpectationResult
    });

    expectation.toFoo('hello');

    expect(addExpectationResult).toHaveBeenCalledWith(true, {
      matcherName: 'toFoo',
      passed: true,
      message: '',
      error: undefined,
      expected: 'hello',
      actual: 'an actual',
      errorForStack: undefined
    });
  });

  it('reports a failing result to the spec when the comparison fails', function() {
    var matchers = {
        toFoo: function() {
          return {
            compare: function() {
              return { pass: false };
            }
          };
        }
      },
      matchersUtil = {
        buildFailureMessage: function() {
          return '';
        }
      },
      addExpectationResult = jasmine.createSpy('addExpectationResult'),
      expectation;

    expectation = jasmineUnderTest.Expectation.factory({
      customMatchers: matchers,
      matchersUtil: matchersUtil,
      actual: 'an actual',
      addExpectationResult: addExpectationResult
    });

    expectation.toFoo('hello');

    expect(addExpectationResult).toHaveBeenCalledWith(false, {
      matcherName: 'toFoo',
      passed: false,
      expected: 'hello',
      actual: 'an actual',
      message: '',
      error: undefined,
      errorForStack: undefined
    });
  });

  it('reports a failing result and a custom fail message to the spec when the comparison fails', function() {
    var matchers = {
        toFoo: function() {
          return {
            compare: function() {
              return {
                pass: false,
                message: 'I am a custom message'
              };
            }
          };
        }
      },
      addExpectationResult = jasmine.createSpy('addExpectationResult'),
      expectation;

    expectation = jasmineUnderTest.Expectation.factory({
      actual: 'an actual',
      customMatchers: matchers,
      addExpectationResult: addExpectationResult
    });

    expectation.toFoo('hello');

    expect(addExpectationResult).toHaveBeenCalledWith(false, {
      matcherName: 'toFoo',
      passed: false,
      expected: 'hello',
      actual: 'an actual',
      message: 'I am a custom message',
      error: undefined,
      errorForStack: undefined
    });
  });

  it('reports a failing result with a custom fail message function to the spec when the comparison fails', function() {
    var matchers = {
        toFoo: function() {
          return {
            compare: function() {
              return {
                pass: false,
                message: function() {
                  return 'I am a custom message';
                }
              };
            }
          };
        }
      },
      addExpectationResult = jasmine.createSpy('addExpectationResult'),
      expectation;

    expectation = jasmineUnderTest.Expectation.factory({
      customMatchers: matchers,
      actual: 'an actual',
      addExpectationResult: addExpectationResult
    });

    expectation.toFoo('hello');

    expect(addExpectationResult).toHaveBeenCalledWith(false, {
      matcherName: 'toFoo',
      passed: false,
      expected: 'hello',
      actual: 'an actual',
      message: 'I am a custom message',
      error: undefined,
      errorForStack: undefined
    });
  });

  it('reports a passing result to the spec when the comparison fails for a negative expectation', function() {
    var matchers = {
        toFoo: function() {
          return {
            compare: function() {
              return { pass: false };
            }
          };
        }
      },
      addExpectationResult = jasmine.createSpy('addExpectationResult'),
      actual = 'an actual',
      expectation;

    expectation = jasmineUnderTest.Expectation.factory({
      customMatchers: matchers,
      actual: 'an actual',
      addExpectationResult: addExpectationResult
    }).not;

    expectation.toFoo('hello');

    expect(addExpectationResult).toHaveBeenCalledWith(true, {
      matcherName: 'toFoo',
      passed: true,
      message: '',
      error: undefined,
      expected: 'hello',
      actual: actual,
      errorForStack: undefined
    });
  });

  it('reports a failing result to the spec when the comparison passes for a negative expectation', function() {
    var matchers = {
        toFoo: function() {
          return {
            compare: function() {
              return { pass: true };
            }
          };
        }
      },
      matchersUtil = {
        buildFailureMessage: function() {
          return 'default message';
        }
      },
      addExpectationResult = jasmine.createSpy('addExpectationResult'),
      actual = 'an actual',
      expectation;

    expectation = jasmineUnderTest.Expectation.factory({
      customMatchers: matchers,
      actual: 'an actual',
      matchersUtil: matchersUtil,
      addExpectationResult: addExpectationResult
    }).not;

    expectation.toFoo('hello');

    expect(addExpectationResult).toHaveBeenCalledWith(false, {
      matcherName: 'toFoo',
      passed: false,
      expected: 'hello',
      actual: actual,
      message: 'default message',
      error: undefined,
      errorForStack: undefined
    });
  });

  it('reports a failing result and a custom fail message to the spec when the comparison passes for a negative expectation', function() {
    var matchers = {
        toFoo: function() {
          return {
            compare: function() {
              return {
                pass: true,
                message: 'I am a custom message'
              };
            }
          };
        }
      },
      addExpectationResult = jasmine.createSpy('addExpectationResult'),
      actual = 'an actual',
      expectation;

    expectation = jasmineUnderTest.Expectation.factory({
      customMatchers: matchers,
      actual: 'an actual',
      addExpectationResult: addExpectationResult
    }).not;

    expectation.toFoo('hello');

    expect(addExpectationResult).toHaveBeenCalledWith(false, {
      matcherName: 'toFoo',
      passed: false,
      expected: 'hello',
      actual: actual,
      message: 'I am a custom message',
      error: undefined,
      errorForStack: undefined
    });
  });

  it("reports a passing result to the spec when the 'not' comparison passes, given a negativeCompare", function() {
    var matchers = {
        toFoo: function() {
          return {
            compare: function() {
              return { pass: true };
            },
            negativeCompare: function() {
              return { pass: true };
            }
          };
        }
      },
      addExpectationResult = jasmine.createSpy('addExpectationResult'),
      actual = 'an actual',
      expectation;

    expectation = jasmineUnderTest.Expectation.factory({
      customMatchers: matchers,
      actual: 'an actual',
      addExpectationResult: addExpectationResult
    }).not;

    expectation.toFoo('hello');

    expect(addExpectationResult).toHaveBeenCalledWith(true, {
      matcherName: 'toFoo',
      passed: true,
      expected: 'hello',
      actual: actual,
      message: '',
      error: undefined,
      errorForStack: undefined
    });
  });

  it("reports a failing result and a custom fail message to the spec when the 'not' comparison fails, given a negativeCompare", function() {
    var matchers = {
        toFoo: function() {
          return {
            compare: function() {
              return { pass: true };
            },
            negativeCompare: function() {
              return {
                pass: false,
                message: "I'm a custom message"
              };
            }
          };
        }
      },
      addExpectationResult = jasmine.createSpy('addExpectationResult'),
      actual = 'an actual',
      expectation;

    expectation = jasmineUnderTest.Expectation.factory({
      customMatchers: matchers,
      actual: 'an actual',
      addExpectationResult: addExpectationResult
    }).not;

    expectation.toFoo('hello');

    expect(addExpectationResult).toHaveBeenCalledWith(false, {
      matcherName: 'toFoo',
      passed: false,
      expected: 'hello',
      actual: actual,
      message: "I'm a custom message",
      error: undefined,
      errorForStack: undefined
    });
  });

  it('reports a custom error message to the spec', function() {
    var customError = new Error('I am a custom error');
    var matchers = {
        toFoo: function() {
          return {
            compare: function() {
              return {
                pass: false,
                message: 'I am a custom message',
                error: customError
              };
            }
          };
        }
      },
      addExpectationResult = jasmine.createSpy('addExpectationResult'),
      expectation;

    expectation = jasmineUnderTest.Expectation.factory({
      actual: 'an actual',
      customMatchers: matchers,
      addExpectationResult: addExpectationResult
    });

    expectation.toFoo('hello');

    expect(addExpectationResult).toHaveBeenCalledWith(false, {
      matcherName: 'toFoo',
      passed: false,
      expected: 'hello',
      actual: 'an actual',
      message: 'I am a custom message',
      error: customError,
      errorForStack: undefined
    });
  });

  it("reports a custom message to the spec when a 'not' comparison fails", function() {
    var customError = new Error('I am a custom error');
    var matchers = {
        toFoo: function() {
          return {
            compare: function() {
              return {
                pass: true,
                message: 'I am a custom message',
                error: customError
              };
            }
          };
        }
      },
      addExpectationResult = jasmine.createSpy('addExpectationResult'),
      expectation;

    expectation = jasmineUnderTest.Expectation.factory({
      actual: 'an actual',
      customMatchers: matchers,
      addExpectationResult: addExpectationResult
    }).not;

    expectation.toFoo('hello');

    expect(addExpectationResult).toHaveBeenCalledWith(false, {
      matcherName: 'toFoo',
      passed: false,
      expected: 'hello',
      actual: 'an actual',
      message: 'I am a custom message',
      error: customError,
      errorForStack: undefined
    });
  });

  it("reports a custom message func to the spec when a 'not' comparison fails", function() {
    var customError = new Error('I am a custom error');
    var matchers = {
        toFoo: function() {
          return {
            compare: function() {
              return {
                pass: true,
                message: function() {
                  return 'I am a custom message';
                },
                error: customError
              };
            }
          };
        }
      },
      addExpectationResult = jasmine.createSpy('addExpectationResult'),
      expectation;

    expectation = jasmineUnderTest.Expectation.factory({
      actual: 'an actual',
      customMatchers: matchers,
      addExpectationResult: addExpectationResult
    }).not;

    expectation.toFoo('hello');

    expect(addExpectationResult).toHaveBeenCalledWith(false, {
      matcherName: 'toFoo',
      passed: false,
      expected: 'hello',
      actual: 'an actual',
      message: 'I am a custom message',
      error: customError,
      errorForStack: undefined
    });
  });

  describe('#withContext', function() {
    it('prepends the context to the generated failure message', function() {
      var matchers = {
          toFoo: function() {
            return {
              compare: function() {
                return { pass: false };
              }
            };
          }
        },
        matchersUtil = {
          buildFailureMessage: function() {
            return 'failure message';
          }
        },
        addExpectationResult = jasmine.createSpy('addExpectationResult'),
        expectation = jasmineUnderTest.Expectation.factory({
          customMatchers: matchers,
          matchersUtil: matchersUtil,
          actual: 'an actual',
          addExpectationResult: addExpectationResult
        });

      expectation.withContext('Some context').toFoo('hello');

      expect(addExpectationResult).toHaveBeenCalledWith(
        false,
        jasmine.objectContaining({
          message: 'Some context: failure message'
        })
      );
    });

    it('prepends the context to a custom failure message', function() {
      var matchers = {
          toFoo: function() {
            return {
              compare: function() {
                return { pass: false, message: 'msg' };
              }
            };
          }
        },
        addExpectationResult = jasmine.createSpy('addExpectationResult'),
        expectation = jasmineUnderTest.Expectation.factory({
          customMatchers: matchers,
          actual: 'an actual',
          addExpectationResult: addExpectationResult
        });

      expectation.withContext('Some context').toFoo('hello');

      expect(addExpectationResult).toHaveBeenCalledWith(
        false,
        jasmine.objectContaining({
          message: 'Some context: msg'
        })
      );
    });

    it('indents a multiline failure message', function() {
      var matchers = {
          toFoo: function() {
            return {
              compare: function() {
                return { pass: false, message: 'a\nmultiline\nmessage' };
              }
            };
          }
        },
        addExpectationResult = jasmine.createSpy('addExpectationResult'),
        expectation = jasmineUnderTest.Expectation.factory({
          customMatchers: matchers,
          actual: 'an actual',
          addExpectationResult: addExpectationResult
        }),
        actualMessage;

      expectation.withContext('Some context').toFoo('hello');

      actualMessage = addExpectationResult.calls.argsFor(0)[1].message;
      expect(actualMessage).toEqual(
        'Some context:\n    a\n    multiline\n    message'
      );
    });

    it('prepends the context to a custom failure message from a function', function() {
      var matchers = {
          toFoo: function() {
            return {
              compare: function() {
                return {
                  pass: false,
                  message: function() {
                    return 'msg';
                  }
                };
              }
            };
          }
        },
        addExpectationResult = jasmine.createSpy('addExpectationResult'),
        expectation = jasmineUnderTest.Expectation.factory({
          customMatchers: matchers,
          actual: 'an actual',
          addExpectationResult: addExpectationResult
        });

      expectation.withContext('Some context').toFoo('hello');

      expect(addExpectationResult).toHaveBeenCalledWith(
        false,
        jasmine.objectContaining({
          message: 'Some context: msg'
        })
      );
    });

    it('works with #not', function() {
      var matchers = {
          toFoo: function() {
            return {
              compare: function() {
                return { pass: true };
              }
            };
          }
        },
        addExpectationResult = jasmine.createSpy('addExpectationResult'),
        pp = jasmineUnderTest.makePrettyPrinter(),
        expectation = jasmineUnderTest.Expectation.factory({
          customMatchers: matchers,
          matchersUtil: new jasmineUnderTest.MatchersUtil({ pp: pp }),
          actual: 'an actual',
          addExpectationResult: addExpectationResult
        });

      expectation.withContext('Some context').not.toFoo();

      expect(addExpectationResult).toHaveBeenCalledWith(
        false,
        jasmine.objectContaining({
          message: "Some context: Expected 'an actual' not to foo."
        })
      );
    });

    it('works with #not and a custom message', function() {
      var customError = new Error('I am a custom error');
      var matchers = {
          toFoo: function() {
            return {
              compare: function() {
                return {
                  pass: true,
                  message: function() {
                    return 'I am a custom message';
                  },
                  error: customError
                };
              }
            };
          }
        },
        addExpectationResult = jasmine.createSpy('addExpectationResult'),
        expectation = jasmineUnderTest.Expectation.factory({
          actual: 'an actual',
          customMatchers: matchers,
          addExpectationResult: addExpectationResult
        });

      expectation.withContext('Some context').not.toFoo('hello');

      expect(addExpectationResult).toHaveBeenCalledWith(
        false,
        jasmine.objectContaining({
          message: 'Some context: I am a custom message'
        })
      );
    });
  });
});
