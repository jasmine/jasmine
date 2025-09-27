describe('AsyncExpectation', function() {
  beforeEach(function() {
    privateUnderTest.Expectation.addAsyncCoreMatchers(
      privateUnderTest.asyncMatchers
    );
  });

  describe('#not', function() {
    it('converts a pass to a fail', function() {
      const addExpectationResult = jasmine.createSpy('addExpectationResult'),
        actual = Promise.resolve(),
        pp = privateUnderTest.makePrettyPrinter(),
        expectation = privateUnderTest.Expectation.asyncFactory({
          matchersUtil: new privateUnderTest.MatchersUtil({ pp: pp }),
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
      const addExpectationResult = jasmine.createSpy('addExpectationResult'),
        actual = Promise.reject(new Error('nope')),
        expectation = privateUnderTest.Expectation.asyncFactory({
          matchersUtil: new privateUnderTest.MatchersUtil({
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
    const error = new Error('ExpectationSpec failure');

    const addExpectationResult = jasmine.createSpy('addExpectationResult'),
      actual = dummyPromise(),
      expectation = privateUnderTest.Expectation.asyncFactory({
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
      const matchersUtil = {
          pp: function(val) {
            return val.toString();
          }
        },
        addExpectationResult = jasmine.createSpy('addExpectationResult'),
        expectation = privateUnderTest.Expectation.asyncFactory({
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
      const matchersUtil = {
          buildFailureMessage: function() {
            return 'failure message';
          },
          pp: privateUnderTest.makePrettyPrinter()
        },
        addExpectationResult = jasmine.createSpy('addExpectationResult'),
        expectation = privateUnderTest.Expectation.asyncFactory({
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

    it('prepends the context to a custom failure message from a matcher', async function() {
      const matchersUtil = {
        buildFailureMessage() {
          return 'failure message';
        },
        pp(v) {
          return v.toString();
        }
      };
      const addExpectationResult = jasmine.createSpy('addExpectationResult');
      const actual = Promise.reject(new Error('nope'));
      const expectation = privateUnderTest.Expectation.asyncFactory({
        actual: actual,
        addExpectationResult: addExpectationResult,
        matchersUtil: matchersUtil
      });

      await expectation.withContext('Some context').toBeResolved();

      expect(addExpectationResult).toHaveBeenCalledWith(
        false,
        jasmine.objectContaining({
          message:
            'Some context: Expected a promise to be resolved but it ' +
            'was rejected with Error: nope.'
        })
      );
    });

    it('works with #not', function() {
      const addExpectationResult = jasmine.createSpy('addExpectationResult'),
        actual = Promise.resolve(),
        pp = privateUnderTest.makePrettyPrinter(),
        expectation = privateUnderTest.Expectation.asyncFactory({
          actual: actual,
          addExpectationResult: addExpectationResult,
          matchersUtil: new privateUnderTest.MatchersUtil({ pp: pp })
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
      const addExpectationResult = jasmine.createSpy('addExpectationResult'),
        actual = Promise.resolve('a'),
        expectation = privateUnderTest.Expectation.asyncFactory({
          actual: actual,
          addExpectationResult: addExpectationResult,
          matchersUtil: new privateUnderTest.MatchersUtil({
            pp: privateUnderTest.makePrettyPrinter()
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
      const asyncMatchers = {
          toFoo: function() {},
          toBar: function() {}
        },
        expectation = privateUnderTest.Expectation.asyncFactory({
          customAsyncMatchers: asyncMatchers
        });

      expect(expectation.toFoo).toBeDefined();
      expect(expectation.toBar).toBeDefined();
    });

    it("wraps matchers's compare functions, passing in matcher dependencies", function() {
      const fakeCompare = function() {
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
        expectation = privateUnderTest.Expectation.asyncFactory({
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
      const fakeCompare = jasmine
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
        expectation = privateUnderTest.Expectation.asyncFactory({
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
      const matchers = {
        toFoo: function() {
          return {
            compare: function() {
              return Promise.resolve({ pass: true });
            }
          };
        }
      };
      const matchersUtil = {
        buildFailureMessage: jasmine.createSpy('buildFailureMessage')
      };
      const addExpectationResult = jasmine.createSpy('addExpectationResult');

      const expectation = privateUnderTest.Expectation.asyncFactory({
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
          errorForStack: jasmine.any(Error)
        });
      });
    });

    it('reports a failing result to the spec when the comparison fails', function() {
      const matchers = {
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
        };
      const addExpectationResult = jasmine.createSpy('addExpectationResult');

      const expectation = privateUnderTest.Expectation.asyncFactory({
        customAsyncMatchers: matchers,
        matchersUtil: matchersUtil,
        actual: 'an actual',
        addExpectationResult: addExpectationResult
      });

      return expectation.toFoo('hello').then(function() {
        expect(addExpectationResult).toHaveBeenCalledWith(false, {
          matcherName: 'toFoo',
          passed: false,
          message: '',
          error: undefined,
          errorForStack: jasmine.any(Error)
        });
      });
    });

    it('reports a failing result and a custom fail message to the spec when the comparison fails', function() {
      const matchers = {
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
      };
      const addExpectationResult = jasmine.createSpy('addExpectationResult');

      const expectation = privateUnderTest.Expectation.asyncFactory({
        actual: 'an actual',
        customAsyncMatchers: matchers,
        addExpectationResult: addExpectationResult
      });

      return expectation.toFoo('hello').then(function() {
        expect(addExpectationResult).toHaveBeenCalledWith(false, {
          matcherName: 'toFoo',
          passed: false,
          message: 'I am a custom message',
          error: undefined,
          errorForStack: jasmine.any(Error)
        });
      });
    });

    it('reports a failing result with a custom fail message function to the spec when the comparison fails', function() {
      const matchers = {
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
      };
      const addExpectationResult = jasmine.createSpy('addExpectationResult');

      const expectation = privateUnderTest.Expectation.asyncFactory({
        customAsyncMatchers: matchers,
        actual: 'an actual',
        addExpectationResult: addExpectationResult
      });

      return expectation.toFoo('hello').then(function() {
        expect(addExpectationResult).toHaveBeenCalledWith(false, {
          matcherName: 'toFoo',
          passed: false,
          message: 'I am a custom message',
          error: undefined,
          errorForStack: jasmine.any(Error)
        });
      });
    });

    it('reports a passing result to the spec when the comparison fails for a negative expectation', function() {
      const matchers = {
        toFoo: function() {
          return {
            compare: function() {
              return Promise.resolve({ pass: false });
            }
          };
        }
      };
      const addExpectationResult = jasmine.createSpy('addExpectationResult');

      const expectation = privateUnderTest.Expectation.asyncFactory({
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
          errorForStack: jasmine.any(Error)
        });
      });
    });

    it('reports a failing result to the spec when the comparison passes for a negative expectation', function() {
      const matchers = {
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
        };
      const addExpectationResult = jasmine.createSpy('addExpectationResult');

      const expectation = privateUnderTest.Expectation.asyncFactory({
        customAsyncMatchers: matchers,
        actual: 'an actual',
        matchersUtil: matchersUtil,
        addExpectationResult: addExpectationResult
      }).not;

      return expectation.toFoo('hello').then(function() {
        expect(addExpectationResult).toHaveBeenCalledWith(false, {
          matcherName: 'toFoo',
          passed: false,
          message: 'default message',
          error: undefined,
          errorForStack: jasmine.any(Error)
        });
      });
    });

    it('reports a failing result and a custom fail message to the spec when the comparison passes for a negative expectation', function() {
      const matchers = {
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
      };
      const addExpectationResult = jasmine.createSpy('addExpectationResult');

      const expectation = privateUnderTest.Expectation.asyncFactory({
        customAsyncMatchers: matchers,
        actual: 'an actual',
        addExpectationResult: addExpectationResult
      }).not;

      return expectation.toFoo('hello').then(function() {
        expect(addExpectationResult).toHaveBeenCalledWith(false, {
          matcherName: 'toFoo',
          passed: false,
          message: 'I am a custom message',
          error: undefined,
          errorForStack: jasmine.any(Error)
        });
      });
    });

    it("reports a passing result to the spec when the 'not' comparison passes, given a negativeCompare", function() {
      const matchers = {
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
      };
      const addExpectationResult = jasmine.createSpy('addExpectationResult');

      const expectation = privateUnderTest.Expectation.asyncFactory({
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
          errorForStack: jasmine.any(Error)
        });
      });
    });

    it("reports a failing result and a custom fail message to the spec when the 'not' comparison fails, given a negativeCompare", function() {
      const matchers = {
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
      };
      const addExpectationResult = jasmine.createSpy('addExpectationResult');

      const expectation = privateUnderTest.Expectation.asyncFactory({
        customAsyncMatchers: matchers,
        actual: 'an actual',
        addExpectationResult: addExpectationResult
      }).not;

      return expectation.toFoo('hello').then(function() {
        expect(addExpectationResult).toHaveBeenCalledWith(false, {
          matcherName: 'toFoo',
          passed: false,
          message: "I'm a custom message",
          error: undefined,
          errorForStack: jasmine.any(Error)
        });
      });
    });

    it('reports errorWithStack when a custom error message is returned', function() {
      const customError = new Error('I am a custom error');
      const matchers = {
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
      };
      const addExpectationResult = jasmine.createSpy('addExpectationResult');

      const expectation = privateUnderTest.Expectation.asyncFactory({
        actual: 'an actual',
        customAsyncMatchers: matchers,
        addExpectationResult: addExpectationResult
      });

      return expectation.toFoo('hello').then(function() {
        expect(addExpectationResult).toHaveBeenCalledWith(false, {
          matcherName: 'toFoo',
          passed: false,
          message: 'I am a custom message',
          error: undefined,
          errorForStack: jasmine.any(Error)
        });
      });
    });

    it("reports a custom message to the spec when a 'not' comparison fails", function() {
      const matchers = {
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
      };
      const addExpectationResult = jasmine.createSpy('addExpectationResult');

      const expectation = privateUnderTest.Expectation.asyncFactory({
        actual: 'an actual',
        customAsyncMatchers: matchers,
        addExpectationResult: addExpectationResult
      }).not;

      return expectation.toFoo('hello').then(function() {
        expect(addExpectationResult).toHaveBeenCalledWith(false, {
          matcherName: 'toFoo',
          passed: false,
          message: 'I am a custom message',
          error: undefined,
          errorForStack: jasmine.any(Error)
        });
      });
    });

    it("reports a custom message func to the spec when a 'not' comparison fails", function() {
      const matchers = {
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
      };
      const addExpectationResult = jasmine.createSpy('addExpectationResult');

      let expectation = privateUnderTest.Expectation.asyncFactory({
        actual: 'an actual',
        customAsyncMatchers: matchers,
        addExpectationResult: addExpectationResult
      }).not;

      return expectation.toFoo('hello').then(function() {
        expect(addExpectationResult).toHaveBeenCalledWith(false, {
          matcherName: 'toFoo',
          passed: false,
          message: 'I am a custom message',
          error: undefined,
          errorForStack: jasmine.any(Error)
        });
      });
    });
  });

  function dummyPromise() {
    return new Promise(function() {});
  }
});
