describe('AsyncExpectation', function() {
  beforeEach(function() {
    jasmineUnderTest.Expectation.addAsyncCoreMatchers(
      jasmineUnderTest.asyncMatchers
    );
  });

  describe('Factory', function() {
    it('throws an Error if promises are not available', function() {
      var thenable = { then: function() {} },
        options = { global: {}, actual: thenable };
      function f() {
        jasmineUnderTest.Expectation.asyncFactory(options);
      }
      expect(f).toThrowError(
        'expectAsync is unavailable because the environment does not support promises.'
      );
    });
  });

  describe('#not', function() {
    it('converts a pass to a fail', function() {
      jasmine.getEnv().requirePromises();

      var addExpectationResult = jasmine.createSpy('addExpectationResult'),
        actual = Promise.resolve(),
        expectation = jasmineUnderTest.Expectation.asyncFactory({
          util: jasmineUnderTest.matchersUtil,
          actual: actual,
          addExpectationResult: addExpectationResult
        });

      return expectation.not.toBeResolved().then(function() {
        expect(addExpectationResult).toHaveBeenCalledWith(
          false,
          jasmine.objectContaining({
            passed: false,
            message: 'Expected a promise not to be resolved.'
          })
        );
      });
    });

    it('converts a fail to a pass', function() {
      jasmine.getEnv().requirePromises();

      var addExpectationResult = jasmine.createSpy('addExpectationResult'),
        actual = Promise.reject(),
        expectation = jasmineUnderTest.Expectation.asyncFactory({
          util: jasmineUnderTest.matchersUtil,
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
    jasmine.getEnv().requirePromises();
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
      jasmine.getEnv().requirePromises();

      var util = {
          buildFailureMessage: function() {
            return 'failure message';
          }
        },
        addExpectationResult = jasmine.createSpy('addExpectationResult'),
        expectation = jasmineUnderTest.Expectation.asyncFactory({
          actual: Promise.reject('rejected'),
          addExpectationResult: addExpectationResult,
          util: util
        });

      return expectation
        .withContext('Some context')
        .toBeResolved()
        .then(function() {
          expect(addExpectationResult).toHaveBeenCalledWith(
            false,
            jasmine.objectContaining({
              message: 'Some context: failure message'
            })
          );
        });
    });

    it('prepends the context to a custom failure message', function() {
      jasmine.getEnv().requirePromises();

      var util = {
          buildFailureMessage: function() {
            return 'failure message';
          }
        },
        addExpectationResult = jasmine.createSpy('addExpectationResult'),
        expectation = jasmineUnderTest.Expectation.asyncFactory({
          actual: Promise.reject('b'),
          addExpectationResult: addExpectationResult,
          util: util
        });

      return expectation
        .withContext('Some context')
        .toBeResolvedTo('a')
        .then(function() {
          expect(addExpectationResult).toHaveBeenCalledWith(
            false,
            jasmine.objectContaining({
              message:
                "Some context: Expected a promise to be resolved to 'a' but it was rejected."
            })
          );
        });
    });

    it('prepends the context to a custom failure message from a function', function() {
      pending('should actually work, but no custom matchers for async yet');
      jasmine.getEnv().requirePromises();

      var util = {
          buildFailureMessage: function() {
            return 'failure message';
          }
        },
        addExpectationResult = jasmine.createSpy('addExpectationResult'),
        actual = Promise.reject(),
        expectation = jasmineUnderTest.Expectation.asyncFactory({
          actual: actual,
          addExpectationResult: addExpectationResult,
          util: util
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
      jasmine.getEnv().requirePromises();

      var addExpectationResult = jasmine.createSpy('addExpectationResult'),
        actual = Promise.resolve(),
        expectation = jasmineUnderTest.Expectation.asyncFactory({
          actual: actual,
          addExpectationResult: addExpectationResult,
          util: jasmineUnderTest.matchersUtil
        });

      return expectation
        .withContext('Some context')
        .not.toBeResolved()
        .then(function() {
          expect(addExpectationResult).toHaveBeenCalledWith(
            false,
            jasmine.objectContaining({
              message: 'Some context: Expected a promise not to be resolved.'
            })
          );
        });
    });

    it('works with #not and a custom message', function() {
      jasmine.getEnv().requirePromises();

      var addExpectationResult = jasmine.createSpy('addExpectationResult'),
        actual = Promise.resolve('a'),
        expectation = jasmineUnderTest.Expectation.asyncFactory({
          actual: actual,
          addExpectationResult: addExpectationResult,
          util: jasmineUnderTest.matchersUtil
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

  function dummyPromise() {
    return new Promise(function(resolve, reject) {});
  }
});
