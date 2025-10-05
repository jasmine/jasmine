getJasmineRequireObj().toBeInstanceOf = function(j$) {
  'use strict';

  const usageError = j$.private.formatErrorMsg(
    '<toBeInstanceOf>',
    'expect(value).toBeInstanceOf(<ConstructorFunction>)'
  );

  /**
   * {@link expect} the actual to be an instance of the expected class
   * @function
   * @name matchers#toBeInstanceOf
   * @since 3.5.0
   * @param {Object} expected - The class or constructor function to check for
   * @example
   * expect('foo').toBeInstanceOf(String);
   * expect(3).toBeInstanceOf(Number);
   * expect(new Error()).toBeInstanceOf(Error);
   */
  function toBeInstanceOf(matchersUtil) {
    return {
      compare: function(actual, expected) {
        const actualType =
          actual && actual.constructor
            ? j$.private.fnNameFor(actual.constructor)
            : matchersUtil.pp(actual);
        const expectedType = expected
          ? j$.private.fnNameFor(expected)
          : matchersUtil.pp(expected);
        let expectedMatcher;
        let pass;

        try {
          expectedMatcher = new j$.private.Any(expected);
          pass = expectedMatcher.asymmetricMatch(actual);
          // eslint-disable-next-line no-unused-vars
        } catch (error) {
          throw new Error(
            usageError('Expected value is not a constructor function')
          );
        }

        if (pass) {
          return {
            pass: true,
            message:
              'Expected instance of ' +
              actualType +
              ' not to be an instance of ' +
              expectedType
          };
        } else {
          return {
            pass: false,
            message:
              'Expected instance of ' +
              actualType +
              ' to be an instance of ' +
              expectedType
          };
        }
      }
    };
  }

  return toBeInstanceOf;
};
