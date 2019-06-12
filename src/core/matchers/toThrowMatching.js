getJasmineRequireObj().toThrowMatching = function(j$) {
  var usageError =  j$.formatErrorMsg('<toThrowMatching>', 'expect(function() {<expectation>}).toThrowMatching(<Predicate>)');

  /**
   * {@link expect} a function to `throw` something matching a predicate.
   * @function
   * @name matchers#toThrowMatching
   * @since 3.0.0
   * @param {Function} predicate - A function that takes the thrown exception as its parameter and returns true if it matches.
   * @example
   * expect(function() { throw new Error('nope'); }).toThrowMatching(function(thrown) { return thrown.message === 'nope'; });
   */
  function toThrowMatching() {
    return {
      compare: function(actual, predicate) {
        var thrown;

        if (typeof actual !== 'function') {
          throw new Error(usageError('Actual is not a Function'));
        }

        if (typeof predicate !== 'function') {
          throw new Error(usageError('Predicate is not a Function'));
        }

        try {
          actual();
          return fail('Expected function to throw an exception.');
        } catch (e) {
          thrown = e;
        }

        if (predicate(thrown)) {
          return pass('Expected function not to throw an exception matching a predicate.');
        } else {
            return fail(function() {
              return 'Expected function to throw an exception matching a predicate, ' +
                'but it threw ' + thrownDescription(thrown) + '.';
            });
        }
      }
    };
  }

  function thrownDescription(thrown) {
    if (thrown && thrown.constructor) {
      return j$.fnNameFor(thrown.constructor) + ' with message ' +
        j$.pp(thrown.message);
    } else {
      return j$.pp(thrown);
    }
  }

  function pass(message) {
    return {
      pass: true,
      message: message
    };
  }

  function fail(message) {
    return {
      pass: false,
      message: message
    };
  }

  return toThrowMatching;
};
