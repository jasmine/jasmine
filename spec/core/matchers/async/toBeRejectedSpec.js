describe('toBeRejected', function() {
  it('passes if the actual is rejected', function() {
    var matchersUtil = new jasmineUnderTest.MatchersUtil(),
      matcher = jasmineUnderTest.asyncMatchers.toBeRejected(matchersUtil),
      actual = Promise.reject('AsyncExpectationSpec rejection');

    return matcher.compare(actual).then(function(result) {
      expect(result).toEqual(jasmine.objectContaining({ pass: true }));
    });
  });

  it('fails if the actual is resolved', function() {
    var matchersUtil = new jasmineUnderTest.MatchersUtil(),
      matcher = jasmineUnderTest.asyncMatchers.toBeRejected(matchersUtil),
      actual = Promise.resolve();

    return matcher.compare(actual).then(function(result) {
      expect(result).toEqual(jasmine.objectContaining({ pass: false }));
    });
  });

  it('fails if actual is not a promise', function() {
    var matchersUtil = new jasmineUnderTest.MatchersUtil(),
      matcher = jasmineUnderTest.asyncMatchers.toBeRejected(matchersUtil),
      actual = 'not a promise';

    function f() {
      return matcher.compare(actual);
    }

    expect(f).toThrowError('Expected toBeRejected to be called on a promise.');
  });
});
