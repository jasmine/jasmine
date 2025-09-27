describe('#toBeRejectedWithError', function() {
  it('passes when Error type matches', function() {
    const matchersUtil = new privateUnderTest.MatchersUtil({
        pp: privateUnderTest.makePrettyPrinter()
      }),
      matcher = privateUnderTest.asyncMatchers.toBeRejectedWithError(
        matchersUtil
      ),
      actual = Promise.reject(new TypeError('foo'));

    return matcher.compare(actual, TypeError).then(function(result) {
      expect(result).toEqual(
        jasmine.objectContaining({
          pass: true,
          message:
            'Expected a promise not to be rejected with TypeError, but it was.'
        })
      );
    });
  });

  it('passes when Error type and message matches', function() {
    const matchersUtil = new privateUnderTest.MatchersUtil({
        pp: privateUnderTest.makePrettyPrinter()
      }),
      matcher = privateUnderTest.asyncMatchers.toBeRejectedWithError(
        matchersUtil
      ),
      actual = Promise.reject(new TypeError('foo'));

    return matcher.compare(actual, TypeError, 'foo').then(function(result) {
      expect(result).toEqual(
        jasmine.objectContaining({
          pass: true,
          message:
            "Expected a promise not to be rejected with TypeError: 'foo', but it was."
        })
      );
    });
  });

  it('passes when Error matches and is exactly Error', function() {
    const matchersUtil = new privateUnderTest.MatchersUtil({
        pp: privateUnderTest.makePrettyPrinter()
      }),
      matcher = privateUnderTest.asyncMatchers.toBeRejectedWithError(
        matchersUtil
      ),
      actual = Promise.reject(new Error());

    return matcher.compare(actual, Error).then(function(result) {
      expect(result).toEqual(
        jasmine.objectContaining({
          pass: true,
          message:
            'Expected a promise not to be rejected with Error, but it was.'
        })
      );
    });
  });

  it('passes when Error message matches a string', function() {
    const matchersUtil = new privateUnderTest.MatchersUtil({
        pp: privateUnderTest.makePrettyPrinter()
      }),
      matcher = privateUnderTest.asyncMatchers.toBeRejectedWithError(
        matchersUtil
      ),
      actual = Promise.reject(new Error('foo'));

    return matcher.compare(actual, 'foo').then(function(result) {
      expect(result).toEqual(
        jasmine.objectContaining({
          pass: true,
          message:
            "Expected a promise not to be rejected with Error: 'foo', but it was."
        })
      );
    });
  });

  it('passes when Error message matches a RegExp', function() {
    const matchersUtil = new privateUnderTest.MatchersUtil({
        pp: privateUnderTest.makePrettyPrinter()
      }),
      matcher = privateUnderTest.asyncMatchers.toBeRejectedWithError(
        matchersUtil
      ),
      actual = Promise.reject(new Error('foo'));

    return matcher.compare(actual, /foo/).then(function(result) {
      expect(result).toEqual(
        jasmine.objectContaining({
          pass: true,
          message:
            'Expected a promise not to be rejected with Error: /foo/, but it was.'
        })
      );
    });
  });

  it('passes when Error message is empty', function() {
    const matchersUtil = new privateUnderTest.MatchersUtil({
        pp: privateUnderTest.makePrettyPrinter()
      }),
      matcher = privateUnderTest.asyncMatchers.toBeRejectedWithError(
        matchersUtil
      ),
      actual = Promise.reject(new Error());

    return matcher.compare(actual, '').then(function(result) {
      expect(result).toEqual(
        jasmine.objectContaining({
          pass: true,
          message:
            "Expected a promise not to be rejected with Error: '', but it was."
        })
      );
    });
  });

  it('passes when no arguments', function() {
    const matchersUtil = new privateUnderTest.MatchersUtil({
        pp: privateUnderTest.makePrettyPrinter()
      }),
      matcher = privateUnderTest.asyncMatchers.toBeRejectedWithError(
        matchersUtil
      ),
      actual = Promise.reject(new Error());

    return matcher.compare(actual, void 0).then(function(result) {
      expect(result).toEqual(
        jasmine.objectContaining({
          pass: true,
          message:
            'Expected a promise not to be rejected with Error, but it was.'
        })
      );
    });
  });

  it('fails when resolved', function() {
    const matchersUtil = new privateUnderTest.MatchersUtil({
        pp: privateUnderTest.makePrettyPrinter()
      }),
      matcher = privateUnderTest.asyncMatchers.toBeRejectedWithError(
        matchersUtil
      ),
      actual = Promise.resolve(new Error('foo'));

    return matcher.compare(actual, 'foo').then(function(result) {
      expect(result).toEqual(
        jasmine.objectContaining({
          pass: false,
          message: 'Expected a promise to be rejected but it was resolved.'
        })
      );
    });
  });

  it('fails when rejected with non Error type', function() {
    const matchersUtil = new privateUnderTest.MatchersUtil({
        pp: privateUnderTest.makePrettyPrinter()
      }),
      matcher = privateUnderTest.asyncMatchers.toBeRejectedWithError(
        matchersUtil
      ),
      actual = Promise.reject('foo');

    return matcher.compare(actual, 'foo').then(function(result) {
      expect(result).toEqual(
        jasmine.objectContaining({
          pass: false,
          message:
            "Expected a promise to be rejected with Error: 'foo' but it was rejected with 'foo'."
        })
      );
    });
  });

  it('fails when Error type mismatches', function() {
    const matchersUtil = new privateUnderTest.MatchersUtil({
        pp: privateUnderTest.makePrettyPrinter()
      }),
      matcher = privateUnderTest.asyncMatchers.toBeRejectedWithError(
        matchersUtil
      ),
      actual = Promise.reject(new Error('foo'));

    return matcher.compare(actual, TypeError, 'foo').then(function(result) {
      expect(result).toEqual(
        jasmine.objectContaining({
          pass: false,
          message:
            "Expected a promise to be rejected with TypeError: 'foo' but it was rejected with type Error."
        })
      );
    });
  });

  it('fails when Error message mismatches', function() {
    const matchersUtil = new privateUnderTest.MatchersUtil({
        pp: privateUnderTest.makePrettyPrinter()
      }),
      matcher = privateUnderTest.asyncMatchers.toBeRejectedWithError(
        matchersUtil
      ),
      actual = Promise.reject(new Error('foo'));

    return matcher.compare(actual, 'bar').then(function(result) {
      expect(result).toEqual(
        jasmine.objectContaining({
          pass: false,
          message:
            "Expected a promise to be rejected with Error: 'bar' but it was rejected with Error: foo."
        })
      );
    });
  });

  it('fails if actual is not a promise', function() {
    const matchersUtil = new privateUnderTest.MatchersUtil({
        pp: privateUnderTest.makePrettyPrinter()
      }),
      matcher = privateUnderTest.asyncMatchers.toBeRejectedWithError(
        matchersUtil
      ),
      actual = 'not a promise';

    function f() {
      return matcher.compare(actual);
    }

    expect(f).toThrowError(
      'Expected toBeRejectedWithError to be called on a promise but was on a string.'
    );
  });
});
