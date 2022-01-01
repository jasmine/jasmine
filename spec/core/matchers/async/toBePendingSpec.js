describe('toBePending', function() {
  it('passes if the actual promise is pending', function() {
    var matchersUtil = new jasmineUnderTest.MatchersUtil(),
      matcher = jasmineUnderTest.asyncMatchers.toBePending(matchersUtil),
      actual = new Promise(function() {});

    return matcher.compare(actual).then(function(result) {
      expect(result).toEqual(jasmine.objectContaining({ pass: true }));
    });
  });

  it('fails if the actual promise is resolved', function() {
    var matchersUtil = new jasmineUnderTest.MatchersUtil(),
      matcher = jasmineUnderTest.asyncMatchers.toBePending(matchersUtil),
      actual = Promise.resolve();

    return matcher.compare(actual).then(function(result) {
      expect(result).toEqual(jasmine.objectContaining({ pass: false }));
    });
  });

  it('fails if the actual promise is rejected', function() {
    var matchersUtil = new jasmineUnderTest.MatchersUtil(),
      matcher = jasmineUnderTest.asyncMatchers.toBePending(matchersUtil),
      actual = Promise.reject(new Error('promise was rejected'));

    return matcher.compare(actual).then(function(result) {
      expect(result).toEqual(jasmine.objectContaining({ pass: false }));
    });
  });

  it('fails if actual is not a promise', function() {
    var matchersUtil = new jasmineUnderTest.MatchersUtil(),
      matcher = jasmineUnderTest.asyncMatchers.toBePending(matchersUtil),
      actual = 'not a promise';

    function f() {
      return matcher.compare(actual);
    }

    expect(f).toThrowError('Expected toBePending to be called on a promise.');
  });
});
