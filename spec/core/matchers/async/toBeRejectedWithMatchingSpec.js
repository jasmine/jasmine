describe('#toBeRejectedWithMatching', function() {
  it('passes if the promise is rejected with something matching the predicate', function() {
    const matcher = privateUnderTest.asyncMatchers.toBeRejectedWithMatching(),
      actual = Promise.reject(new Error('nope')),
      predicate = value => value.message === 'nope';

    return matcher.compare(actual, predicate).then(function(result) {
      expect(result).toEqual(jasmine.objectContaining({ pass: true }));
    });
  });

  it('fails if the promise resolves', function() {
    const matcher = privateUnderTest.asyncMatchers.toBeRejectedWithMatching(),
      actual = Promise.resolve(),
      predicate = () => true;

    return matcher.compare(actual, predicate).then(function(result) {
      expect(result).toEqual(jasmine.objectContaining({ pass: false }));
    });
  });

  it('fails if the promise is rejected with something not matching the predicate', function() {
    const matcher = privateUnderTest.asyncMatchers.toBeRejectedWithMatching(),
      actual = Promise.reject('A Bad Apple'),
      predicate = value => value === 'A Good Orange';

    return matcher.compare(actual, predicate).then(function(result) {
      expect(result).toEqual(
        jasmine.objectContaining({
          pass: false,
          message:
            'Expected a promise to be rejected matching a predicate, but the predicate returned "false".'
        })
      );
    });
  });

  it('should build its error correctly when negated', function() {
    const matcher = privateUnderTest.asyncMatchers.toBeRejectedWithMatching(),
      actual = Promise.reject(true),
      predicate = () => true;

    return matcher.compare(actual, predicate).then(function(result) {
      expect(result).toEqual(
        jasmine.objectContaining({
          pass: true,
          message:
            'Expected a promise not to be rejected matching a predicate, but the predicate returned "true".'
        })
      );
    });
  });

  it('fails if actual is not a promise', function() {
    const matcher = privateUnderTest.asyncMatchers.toBeRejectedWithMatching(),
      actual = 'not a promise';

    function f() {
      return matcher.compare(actual);
    }

    expect(f).toThrowError(
      'Expected toBeRejectedWithMatching to be called on a promise but was on a string.'
    );
  });

  it('fails if predicate is not a function', function() {
    const matcher = privateUnderTest.asyncMatchers.toBeRejectedWithMatching(),
      actual = Promise.resolve(),
      predicate = 'not a function';

    function f() {
      return matcher.compare(actual, predicate);
    }

    expect(f).toThrowError(/Predicate is not a Function/);
  });
});
