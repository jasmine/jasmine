describe('#toBeRejectedWithMatching', function() {
  it('passes when the predicate returns true', function() {
    const matchersUtil = new privateUnderTest.MatchersUtil({
        pp: privateUnderTest.makePrettyPrinter()
      }),
      matcher = privateUnderTest.asyncMatchers.toBeRejectedWithMatching(matchersUtil),
      actual = Promise.reject(new Error('Something went wrong'));

    return matcher.compare(actual, function(err) {
      return err.message.includes('wrong');
    }).then(function(result) {
      expect(result).toEqual(jasmine.objectContaining({ pass: true }));
    });
  });

  it('fails when the predicate returns false', function() {
    const matchersUtil = new privateUnderTest.MatchersUtil({
        pp: privateUnderTest.makePrettyPrinter()
      }),
      matcher = privateUnderTest.asyncMatchers.toBeRejectedWithMatching(matchersUtil),
      actual = Promise.reject(new Error('Something went wrong'));

    return matcher.compare(actual, function(err) {
      return err.message.includes('completely different');
    }).then(function(result) {
      expect(result).toEqual(
        jasmine.objectContaining({
          pass: false,
          message: jasmine.stringContaining('Expected a promise to be rejected with a matching error')
        })
      );
    });
  });

  it('fails if the promise resolves', function() {
    const matchersUtil = new privateUnderTest.MatchersUtil({
        pp: privateUnderTest.makePrettyPrinter()
      }),
      matcher = privateUnderTest.asyncMatchers.toBeRejectedWithMatching(matchersUtil),
      actual = Promise.resolve('success');

    return matcher.compare(actual, function() { return true; }).then(function(result) {
      expect(result).toEqual(
        jasmine.objectContaining({
          pass: false,
          message: 'Expected a promise to be rejected with a matching error but it was resolved.'
        })
      );
    });
  });

  it('throws if actual is not a promise', function() {
    const matchersUtil = new privateUnderTest.MatchersUtil({
        pp: privateUnderTest.makePrettyPrinter()
      }),
      matcher = privateUnderTest.asyncMatchers.toBeRejectedWithMatching(matchersUtil),
      actual = 'not a promise';

    function f() {
      return matcher.compare(actual, function() { return true; });
    }

    expect(f).toThrowError(
      'Expected toBeRejectedWithMatching to be called on a promise.'
    );
  });

  it('throws if predicate is not a function', function() {
    const matchersUtil = new privateUnderTest.MatchersUtil({
        pp: privateUnderTest.makePrettyPrinter()
      }),
      matcher = privateUnderTest.asyncMatchers.toBeRejectedWithMatching(matchersUtil),
      actual = Promise.reject(new Error('test'));

    function f() {
      return matcher.compare(actual, 'not a function');
    }

    expect(f).toThrowError('Expected a predicate function to be passed to toBeRejectedWithMatching.');
  });

  it('builds its error correctly when negated (pass is true)', function() {
    const matchersUtil = new privateUnderTest.MatchersUtil({
        pp: privateUnderTest.makePrettyPrinter()
      }),
      matcher = privateUnderTest.asyncMatchers.toBeRejectedWithMatching(matchersUtil),
      actual = Promise.reject(new Error('expected error'));

    return matcher.compare(actual, function(err) {
      return err.message === 'expected error';
    }).then(function(result) {
      expect(result).toEqual(
        jasmine.objectContaining({
          pass: true,
          message: 'Expected a promise not to be rejected with a matching error.'
        })
      );
    });
  });
});
