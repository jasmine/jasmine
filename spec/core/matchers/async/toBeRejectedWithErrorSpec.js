describe('#toBeRejectedWith', function () {
  it('should return true if the promise is rejected with the expected value', function () {
    jasmine.getEnv().requirePromises();

    var matcher = jasmineUnderTest.asyncMatchers.toBeRejectedWith(jasmineUnderTest.matchersUtil),
      actual = Promise.reject({error: 'PEBCAK'});

    return matcher.compare(actual, {error: 'PEBCAK'}).then(function (result) {
      expect(result).toEqual(jasmine.objectContaining({ pass: true }));
    });
  });

  it('should fail if the promise resolves', function () {
    jasmine.getEnv().requirePromises();

    var matcher = jasmineUnderTest.asyncMatchers.toBeRejectedWith(jasmineUnderTest.matchersUtil),
      actual = Promise.resolve();

    return matcher.compare(actual, '').then(function (result) {
      expect(result).toEqual(jasmine.objectContaining({ pass: false }));
    });
  });

  it('should fail if the promise is rejected with a different value', function () {
    jasmine.getEnv().requirePromises();

    var matcher = jasmineUnderTest.asyncMatchers.toBeRejectedWith(jasmineUnderTest.matchersUtil),
      actual = Promise.reject('A Bad Apple');

    return matcher.compare(actual, 'Some Cool Thing').then(function (result) {
      expect(result).toEqual(jasmine.objectContaining({
        pass: false,
        message: "Expected a promise to be rejected with 'Some Cool Thing' but it was rejected with 'A Bad Apple'.",
      }));
    });
  });

  it('should build its error correctly when negated', function () {
    jasmine.getEnv().requirePromises();

    var matcher = jasmineUnderTest.asyncMatchers.toBeRejectedWith(jasmineUnderTest.matchersUtil),
      actual = Promise.reject(true);

    return matcher.compare(actual, true).then(function (result) {
      expect(result).toEqual(jasmine.objectContaining({
        pass: true,
        message: 'Expected a promise not to be rejected with true.'
      }));
    });
  });

  it('should support custom equality testers', function () {
    jasmine.getEnv().requirePromises();

    var customEqualityTesters = [function() { return true; }],
      matcher = jasmineUnderTest.asyncMatchers.toBeRejectedWith(jasmineUnderTest.matchersUtil, customEqualityTesters),
      actual = Promise.reject('actual');

    return matcher.compare(actual, 'expected').then(function(result) {
      expect(result).toEqual(jasmine.objectContaining({pass: true}));
    });
  });
});
