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

  describe('#toBeRejectedWith', function () {
    it('should return true if the promise is rejected with the expected value', function () {
      jasmine.getEnv().requirePromises();

      var actual = Promise.reject({error: 'PEBCAK'});
      var addExpectationResult = jasmine.createSpy('addExpectationResult'),
        expectation = new jasmineUnderTest.AsyncExpectation({
          util: jasmineUnderTest.matchersUtil,
          actual: actual,
          addExpectationResult: addExpectationResult
        });

      return expectation.toBeRejectedWith({error: 'PEBCAK'}).then(function () {
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

    it('should fail if the promise resolves', function () {
      jasmine.getEnv().requirePromises();

      var actual = Promise.resolve('AsyncExpectation error');
      var addExpectationResult = jasmine.createSpy('addExpectationResult'),
        expectation = new jasmineUnderTest.AsyncExpectation({
          util: jasmineUnderTest.matchersUtil,
          actual: actual,
          addExpectationResult: addExpectationResult
        });

      return expectation.toBeRejectedWith('').then(function () {
        expect(addExpectationResult).toHaveBeenCalledWith(false, {
          matcherName: 'toBeRejectedWith',
          passed: false,
          message: "Expected a promise to be rejected with '' but it was resolved.",
          error: undefined,
          errorForStack: jasmine.any(Error),
          actual: actual
        });
      });
    });

    it('should fail if the promise is rejected with a different value', function () {
      jasmine.getEnv().requirePromises();

      var actual = Promise.reject('A Bad Apple');
      var addExpectationResult = jasmine.createSpy('addExpectationResult'),
        expectation = new jasmineUnderTest.AsyncExpectation({
          util: jasmineUnderTest.matchersUtil,
          actual: actual,
          addExpectationResult: addExpectationResult
        });

      return expectation.toBeRejectedWith('Some Cool Thing').then(function () {
        expect(addExpectationResult).toHaveBeenCalledWith(false, {
          matcherName: 'toBeRejectedWith',
          passed: false,
          message: "Expected a promise to be rejected with 'Some Cool Thing' but it was rejected with 'A Bad Apple'.",
          error: undefined,
          errorForStack: jasmine.any(Error),
          actual: actual
        });
      });
    });

    it('should build its error correctly when negated', function () {
      jasmine.getEnv().requirePromises();

      var addExpectationResult = jasmine.createSpy('addExpectationResult'),
        expectation = jasmineUnderTest.AsyncExpectation.factory({
          util: jasmineUnderTest.matchersUtil,
          actual: Promise.reject(true),
          addExpectationResult: addExpectationResult
        });

      return expectation.not.toBeRejectedWith(true).then(function () {
        expect(addExpectationResult).toHaveBeenCalledWith(false,
          jasmine.objectContaining({
            passed: false,
            message: 'Expected a promise not to be rejected with true.'
          })
        );
      });
    });

    it('should support custom equality testers', function () {
      jasmine.getEnv().requirePromises();

      var addExpectationResult = jasmine.createSpy('addExpectationResult'),
        expectation = new jasmineUnderTest.AsyncExpectation({
          util: jasmineUnderTest.matchersUtil,
          customEqualityTesters: [function() { return true; }],
          actual: Promise.reject('actual'),
          addExpectationResult: addExpectationResult
        });

      return expectation.toBeRejectedWith('expected').then(function() {
        expect(addExpectationResult).toHaveBeenCalledWith(true,
          jasmine.objectContaining({passed: true}));
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

    it('builds its message correctly when negated', function() {
      jasmine.getEnv().requirePromises();

      var addExpectationResult = jasmine.createSpy('addExpectationResult'),
        expectation = jasmineUnderTest.AsyncExpectation.factory({
          util: jasmineUnderTest.matchersUtil,
          actual: Promise.resolve(true),
          addExpectationResult: addExpectationResult
        });

      return expectation.not.toBeResolvedTo(true).then(function() {
        expect(addExpectationResult).toHaveBeenCalledWith(false,
          jasmine.objectContaining({
            passed: false,
            message: 'Expected a promise not to be resolved to true.'
          })
        );
      });
    });

    it('supports custom equality testers', function() {
      jasmine.getEnv().requirePromises();

      var addExpectationResult = jasmine.createSpy('addExpectationResult'),
        expectation = new jasmineUnderTest.AsyncExpectation({
          util: jasmineUnderTest.matchersUtil,
          customEqualityTesters: [function() { return true; }],
          actual: Promise.resolve('actual'),
          addExpectationResult: addExpectationResult
        });

      return expectation.toBeResolvedTo('expected').then(function() {
        expect(addExpectationResult).toHaveBeenCalledWith(true,
          jasmine.objectContaining({passed: true}));
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
