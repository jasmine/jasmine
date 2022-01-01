describe('AsyncExpectation', function() {
  beforeEach(function() {
    jasmineUnderTest.Expectation.addAsyncCoreMatchers(
      jasmineUnderTest.asyncMatchers
    );
  });

  describe('#not', function() {
    it('converts a pass to a fail', function() {
      var addExpectationResult = jasmine.createSpy('addExpectationResult'),
        actual = Promise.resolve(),
        pp = jasmineUnderTest.makePrettyPrinter(),
        expectation = jasmineUnderTest.Expectation.asyncFactory({
          matchersUtil: new jasmineUnderTest.MatchersUtil({ pp: pp }),
          actual: actual,
          addExpectationResult: addExpectationResult
        });

      return expectation.not.toBeResolved().then(function() {
        expect(addExpectationResult).toHaveBeenCalledWith(
          false,
          jasmine.objectContaining({
            passed: false,
            message: 'Expected [object Promise] not to be resolved.'
          })
        );
      });
    });

    it('converts a fail to a pass', function() {
      var addExpectationResult = jasmine.createSpy('addExpectationResult'),
        actual = Promise.reject(),
        expectation = jasmineUnderTest.Expectation.asyncFactory({
          matchersUtil: new jasmineUnderTest.MatchersUtil({
            pp: function() {}
          }),
          actual: actual,
          addExpectationResult: addExpectationResult
        });

      return expectation.not.toBeResolved().then(function() {
        expect(addExpectationResult).toHaveBeenCalledWith(
          true,
          jasmine.objectContaining({
            passed: true,
            message: ''
          })
        );
      });
    });
  });

  it('propagates rejections from the comparison function', function() {
    var error = new Error('ExpectationSpec failure');

    var addExpectationResult = jasmine.createSpy('addExpectationResult'),
      actual = dummyPromise(),
      expectation = jasmineUnderTest.Expectation.asyncFactory({
        actual: actual,
        addExpectationResult: addExpectationResult
      });

    spyOn(expectation, 'toBeResolved').and.returnValue(Promise.reject(error));

    return expectation.toBeResolved().then(
      function() {
        fail('Expected a rejection');
      },
      function(e) {
        expect(e).toBe(error);
      }
    );
  });

  describe('#withContext', function() {
    it('prepends the context to the generated failure message', function() {
      var matchersUtil = {
          pp: function(val) {
            return val.toString();
          }
        },
        addExpectationResult = jasmine.createSpy('addExpectationResult'),
        expectation = jasmineUnderTest.Expectation.asyncFactory({
          actual: Promise.reject('rejected'),
          addExpectationResult: addExpectationResult,
          matchersUtil: matchersUtil
        });

      return expectation
        .withContext('Some context')
        .toBeResolved()
        .then(function() {
          expect(addExpectationResult).toHaveBeenCalledWith(
            false,
            jasmine.objectContaining({
              message:
                'Some context: Expected a promise to be resolved but it was rejected with rejected.'
            })
          );
        });
    });

    it('prepends the context to a custom failure message', function() {
      var matchersUtil = {
          buildFailureMessage: function() {
            return 'failure message';
          },
          pp: jasmineUnderTest.makePrettyPrinter()
        },
        addExpectationResult = jasmine.createSpy('addExpectationResult'),
        expectation = jasmineUnderTest.Expectation.asyncFactory({
          actual: Promise.reject('b'),
          addExpectationResult: addExpectationResult,
          matchersUtil: matchersUtil
        });

      return expectation
        .withContext('Some context')
        .toBeResolvedTo('a')
        .then(function() {
          expect(addExpectationResult).toHaveBeenCalledWith(
            false,
            jasmine.objectContaining({
              message:
                "Some context: Expected a promise to be resolved to 'a' " +
                "but it was rejected with 'b'."
            })
          );
        });
    });

    it('prepends the context to a custom failure message from a function', function() {
      pending('should actually work, but no custom matchers for async yet');

      var matchersUtil = {
          buildFailureMessage: function() {
            return 'failure message';
          }
        },
        addExpectationResult = jasmine.createSpy('addExpectationResult'),
        actual = Promise.reject(),
        expectation = jasmineUnderTest.Expectation.asyncFactory({
          actual: actual,
          addExpectationResult: addExpectationResult,
          matchersUtil: matchersUtil
        });

      return expectation
        .withContext('Some context')
        .toBeResolved()
        .then(function() {
          expect(addExpectationResult).toHaveBeenCalledWith(
            false,
            jasmine.objectContaining({
              message: 'Some context: msg'
            })
          );
        });
    });

    it('works with #not', function() {
      var addExpectationResult = jasmine.createSpy('addExpectationResult'),
        actual = Promise.resolve(),
        pp = jasmineUnderTest.makePrettyPrinter(),
        expectation = jasmineUnderTest.Expectation.asyncFactory({
          actual: actual,
          addExpectationResult: addExpectationResult,
          matchersUtil: new jasmineUnderTest.MatchersUtil({ pp: pp })
        });

      return expectation
        .withContext('Some context')
        .not.toBeResolved()
        .then(function() {
          expect(addExpectationResult).toHaveBeenCalledWith(
            false,
            jasmine.objectContaining({
              message:
                'Some context: Expected [object Promise] not to be resolved.'
            })
          );
        });
    });

    it('works with #not and a custom message', function() {
      var addExpectationResult = jasmine.createSpy('addExpectationResult'),
        actual = Promise.resolve('a'),
        expectation = jasmineUnderTest.Expectation.asyncFactory({
          actual: actual,
          addExpectationResult: addExpectationResult,
          matchersUtil: new jasmineUnderTest.MatchersUtil({
            pp: jasmineUnderTest.makePrettyPrinter()
          })
        });

      return expectation
        .withContext('Some context')
        .not.toBeResolvedTo('a')
        .then(function() {
          expect(addExpectationResult).toHaveBeenCalledWith(
            false,
            jasmine.objectContaining({
              message:
                "Some context: Expected a promise not to be resolved to 'a'."
            })
          );
        });
    });
  });

  describe('async matchers', function() {
    it('makes custom matchers available to this expectation', function() {
      var asyncMatchers = {
          toFoo: function() {},
          toBar: function() {}
        },
        expectation;

      expectation = jasmineUnderTest.Expectation.asyncFactory({
        customAsyncMatchers: asyncMatchers
      });

      expect(expectation.toFoo).toBeDefined();
      expect(expectation.toBar).toBeDefined();
    });

    it("wraps matchers's compare functions, passing in matcher dependencies", function() {
      var fakeCompare = function() {
          return Promise.resolve({ pass: true });
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

      expectation = jasmineUnderTest.Expectation.asyncFactory({
        matchersUtil: matchersUtil,
        customAsyncMatchers: matchers,
        actual: 'an actual',
        addExpectationResult: addExpectationResult
      });

      return expectation.toFoo('hello').then(function() {
        expect(matcherFactory).toHaveBeenCalledWith(matchersUtil);
      });
    });

    it("wraps matchers's compare functions, passing the actual and expected", function() {
      var fakeCompare = jasmine
          .createSpy('fake-compare')
          .and.returnValue(Promise.resolve({ pass: true })),
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

      expectation = jasmineUnderTest.Expectation.asyncFactory({
        matchersUtil: matchersUtil,
        customAsyncMatchers: matchers,
        actual: 'an actual',
        addExpectationResult: addExpectationResult
      });

      return expectation.toFoo('hello').then(function() {
        expect(fakeCompare).toHaveBeenCalledWith('an actual', 'hello');
      });
    });

    it('reports a passing result to the spec when the comparison passes', function() {
      var matchers = {
          toFoo: function() {
            return {
              compare: function() {
                return Promise.resolve({ pass: true });
              }
            };
          }
        },
        matchersUtil = {
          buildFailureMessage: jasmine.createSpy('buildFailureMessage')
        },
        addExpectationResult = jasmine.createSpy('addExpectationResult'),
        errorWithStack = new Error('errorWithStack'),
        expectation;

      spyOn(jasmineUnderTest.util, 'errorWithStack').and.returnValue(
        errorWithStack
      );

      expectation = jasmineUnderTest.Expectation.asyncFactory({
        customAsyncMatchers: matchers,
        matchersUtil: matchersUtil,
        actual: 'an actual',
        addExpectationResult: addExpectationResult
      });

      return expectation.toFoo('hello').then(function() {
        expect(addExpectationResult).toHaveBeenCalledWith(true, {
          matcherName: 'toFoo',
          passed: true,
          message: '',
          error: undefined,
          expected: 'hello',
          actual: 'an actual',
          errorForStack: errorWithStack
        });
      });
    });

    it('reports a failing result to the spec when the comparison fails', function() {
      var matchers = {
          toFoo: function() {
            return {
              compare: function() {
                return Promise.resolve({ pass: false });
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
        errorWithStack = new Error('errorWithStack'),
        expectation;

      spyOn(jasmineUnderTest.util, 'errorWithStack').and.returnValue(
        errorWithStack
      );

      expectation = jasmineUnderTest.Expectation.asyncFactory({
        customAsyncMatchers: matchers,
        matchersUtil: matchersUtil,
        actual: 'an actual',
        addExpectationResult: addExpectationResult
      });

      return expectation.toFoo('hello').then(function() {
        expect(addExpectationResult).toHaveBeenCalledWith(false, {
          matcherName: 'toFoo',
          passed: false,
          expected: 'hello',
          actual: 'an actual',
          message: '',
          error: undefined,
          errorForStack: errorWithStack
        });
      });
    });

    it('reports a failing result and a custom fail message to the spec when the comparison fails', function() {
      var matchers = {
          toFoo: function() {
            return {
              compare: function() {
                return Promise.resolve({
                  pass: false,
                  message: 'I am a custom message'
                });
              }
            };
          }
        },
        addExpectationResult = jasmine.createSpy('addExpectationResult'),
        errorWithStack = new Error('errorWithStack'),
        expectation;

      spyOn(jasmineUnderTest.util, 'errorWithStack').and.returnValue(
        errorWithStack
      );

      expectation = jasmineUnderTest.Expectation.asyncFactory({
        actual: 'an actual',
        customAsyncMatchers: matchers,
        addExpectationResult: addExpectationResult
      });

      return expectation.toFoo('hello').then(function() {
        expect(addExpectationResult).toHaveBeenCalledWith(false, {
          matcherName: 'toFoo',
          passed: false,
          expected: 'hello',
          actual: 'an actual',
          message: 'I am a custom message',
          error: undefined,
          errorForStack: errorWithStack
        });
      });
    });

    it('reports a failing result with a custom fail message function to the spec when the comparison fails', function() {
      var matchers = {
          toFoo: function() {
            return {
              compare: function() {
                return Promise.resolve({
                  pass: false,
                  message: function() {
                    return 'I am a custom message';
                  }
                });
              }
            };
          }
        },
        addExpectationResult = jasmine.createSpy('addExpectationResult'),
        errorWithStack = new Error('errorWithStack'),
        expectation;

      spyOn(jasmineUnderTest.util, 'errorWithStack').and.returnValue(
        errorWithStack
      );

      expectation = jasmineUnderTest.Expectation.asyncFactory({
        customAsyncMatchers: matchers,
        actual: 'an actual',
        addExpectationResult: addExpectationResult
      });

      return expectation.toFoo('hello').then(function() {
        expect(addExpectationResult).toHaveBeenCalledWith(false, {
          matcherName: 'toFoo',
          passed: false,
          expected: 'hello',
          actual: 'an actual',
          message: 'I am a custom message',
          error: undefined,
          errorForStack: errorWithStack
        });
      });
    });

    it('reports a passing result to the spec when the comparison fails for a negative expectation', function() {
      var matchers = {
          toFoo: function() {
            return {
              compare: function() {
                return Promise.resolve({ pass: false });
              }
            };
          }
        },
        addExpectationResult = jasmine.createSpy('addExpectationResult'),
        actual = 'an actual',
        errorWithStack = new Error('errorWithStack'),
        expectation;

      spyOn(jasmineUnderTest.util, 'errorWithStack').and.returnValue(
        errorWithStack
      );

      expectation = jasmineUnderTest.Expectation.asyncFactory({
        customAsyncMatchers: matchers,
        actual: 'an actual',
        addExpectationResult: addExpectationResult
      }).not;

      return expectation.toFoo('hello').then(function() {
        expect(addExpectationResult).toHaveBeenCalledWith(true, {
          matcherName: 'toFoo',
          passed: true,
          message: '',
          error: undefined,
          expected: 'hello',
          actual: actual,
          errorForStack: errorWithStack
        });
      });
    });

    it('reports a failing result to the spec when the comparison passes for a negative expectation', function() {
      var matchers = {
          toFoo: function() {
            return {
              compare: function() {
                return Promise.resolve({ pass: true });
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
        errorWithStack = new Error('errorWithStack'),
        expectation;

      spyOn(jasmineUnderTest.util, 'errorWithStack').and.returnValue(
        errorWithStack
      );

      expectation = jasmineUnderTest.Expectation.asyncFactory({
        customAsyncMatchers: matchers,
        actual: 'an actual',
        matchersUtil: matchersUtil,
        addExpectationResult: addExpectationResult
      }).not;

      return expectation.toFoo('hello').then(function() {
        expect(addExpectationResult).toHaveBeenCalledWith(false, {
          matcherName: 'toFoo',
          passed: false,
          expected: 'hello',
          actual: actual,
          message: 'default message',
          error: undefined,
          errorForStack: errorWithStack
        });
      });
    });

    it('reports a failing result and a custom fail message to the spec when the comparison passes for a negative expectation', function() {
      var matchers = {
          toFoo: function() {
            return {
              compare: function() {
                return Promise.resolve({
                  pass: true,
                  message: 'I am a custom message'
                });
              }
            };
          }
        },
        addExpectationResult = jasmine.createSpy('addExpectationResult'),
        actual = 'an actual',
        errorWithStack = new Error('errorWithStack'),
        expectation;

      spyOn(jasmineUnderTest.util, 'errorWithStack').and.returnValue(
        errorWithStack
      );

      expectation = jasmineUnderTest.Expectation.asyncFactory({
        customAsyncMatchers: matchers,
        actual: 'an actual',
        addExpectationResult: addExpectationResult
      }).not;

      return expectation.toFoo('hello').then(function() {
        expect(addExpectationResult).toHaveBeenCalledWith(false, {
          matcherName: 'toFoo',
          passed: false,
          expected: 'hello',
          actual: actual,
          message: 'I am a custom message',
          error: undefined,
          errorForStack: errorWithStack
        });
      });
    });

    it("reports a passing result to the spec when the 'not' comparison passes, given a negativeCompare", function() {
      var matchers = {
          toFoo: function() {
            return {
              compare: function() {
                return Promise.resolve({ pass: true });
              },
              negativeCompare: function() {
                return Promise.resolve({ pass: true });
              }
            };
          }
        },
        addExpectationResult = jasmine.createSpy('addExpectationResult'),
        actual = 'an actual',
        errorWithStack = new Error('errorWithStack'),
        expectation;

      spyOn(jasmineUnderTest.util, 'errorWithStack').and.returnValue(
        errorWithStack
      );

      expectation = jasmineUnderTest.Expectation.asyncFactory({
        customAsyncMatchers: matchers,
        actual: 'an actual',
        addExpectationResult: addExpectationResult
      }).not;

      return expectation.toFoo('hello').then(function() {
        expect(addExpectationResult).toHaveBeenCalledWith(true, {
          matcherName: 'toFoo',
          passed: true,
          expected: 'hello',
          actual: actual,
          message: '',
          error: undefined,
          errorForStack: errorWithStack
        });
      });
    });

    it("reports a failing result and a custom fail message to the spec when the 'not' comparison fails, given a negativeCompare", function() {
      var matchers = {
          toFoo: function() {
            return {
              compare: function() {
                return Promise.resolve({ pass: true });
              },
              negativeCompare: function() {
                return Promise.resolve({
                  pass: false,
                  message: "I'm a custom message"
                });
              }
            };
          }
        },
        addExpectationResult = jasmine.createSpy('addExpectationResult'),
        actual = 'an actual',
        errorWithStack = new Error('errorWithStack'),
        expectation;

      spyOn(jasmineUnderTest.util, 'errorWithStack').and.returnValue(
        errorWithStack
      );

      expectation = jasmineUnderTest.Expectation.asyncFactory({
        customAsyncMatchers: matchers,
        actual: 'an actual',
        addExpectationResult: addExpectationResult
      }).not;

      return expectation.toFoo('hello').then(function() {
        expect(addExpectationResult).toHaveBeenCalledWith(false, {
          matcherName: 'toFoo',
          passed: false,
          expected: 'hello',
          actual: actual,
          message: "I'm a custom message",
          error: undefined,
          errorForStack: errorWithStack
        });
      });
    });

    it('reports errorWithStack when a custom error message is returned', function() {
      var customError = new Error('I am a custom error');
      var matchers = {
          toFoo: function() {
            return {
              compare: function() {
                return Promise.resolve({
                  pass: false,
                  message: 'I am a custom message',
                  error: customError
                });
              }
            };
          }
        },
        addExpectationResult = jasmine.createSpy('addExpectationResult'),
        errorWithStack = new Error('errorWithStack'),
        expectation;

      spyOn(jasmineUnderTest.util, 'errorWithStack').and.returnValue(
        errorWithStack
      );

      expectation = jasmineUnderTest.Expectation.asyncFactory({
        actual: 'an actual',
        customAsyncMatchers: matchers,
        addExpectationResult: addExpectationResult
      });

      return expectation.toFoo('hello').then(function() {
        expect(addExpectationResult).toHaveBeenCalledWith(false, {
          matcherName: 'toFoo',
          passed: false,
          expected: 'hello',
          actual: 'an actual',
          message: 'I am a custom message',
          error: undefined,
          errorForStack: errorWithStack
        });
      });
    });

    it("reports a custom message to the spec when a 'not' comparison fails", function() {
      var matchers = {
          toFoo: function() {
            return {
              compare: function() {
                return Promise.resolve({
                  pass: true,
                  message: 'I am a custom message'
                });
              }
            };
          }
        },
        addExpectationResult = jasmine.createSpy('addExpectationResult'),
        errorWithStack = new Error('errorWithStack'),
        expectation;

      spyOn(jasmineUnderTest.util, 'errorWithStack').and.returnValue(
        errorWithStack
      );

      expectation = jasmineUnderTest.Expectation.asyncFactory({
        actual: 'an actual',
        customAsyncMatchers: matchers,
        addExpectationResult: addExpectationResult
      }).not;

      return expectation.toFoo('hello').then(function() {
        expect(addExpectationResult).toHaveBeenCalledWith(false, {
          matcherName: 'toFoo',
          passed: false,
          expected: 'hello',
          actual: 'an actual',
          message: 'I am a custom message',
          error: undefined,
          errorForStack: errorWithStack
        });
      });
    });

    it("reports a custom message func to the spec when a 'not' comparison fails", function() {
      var matchers = {
          toFoo: function() {
            return {
              compare: function() {
                return Promise.resolve({
                  pass: true,
                  message: function() {
                    return 'I am a custom message';
                  }
                });
              }
            };
          }
        },
        addExpectationResult = jasmine.createSpy('addExpectationResult'),
        errorWithStack = new Error('errorWithStack'),
        expectation;

      spyOn(jasmineUnderTest.util, 'errorWithStack').and.returnValue(
        errorWithStack
      );

      expectation = jasmineUnderTest.Expectation.asyncFactory({
        actual: 'an actual',
        customAsyncMatchers: matchers,
        addExpectationResult: addExpectationResult
      }).not;

      return expectation.toFoo('hello').then(function() {
        expect(addExpectationResult).toHaveBeenCalledWith(false, {
          matcherName: 'toFoo',
          passed: false,
          expected: 'hello',
          actual: 'an actual',
          message: 'I am a custom message',
          error: undefined,
          errorForStack: errorWithStack
        });
      });
    });
  });

  function dummyPromise() {
    return new Promise(function(resolve, reject) {});
  }
});
