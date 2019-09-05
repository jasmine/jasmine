describe('toBeResolved', function() {
  it('passes if the actual is resolved', function() {
    jasmine.getEnv().requirePromises();

    var matcher = jasmineUnderTest.asyncMatchers.toBeResolved(jasmineUnderTest.matchersUtil),
      actual = Promise.resolve();

    return matcher.compare(actual).then(function(result) {
      expect(result).toEqual(jasmine.objectContaining({pass: true}));
    });
  });

  it('fails if the actual is rejected', function() {
    jasmine.getEnv().requirePromises();

    var matcher = jasmineUnderTest.asyncMatchers.toBeResolved(jasmineUnderTest.matchersUtil),
      actual = Promise.reject('AsyncExpectationSpec rejection');

    return matcher.compare(actual).then(function(result) {
      expect(result).toEqual(jasmine.objectContaining({pass: false}));
    });
  });

  it('fails if actual is not a promise', function() {
    var matcher = jasmineUnderTest.asyncMatchers.toBeResolved(jasmineUnderTest.matchersUtil),
      actual = 'not a promise';

    function f() {
      return matcher.compare(actual);
    }

    expect(f).toThrowError(
      'Expected toBeResolved to be called on a promise.'
    );
  });
});
