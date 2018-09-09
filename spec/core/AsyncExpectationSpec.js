describe('AsyncExpectation', function() {
  describe('Factory', function() {
    it('throws an Error if promises are not available', function() {
      var thenable = {then: function() {}},
        options = {global: {}, actual: thenable}
      function f() { jasmineUnderTest.AsyncExpectation.factory(options); }
      expect(f).toThrowError('expectAsync is unavailable because the environment does not support promises.');
    });

    it('throws an Error if the argument is not a promise', function() {
      jasmine.getEnv().requirePromises();
      function f() {
        jasmineUnderTest.AsyncExpectation.factory({actual: 'not a promise'});
      }
      expect(f).toThrowError('Expected expectAsync to be called with a promise.');
    });
  });

  describe('#toBeResolved', function() {
    it('passes if the actual is resolved', function() {
      jasmine.getEnv().requirePromises();
      var addExpectationResult = jasmine.createSpy('addExpectationResult'),
        actual = Promise.resolve(),
        expectation = new jasmineUnderTest.AsyncExpectation({
          util: jasmineUnderTest.matchersUtil,
          actual: actual,
          addExpectationResult: addExpectationResult
        });

      return expectation.toBeResolved().then(function() {
        expect(addExpectationResult).toHaveBeenCalledWith(true, {
          matcherName: 'toBeResolved',
          passed: true,
          message: '',
          error: undefined,
          errorForStack: jasmine.any(Error),
          actual: actual
        });
      });
    });

    it('fails if the actual is rejected', function() {
      jasmine.getEnv().requirePromises();
      var addExpectationResult = jasmine.createSpy('addExpectationResult'),
        actual = Promise.reject('AsyncExpectationSpec rejection'),
        expectation = new jasmineUnderTest.AsyncExpectation({
          util: jasmineUnderTest.matchersUtil,
          actual: actual,
          addExpectationResult: addExpectationResult
        });

      return expectation.toBeResolved().then(function() {
        expect(addExpectationResult).toHaveBeenCalledWith(false, {
          matcherName: 'toBeResolved',
          passed: false,
          message: 'Expected a promise to be resolved.',
          error: undefined,
          errorForStack: jasmine.any(Error),
          actual: actual
        });
      });
    });
  });

  describe('#toBeRejected', function() {
    it('passes if the actual is rejected', function() {
      jasmine.getEnv().requirePromises();
      var addExpectationResult = jasmine.createSpy('addExpectationResult'),
        actual = Promise.reject('AsyncExpectationSpec rejection'),
        expectation = new jasmineUnderTest.AsyncExpectation({
          util: jasmineUnderTest.matchersUtil,
          actual: actual,
          addExpectationResult: addExpectationResult
        });

      return expectation.toBeRejected().then(function() {
        expect(addExpectationResult).toHaveBeenCalledWith(true, {
          matcherName: 'toBeRejected',
          passed: true,
          message: '',
          error: undefined,
          errorForStack: jasmine.any(Error),
          actual: actual
        });
      });
    });

    it('fails if the actual is resolved', function() {
      jasmine.getEnv().requirePromises();
      var addExpectationResult = jasmine.createSpy('addExpectationResult'),
        actual = Promise.resolve(),
        expectation = new jasmineUnderTest.AsyncExpectation({
          util: jasmineUnderTest.matchersUtil,
          actual: actual,
          addExpectationResult: addExpectationResult
        });

      return expectation.toBeRejected().then(function() {
        expect(addExpectationResult).toHaveBeenCalledWith(false, {
          matcherName: 'toBeRejected',
          passed: false,
          message: 'Expected a promise to be rejected.',
          error: undefined,
          errorForStack: jasmine.any(Error),
          actual: actual
        });
      });
    });
  });

  describe('#toBeResolvedTo', function() {
    it('passes if the promise is resolved to the expected value', function() {
      jasmine.getEnv().requirePromises();

      var actual = Promise.resolve({foo: 42});
      var addExpectationResult = jasmine.createSpy('addExpectationResult'),
        expectation = new jasmineUnderTest.AsyncExpectation({
          util: jasmineUnderTest.matchersUtil,
          actual: actual,
          addExpectationResult: addExpectationResult
        });

      return expectation.toBeResolvedTo({foo: 42}).then(function() {
        expect(addExpectationResult).toHaveBeenCalledWith(true, {
          matcherName: 'toBeResolvedTo',
          passed: true,
          message: '',
          error: undefined,
          errorForStack: jasmine.any(Error),
          actual: actual
        });
      });
    });

    it('fails if the promise is rejected', function() {
      jasmine.getEnv().requirePromises();

      var actual = Promise.reject('AsyncExpectationSpec error');
      var addExpectationResult = jasmine.createSpy('addExpectationResult'),
        expectation = new jasmineUnderTest.AsyncExpectation({
          util: jasmineUnderTest.matchersUtil,
          actual: actual,
          addExpectationResult: addExpectationResult
        });

      return expectation.toBeResolvedTo('').then(function() {
        expect(addExpectationResult).toHaveBeenCalledWith(false, {
          matcherName: 'toBeResolvedTo',
          passed: false,
          message: "Expected a promise to be resolved to '' but it was rejected.",
          error: undefined,
          errorForStack: jasmine.any(Error),
          actual: actual
        });
      });
    });

    it('fails if the promise is resolved to a different value', function() {
      jasmine.getEnv().requirePromises();

      var actual = Promise.resolve({foo: 17});
      var addExpectationResult = jasmine.createSpy('addExpectationResult'),
        expectation = new jasmineUnderTest.AsyncExpectation({
          util: jasmineUnderTest.matchersUtil,
          actual: actual,
          addExpectationResult: addExpectationResult
        });

      return expectation.toBeResolvedTo({foo: 42}).then(function() {
        expect(addExpectationResult).toHaveBeenCalledWith(false, {
          matcherName: 'toBeResolvedTo',
          passed: false,
          message: 'Expected a promise to be resolved to Object({ foo: 42 }) but it was resolved to Object({ foo: 17 }).',
          error: undefined,
          errorForStack: jasmine.any(Error),
          actual: actual
        });
      });
    });

  });

  describe('#toBeRejectedWith', function() {
    it('passes if the promise is resolved to the expected value', function() {
      jasmine.getEnv().requirePromises();

      var actual = Promise.resolve({foo: 42});
      var addExpectationResult = jasmine.createSpy('addExpectationResult'),
        expectation = new jasmineUnderTest.AsyncExpectation({
          util: jasmineUnderTest.matchersUtil,
          actual: actual,
          addExpectationResult: addExpectationResult
        });

      return expectation.toBeRejectedWith({foo: 42}).then(function() {
        expect(addExpectationResult).toHaveBeenCalledWith(true, {
          matcherName: 'toBeRejectedWith',
          passed: true,
          message: '',
          error: undefined,
          errorForStack: jasmine.any(Error),
          actual: actual
        });
      });
    });

    it('fails if the promise is resolved to a different value', function() {
      jasmine.getEnv().requirePromises();

      var actual = Promise.resolve({foo: 17});
      var addExpectationResult = jasmine.createSpy('addExpectationResult'),
        expectation = new jasmineUnderTest.AsyncExpectation({
          util: jasmineUnderTest.matchersUtil,
          actual: actual,
          addExpectationResult: addExpectationResult
        });

      return expectation.toBeRejectedWith({foo: 42}).then(function() {
        expect(addExpectationResult).toHaveBeenCalledWith(false, {
          matcherName: 'toBeRejectedWith',
          passed: false,
          message: 'Expected a promise to be rejected with Object({ foo: 42 }) but it was rejected with Object({ foo: 17 }).',
          error: undefined,
          errorForStack: jasmine.any(Error),
          actual: actual
        });
      });
    });
  });
  
  describe('#not', function() {
    it('converts a pass to a fail', function() {
      jasmine.getEnv().requirePromises();

      var addExpectationResult = jasmine.createSpy('addExpectationResult'),
        actual = Promise.resolve(),
        expectation = jasmineUnderTest.AsyncExpectation.factory({
          util: jasmineUnderTest.matchersUtil,
          actual: actual,
          addExpectationResult: addExpectationResult
        });

      return expectation.not.toBeResolved().then(function() {
        expect(addExpectationResult).toHaveBeenCalledWith(false, 
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
        expectation = jasmineUnderTest.AsyncExpectation.factory({
          util: jasmineUnderTest.matchersUtil,
          actual: actual,
          addExpectationResult: addExpectationResult
        });

      return expectation.not.toBeResolved().then(function() {
        expect(addExpectationResult).toHaveBeenCalledWith(true, 
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
    var error = new Error('AsyncExpectationSpec failure');

    spyOn(jasmineUnderTest.AsyncExpectation.prototype, 'toBeResolved')
      .and.returnValue(Promise.reject(error));

    var addExpectationResult = jasmine.createSpy('addExpectationResult'),
      actual = dummyPromise(),
      expectation = new jasmineUnderTest.AsyncExpectation({
        actual: actual,
        addExpectationResult: addExpectationResult
      });

    return expectation.toBeResolved()
      .then(
        function() { fail('Expected a rejection'); },
        function(e) { expect(e).toBe(error); }
      );
  });

  function dummyPromise() {
    return new Promise(function(resolve, reject) {
    });
  }
});
