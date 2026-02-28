getJasmineRequireObj().toBeRejectedWithMatching = function(j$) {
  'use strict';

  const usageError = j$.private.formatErrorMsg(
    '<toBeRejectedWithMatching>',
    'expect(function() {<expectation>}).toBeRejectedWithMatching(<Predicate>)'
  );

  /**
   * Expect a promise to be rejected with a value matching a predicate.
   * @function
   * @async
   * @name async-matchers#toBeRejectedWithMatching
   * @since 6.2.0
   * @param {Function} predicate - A function that takes the rejected promise value as its parameter and returns true if it matches.
   * @example
   * await expectAsync(aPromise).toBeRejectedWithMatching((error) => error.message === 'Some error');
   * @example
   * return expectAsync(aPromise).toBeRejectedWithMatching((error) => error.message === 'Some error');
   */
  return function toBeRejectedWithMatching() {
    return {
      compare: function(actualPromise, predicate) {
        if (!j$.private.isPromiseLike(actualPromise)) {
          throw new Error(
            `Expected toBeRejectedWithMatching to be called on a promise but was on a ${typeof actualPromise}.`
          );
        }

        if (typeof predicate !== 'function') {
          throw new Error(usageError('Predicate is not a Function'));
        }

        function prefix(passed) {
          return (
            'Expected a promise ' +
            (passed ? 'not ' : '') +
            'to be rejected matching a predicate'
          );
        }

        return actualPromise.then(
          function() {
            return {
              pass: false,
              message: prefix(false) + ', but it was resolved.'
            };
          },
          function(actualValue) {
            const result = predicate(actualValue);
            return {
              pass: Boolean(result),
              message:
                prefix(result) +
                ', but the predicate returned "' +
                result +
                '".'
            };
          }
        );
      }
    };
  };
};
