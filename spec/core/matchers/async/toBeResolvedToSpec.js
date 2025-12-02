describe('#toBeResolvedTo', function() {
  it('passes if the promise is resolved to the expected value', function() {
    const matchersUtil = new privateUnderTest.MatchersUtil(),
      matcher = privateUnderTest.asyncMatchers.toBeResolvedTo(matchersUtil),
      actual = Promise.resolve({ foo: 42 });

    return matcher.compare(actual, { foo: 42 }).then(function(result) {
      expect(result).toEqual(jasmine.objectContaining({ pass: true }));
    });
  });

  it('fails if the promise is rejected', function() {
    const matchersUtil = new privateUnderTest.MatchersUtil({
        pp: privateUnderTest.makePrettyPrinter()
      }),
      matcher = privateUnderTest.asyncMatchers.toBeResolvedTo(matchersUtil),
      actual = Promise.reject(new Error('AsyncExpectationSpec error'));

    return matcher.compare(actual, '').then(function(result) {
      expect(result).toEqual(
        jasmine.objectContaining({
          pass: false,
          message:
            "Expected a promise to be resolved to '' but it was rejected " +
            'with Error: AsyncExpectationSpec error.'
        })
      );
    });
  });

  it('fails if the promise is resolved to a different value', function() {
    const matchersUtil = new privateUnderTest.MatchersUtil({
        pp: privateUnderTest.makePrettyPrinter()
      }),
      matcher = privateUnderTest.asyncMatchers.toBeResolvedTo(matchersUtil),
      actual = Promise.resolve({ foo: 17 });

    return matcher.compare(actual, { foo: 42 }).then(function(result) {
      expect(result).toEqual(
        jasmine.objectContaining({
          pass: false,
          message:
            'Expected a promise to be resolved to Object({ foo: 42 }) but it was resolved to Object({ foo: 17 }).'
        })
      );
    });
  });

  it('builds its message correctly when negated', function() {
    const matchersUtil = new privateUnderTest.MatchersUtil({
        pp: privateUnderTest.makePrettyPrinter()
      }),
      matcher = privateUnderTest.asyncMatchers.toBeResolvedTo(matchersUtil),
      actual = Promise.resolve(true);

    return matcher.compare(actual, true).then(function(result) {
      expect(result).toEqual(
        jasmine.objectContaining({
          pass: true,
          message: 'Expected a promise not to be resolved to true.'
        })
      );
    });
  });

  it('supports custom equality testers', function() {
    const customEqualityTesters = [
        function() {
          return true;
        }
      ],
      matchersUtil = new privateUnderTest.MatchersUtil({
        customTesters: customEqualityTesters,
        pp: privateUnderTest.makePrettyPrinter()
      }),
      matcher = privateUnderTest.asyncMatchers.toBeResolvedTo(matchersUtil),
      actual = Promise.resolve('actual');

    return matcher.compare(actual, 'expected').then(function(result) {
      expect(result).toEqual(jasmine.objectContaining({ pass: true }));
    });
  });

  it('fails if actual is not a promise', function() {
    const matchersUtil = new privateUnderTest.MatchersUtil({
        pp: privateUnderTest.makePrettyPrinter()
      }),
      matcher = privateUnderTest.asyncMatchers.toBeResolvedTo(matchersUtil),
      actual = 'not a promise';

    function f() {
      return matcher.compare(actual);
    }

    expect(f).toThrowError(
      'Expected toBeResolvedTo to be called on a promise but was on a string.'
    );
  });
});
