getJasmineRequireObj().toBeRejectedWithMatching = function(j$) {
  'use strict';

  /**
   * Expect a promise to be rejected with an error that satisfies the provided predicate function.
   * @function
   * @async
   * @name async-matchers#toBeRejectedWithMatching
   * @since 6.0.1
   * @param {Function} predicate - A function that receives the rejection value and returns true if it matches
   * @example
   * await expectAsync(aPromise).toBeRejectedWithMatching(function(err) {
   *   return err.message.includes('specific error');
   * });
   * @example
   * return expectAsync(aPromise).toBeRejectedWithMatching(err => err.code === 'ERR_TIMEOUT');
   */
  return function toBeRejectedWithMatching(matchersUtil) {
    return {
      compare: function(actualPromise, predicate) {
        if (!j$.private.isPromiseLike(actualPromise)) {
          throw new Error(
            'Expected toBeRejectedWithMatching to be called on a promise.'
          );
        }

        if (typeof predicate !== 'function') {
          throw new Error('Expected a predicate function to be passed to toBeRejectedWithMatching.');
        }

        return actualPromise.then(
          function() {
            return {
              pass: false,
              message: 'Expected a promise to be rejected with a matching error but it was resolved.'
            };
          },
          function(actualError) {
            var pass = predicate(actualError);
            return {
              pass: pass,
              message: pass 
                ? 'Expected a promise not to be rejected with a matching error.' 
                : 'Expected a promise to be rejected with a matching error, but it was rejected with: ' + matchersUtil.pp(actualError)
            };
          }
        );
      }
    };
  };
};