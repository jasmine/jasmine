describe('#toBeRejectedWithError', function () {
  it('passes when Error type matches', function () {
    jasmine.getEnv().requirePromises();

    var matcher = jasmineUnderTest.asyncMatchers.toBeRejectedWithError(jasmineUnderTest.matchersUtil),
      actual = Promise.reject(new TypeError('foo'));

    return matcher.compare(actual, TypeError).then(function (result) {
      expect(result).toEqual(jasmine.objectContaining({
        pass: true,
        message: 'Expected a promise not to be rejected with TypeError, but it was.'
      }));
    });
  });

  it('passes when Error type and message matches', function () {
    jasmine.getEnv().requirePromises();

    var matcher = jasmineUnderTest.asyncMatchers.toBeRejectedWithError(jasmineUnderTest.matchersUtil),
      actual = Promise.reject(new TypeError('foo'));

    return matcher.compare(actual, TypeError, 'foo').then(function (result) {
      expect(result).toEqual(jasmine.objectContaining({
        pass: true,
        message: 'Expected a promise not to be rejected with TypeError: \'foo\', but it was.'
      }));
    });
  });

  it('passes when Error message matches a string', function () {
    jasmine.getEnv().requirePromises();

    var matcher = jasmineUnderTest.asyncMatchers.toBeRejectedWithError(jasmineUnderTest.matchersUtil),
      actual = Promise.reject(new Error('foo'));

    return matcher.compare(actual, 'foo').then(function (result) {
      expect(result).toEqual(jasmine.objectContaining({
        pass: true,
        message: 'Expected a promise not to be rejected with Error: \'foo\', but it was.'
      }));
    });
  });

  it('passes when Error message matches a RegExp', function () {
    jasmine.getEnv().requirePromises();

    var matcher = jasmineUnderTest.asyncMatchers.toBeRejectedWithError(jasmineUnderTest.matchersUtil),
      actual = Promise.reject(new Error('foo'));

    return matcher.compare(actual, /foo/).then(function (result) {
      expect(result).toEqual(jasmine.objectContaining({
        pass: true,
        message: 'Expected a promise not to be rejected with Error: /foo/, but it was.'
      }));
    });
  });

  it('passes when Error message is empty', function () {
    jasmine.getEnv().requirePromises();

    var matcher = jasmineUnderTest.asyncMatchers.toBeRejectedWithError(jasmineUnderTest.matchersUtil),
      actual = Promise.reject(new Error());

    return matcher.compare(actual, '').then(function (result) {
      expect(result).toEqual(jasmine.objectContaining({
        pass: true,
        message: 'Expected a promise not to be rejected with Error: \'\', but it was.'
      }));
    });
  });

  it('passes when no arguments', function () {
    jasmine.getEnv().requirePromises();

    var matcher = jasmineUnderTest.asyncMatchers.toBeRejectedWithError(jasmineUnderTest.matchersUtil),
      actual = Promise.reject(new Error());

    return matcher.compare(actual, void 0).then(function (result) {
      expect(result).toEqual(jasmine.objectContaining({
        pass: true,
        message: 'Expected a promise not to be rejected with Error, but it was.'
      }));
    });
  });

  it('fails when resolved', function () {
    jasmine.getEnv().requirePromises();

    var matcher = jasmineUnderTest.asyncMatchers.toBeRejectedWithError(jasmineUnderTest.matchersUtil),
      actual = Promise.resolve(new Error('foo'));

    return matcher.compare(actual, 'foo').then(function (result) {
      expect(result).toEqual(jasmine.objectContaining({
        pass: false,
        message: 'Expected a promise to be rejected but it was resolved.'
      }));
    });
  });

  it('fails when rejected with non Error type', function () {
    jasmine.getEnv().requirePromises();

    var matcher = jasmineUnderTest.asyncMatchers.toBeRejectedWithError(jasmineUnderTest.matchersUtil),
      actual = Promise.reject('foo');

    return matcher.compare(actual, 'foo').then(function (result) {
      expect(result).toEqual(jasmine.objectContaining({
        pass: false,
        message: 'Expected a promise to be rejected with Error: \'foo\' but it was rejected with \'foo\'.'
      }));
    });
  });

  it('fails when Error type mismatches', function () {
    jasmine.getEnv().requirePromises();

    var matcher = jasmineUnderTest.asyncMatchers.toBeRejectedWithError(jasmineUnderTest.matchersUtil),
      actual = Promise.reject(new Error('foo'));

    return matcher.compare(actual, TypeError, 'foo').then(function (result) {
      expect(result).toEqual(jasmine.objectContaining({
        pass: false,
        message: 'Expected a promise to be rejected with TypeError: \'foo\' but it was rejected with type Error.'
      }));
    });
  });

  it('fails when Error message mismatches', function () {
    jasmine.getEnv().requirePromises();

    var matcher = jasmineUnderTest.asyncMatchers.toBeRejectedWithError(jasmineUnderTest.matchersUtil),
      actual = Promise.reject(new Error('foo'));

    return matcher.compare(actual, 'bar').then(function (result) {
      expect(result).toEqual(jasmine.objectContaining({
        pass: false,
        message: 'Expected a promise to be rejected with Error: \'bar\' but it was rejected with Error: foo.'
      }));
    });
  });
});
