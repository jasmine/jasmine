describe('#toBeResolvedTo', function() {
  it('passes if the promise is resolved to the expected value', function() {
    jasmine.getEnv().requirePromises();

    var matchersUtil = new jasmineUnderTest.MatchersUtil(),
      matcher = jasmineUnderTest.asyncMatchers.toBeResolvedTo(matchersUtil),
      actual = Promise.resolve({foo: 42});

    return matcher.compare(actual, {foo: 42}).then(function(result) {
      expect(result).toEqual(jasmine.objectContaining({pass: true}));
    });
  });

  it('fails if the promise is rejected', function() {
    jasmine.getEnv().requirePromises();

    var matchersUtil = new jasmineUnderTest.MatchersUtil({pp: jasmineUnderTest.makePrettyPrinter()}),
      matcher = jasmineUnderTest.asyncMatchers.toBeResolvedTo(matchersUtil),
      actual = Promise.reject('AsyncExpectationSpec error');

    return matcher.compare(actual, '').then(function(result) {
      expect(result).toEqual(jasmine.objectContaining({
        pass: false,
        message: "Expected a promise to be resolved to '' but it was rejected.",
      }));
    });
  });

  it('fails if the promise is resolved to a different value', function() {
    jasmine.getEnv().requirePromises();

    var matchersUtil = new jasmineUnderTest.MatchersUtil({pp: jasmineUnderTest.makePrettyPrinter()}),
      matcher = jasmineUnderTest.asyncMatchers.toBeResolvedTo(matchersUtil),
      actual = Promise.resolve({foo: 17});

    return matcher.compare(actual, {foo: 42}).then(function(result) {
      expect(result).toEqual(jasmine.objectContaining({
        pass: false,
        message: 'Expected a promise to be resolved to Object({ foo: 42 }) but it was resolved to Object({ foo: 17 }).',
      }));
    });
  });

  it('builds its message correctly when negated', function() {
    jasmine.getEnv().requirePromises();

    var matchersUtil = new jasmineUnderTest.MatchersUtil({pp: jasmineUnderTest.makePrettyPrinter()}),
      matcher = jasmineUnderTest.asyncMatchers.toBeResolvedTo(matchersUtil),
      actual = Promise.resolve(true);

    return matcher.compare(actual, true).then(function(result) {
      expect(result).toEqual(jasmine.objectContaining({
        pass: true,
        message: 'Expected a promise not to be resolved to true.'
      }));
    });
  });

  it('supports custom equality testers', function() {
    jasmine.getEnv().requirePromises();

    var customEqualityTesters = [function() { return true; }],
      matchersUtil = new jasmineUnderTest.MatchersUtil({
        customTesters: customEqualityTesters,
        pp: jasmineUnderTest.makePrettyPrinter()
      }),
      matcher = jasmineUnderTest.asyncMatchers.toBeResolvedTo(matchersUtil),
      actual = Promise.resolve('actual');

    return matcher.compare(actual, 'expected').then(function(result) {
      expect(result).toEqual(jasmine.objectContaining({pass: true}));
    });
  });

  it('fails if actual is not a promise', function() {
    var matchersUtil = new jasmineUnderTest.MatchersUtil({pp: jasmineUnderTest.makePrettyPrinter()}),
      matcher = jasmineUnderTest.asyncMatchers.toBeResolvedTo(matchersUtil),
      actual = 'not a promise';

    function f() {
      return matcher.compare(actual);
    }

    expect(f).toThrowError(
      'Expected toBeResolvedTo to be called on a promise.'
    );
  });
});
