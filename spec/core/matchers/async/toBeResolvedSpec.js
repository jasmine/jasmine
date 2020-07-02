/* eslint-disable compat/compat */
describe('toBeResolved', function() {
  it('passes if the actual is resolved', function() {
    jasmine.getEnv().requirePromises();

    var matchersUtil = new jasmineUnderTest.MatchersUtil(),
      matcher = jasmineUnderTest.asyncMatchers.toBeResolved(matchersUtil),
      actual = Promise.resolve();

    return matcher.compare(actual).then(function(result) {
      expect(result).toEqual(jasmine.objectContaining({pass: true}));
    });
  });

  it('fails if the actual is rejected', function() {
    jasmine.getEnv().requirePromises();

    var matchersUtil = new jasmineUnderTest.MatchersUtil(),
      matcher = jasmineUnderTest.asyncMatchers.toBeResolved(matchersUtil),
      actual = Promise.reject('AsyncExpectationSpec rejection');

    return matcher.compare(actual).then(function(result) {
      expect(result).toEqual(jasmine.objectContaining({pass: false}));
    });
  });

  it('fails if actual is not a promise', function() {
    var matchersUtil = new jasmineUnderTest.MatchersUtil(),
      matcher = jasmineUnderTest.asyncMatchers.toBeResolved(matchersUtil),
      actual = 'not a promise';

    function f() {
      return matcher.compare(actual);
    }

    expect(f).toThrowError(
      'Expected toBeResolved to be called on a promise.'
    );
  });
});
