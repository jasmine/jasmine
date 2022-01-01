describe('#toBeRejectedWith', function() {
  it('should return true if the promise is rejected with the expected value', function() {
    var matchersUtil = new jasmineUnderTest.MatchersUtil(),
      matcher = jasmineUnderTest.asyncMatchers.toBeRejectedWith(matchersUtil),
      actual = Promise.reject({ error: 'PEBCAK' });

    return matcher.compare(actual, { error: 'PEBCAK' }).then(function(result) {
      expect(result).toEqual(jasmine.objectContaining({ pass: true }));
    });
  });

  it('should fail if the promise resolves', function() {
    var matchersUtil = new jasmineUnderTest.MatchersUtil(),
      matcher = jasmineUnderTest.asyncMatchers.toBeRejectedWith(matchersUtil),
      actual = Promise.resolve();

    return matcher.compare(actual, '').then(function(result) {
      expect(result).toEqual(jasmine.objectContaining({ pass: false }));
    });
  });

  it('should fail if the promise is rejected with a different value', function() {
    var matchersUtil = new jasmineUnderTest.MatchersUtil({
        pp: jasmineUnderTest.makePrettyPrinter()
      }),
      matcher = jasmineUnderTest.asyncMatchers.toBeRejectedWith(matchersUtil),
      actual = Promise.reject('A Bad Apple');

    return matcher.compare(actual, 'Some Cool Thing').then(function(result) {
      expect(result).toEqual(
        jasmine.objectContaining({
          pass: false,
          message:
            "Expected a promise to be rejected with 'Some Cool Thing' but it was rejected with 'A Bad Apple'."
        })
      );
    });
  });

  it('should build its error correctly when negated', function() {
    var matchersUtil = new jasmineUnderTest.MatchersUtil({
        pp: jasmineUnderTest.makePrettyPrinter()
      }),
      matcher = jasmineUnderTest.asyncMatchers.toBeRejectedWith(matchersUtil),
      actual = Promise.reject(true);

    return matcher.compare(actual, true).then(function(result) {
      expect(result).toEqual(
        jasmine.objectContaining({
          pass: true,
          message: 'Expected a promise not to be rejected with true.'
        })
      );
    });
  });

  it('should support custom equality testers', function() {
    var customEqualityTesters = [
        function() {
          return true;
        }
      ],
      matchersUtil = new jasmineUnderTest.MatchersUtil({
        customTesters: customEqualityTesters
      }),
      matcher = jasmineUnderTest.asyncMatchers.toBeRejectedWith(matchersUtil),
      actual = Promise.reject('actual');

    return matcher.compare(actual, 'expected').then(function(result) {
      expect(result).toEqual(jasmine.objectContaining({ pass: true }));
    });
  });

  it('fails if actual is not a promise', function() {
    var matchersUtil = new jasmineUnderTest.MatchersUtil({
        pp: jasmineUnderTest.makePrettyPrinter()
      }),
      matcher = jasmineUnderTest.asyncMatchers.toBeRejectedWith(matchersUtil),
      actual = 'not a promise';

    function f() {
      return matcher.compare(actual);
    }

    expect(f).toThrowError(
      'Expected toBeRejectedWith to be called on a promise.'
    );
  });
});
