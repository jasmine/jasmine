describe('toThrowMatching', function() {
  it('throws an error when the actual is not a function', function() {
    const matcher = privateUnderTest.matchers.toThrowMatching();

    expect(function() {
      matcher.compare({}, function() {
        return true;
      });
    }).toThrowError(/Actual is not a Function/);
  });

  it('throws an error when the expected is not a function', function() {
    const matcher = privateUnderTest.matchers.toThrowMatching(),
      fn = function() {
        throw new Error('foo');
      };

    expect(function() {
      matcher.compare(fn, 1);
    }).toThrowError(/Predicate is not a Function/);
  });

  it('fails if actual does not throw at all', function() {
    const matcher = privateUnderTest.matchers.toThrowMatching(),
      fn = function() {
        return true;
      };

    const result = matcher.compare(fn, function() {
      return true;
    });

    expect(result.pass).toBe(false);
    expect(result.message).toEqual('Expected function to throw an exception.');
  });

  it('fails with the correct message if thrown is a falsy value', function() {
    const matcher = privateUnderTest.matchers.toThrowMatching({
        pp: privateUnderTest.makePrettyPrinter()
      }),
      fn = function() {
        throw undefined;
      };

    const result = matcher.compare(fn, function() {
      return false;
    });
    expect(result.pass).toBe(false);
    expect(result.message()).toEqual(
      'Expected function to throw an exception matching a predicate, but it threw undefined.'
    );
  });

  it('passes if the argument is a function that returns true when called with the error', function() {
    const matcher = privateUnderTest.matchers.toThrowMatching(),
      predicate = function(e) {
        return e.message === 'nope';
      },
      fn = function() {
        throw new TypeError('nope');
      };

    const result = matcher.compare(fn, predicate);

    expect(result.pass).toBe(true);
    expect(result.message).toEqual(
      'Expected function not to throw an exception matching a predicate.'
    );
  });

  it('fails if the argument is a function that returns false when called with the error', function() {
    const matcher = privateUnderTest.matchers.toThrowMatching({
        pp: privateUnderTest.makePrettyPrinter()
      }),
      predicate = function(e) {
        return e.message === 'oh no';
      },
      fn = function() {
        throw new TypeError('nope');
      };

    const result = matcher.compare(fn, predicate);

    expect(result.pass).toBe(false);
    expect(result.message()).toEqual(
      "Expected function to throw an exception matching a predicate, but it threw TypeError with message 'nope'."
    );
  });
});
