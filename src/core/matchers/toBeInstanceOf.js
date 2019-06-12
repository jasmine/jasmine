getJasmineRequireObj().toBeInstanceOf = function(j$) {
  var usageError =  j$.formatErrorMsg('<toBeInstanceOf>', 'expect(value).toBeInstanceOf(<ConstructorFunction>)');

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
  function toBeInstanceOf(util, customEqualityTesters) {
    return {
      compare: function(actual, expected) {
        var actualType = actual && actual.constructor ? j$.fnNameFor(actual.constructor) : j$.pp(actual),
            expectedType = expected ? j$.fnNameFor(expected) : j$.pp(expected),
            expectedMatcher,
            pass;

        try {
            expectedMatcher = new j$.Any(expected);
            pass = expectedMatcher.asymmetricMatch(actual);
        } catch (error) {
            throw new Error(usageError('Expected value is not a constructor function'));
        }

        if (pass) {
          return {
            pass: true,
            message: 'Expected instance of ' + actualType + ' not to be an instance of ' + expectedType
          };
        } else {
          return {
            pass: false,
            message: 'Expected instance of ' + actualType + ' to be an instance of ' + expectedType
          };
        }
      }
    };
  }

  return toBeInstanceOf;
};
