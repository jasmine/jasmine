describe('toBeRejected', function() {
  it('passes if the actual is rejected', function() {
    const matchersUtil = new privateUnderTest.MatchersUtil();
    const matcher = privateUnderTest.asyncMatchers.toBeRejected(matchersUtil);
    const actual = Promise.reject('AsyncExpectationSpec rejection');

    return matcher.compare(actual).then(function(result) {
      expect(result).toEqual(jasmine.objectContaining({ pass: true }));
    });
  });

  it('fails if the actual is resolved', function() {
    const matchersUtil = new privateUnderTest.MatchersUtil();
    const matcher = privateUnderTest.asyncMatchers.toBeRejected(matchersUtil);
    const actual = Promise.resolve();

    return matcher.compare(actual).then(function(result) {
      expect(result).toEqual(jasmine.objectContaining({ pass: false }));
    });
  });

  it('fails if actual is not a promise', function() {
    const matchersUtil = new privateUnderTest.MatchersUtil();
    const matcher = privateUnderTest.asyncMatchers.toBeRejected(matchersUtil);
    const actual = 'not a promise';

    function f() {
      return matcher.compare(actual);
    }

    expect(f).toThrowError(
      'Expected toBeRejected to be called on a promise but was on a string.'
    );
  });
});
