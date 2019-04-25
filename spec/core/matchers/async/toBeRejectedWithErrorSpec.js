describe('#toBeRejectedWithError', function () {
  it('passes when Error type matches', function () {
    jasmine.getEnv().requirePromises();

    var matcher = jasmineUnderTest.asyncMatchers.toBeRejectedWithError(jasmineUnderTest.matchersUtil),
      actual = Promise.reject(new TypeError('foo'));

    return matcher.compare(actual, TypeError).then(function (result) {
      expect(result).toEqual(jasmine.objectContaining({ pass: true }));
    });
  });

  it('passes when Error type and message matches', function () {
    jasmine.getEnv().requirePromises();

    var matcher = jasmineUnderTest.asyncMatchers.toBeRejectedWithError(jasmineUnderTest.matchersUtil),
      actual = Promise.reject(new TypeError('foo'));

    return matcher.compare(actual, TypeError, 'foo').then(function (result) {
      expect(result).toEqual(jasmine.objectContaining({ pass: true }));
    });
  });

  it('passes when Error message matches a string', function () {
    jasmine.getEnv().requirePromises();

    var matcher = jasmineUnderTest.asyncMatchers.toBeRejectedWithError(jasmineUnderTest.matchersUtil),
      actual = Promise.reject(new Error('foo'));

    return matcher.compare(actual, 'foo').then(function (result) {
      expect(result).toEqual(jasmine.objectContaining({ pass: true }));
    });
  });

  it('passes when Error message matches a RegExp', function () {
    jasmine.getEnv().requirePromises();

    var matcher = jasmineUnderTest.asyncMatchers.toBeRejectedWithError(jasmineUnderTest.matchersUtil),
      actual = Promise.reject(new Error('foo'));

    return matcher.compare(actual, /foo/).then(function (result) {
      expect(result).toEqual(jasmine.objectContaining({ pass: true }));
    });
  });

  it('passes when Error message is empty', function () {
    jasmine.getEnv().requirePromises();

    var matcher = jasmineUnderTest.asyncMatchers.toBeRejectedWithError(jasmineUnderTest.matchersUtil),
      actual = Promise.reject(new Error());

    return matcher.compare(actual, '').then(function (result) {
      expect(result).toEqual(jasmine.objectContaining({ pass: true }));
    });
  });

  it('fails when resolved', function () {
    jasmine.getEnv().requirePromises();

    var matcher = jasmineUnderTest.asyncMatchers.toBeRejectedWithError(jasmineUnderTest.matchersUtil),
      actual = Promise.resolve(new Error('foo'));

    return matcher.compare(actual, 'foo').then(function (result) {
      expect(result).toEqual(jasmine.objectContaining({ pass: false }));
    });
  });

  it('fails when rejected with non Error type', function () {
    jasmine.getEnv().requirePromises();

    var matcher = jasmineUnderTest.asyncMatchers.toBeRejectedWithError(jasmineUnderTest.matchersUtil),
      actual = Promise.reject('foo');

    return matcher.compare(actual, 'foo').then(function (result) {
      expect(result).toEqual(jasmine.objectContaining({ pass: false }));
    });
  });

  it('fails when Error type mismatches', function () {
    jasmine.getEnv().requirePromises();

    var matcher = jasmineUnderTest.asyncMatchers.toBeRejectedWithError(jasmineUnderTest.matchersUtil),
      actual = Promise.reject(new Error('foo'));

    return matcher.compare(actual, TypeError, 'foo').then(function (result) {
      expect(result).toEqual(jasmine.objectContaining({ pass: false }));
    });
  });

  it('fails when Error message mismatches', function () {
    jasmine.getEnv().requirePromises();

    var matcher = jasmineUnderTest.asyncMatchers.toBeRejectedWithError(jasmineUnderTest.matchersUtil),
      actual = Promise.reject(new Error('foo'));

    return matcher.compare(actual, 'bar').then(function (result) {
      expect(result).toEqual(jasmine.objectContaining({ pass: false }));
    });
  });
});
