//TODO: expectation result may make more sense as a presentation of an expectation.
getJasmineRequireObj().buildExpectationResult = function() {
  function buildExpectationResult(options) {
    var messageFormatter = options.messageFormatter || function() {},
      stackFormatter = options.stackFormatter || function() {};

    /**
     * @typedef Expectation
     * @property {String} matcherName - The name of the matcher that was executed for this expectation.
     * @property {String} message - The failure message for the expectation.
     * @property {String} stack - The stack trace for the failure if available.
     * @property {Boolean} passed - Whether the expectation passed or failed.
     * @property {Object} expected - If the expectation failed, what was the expected value.
     * @property {Object} actual - If the expectation failed, what actual value was produced.
     */
    var result = {
      matcherName: options.matcherName,
      message: message(),
      stack: stack(),
      passed: options.passed
    };

    if (!result.passed) {
      result.expected = options.expected;
      result.actual = options.actual;
    }

    return result;

    function message() {
      if (options.passed) {
        return 'Passed.';
      } else if (options.message) {
        return options.message;
      } else if (options.error) {
        return messageFormatter(options.error);
      }
      return '';
    }

    function stack() {
      if (options.passed) {
        return '';
      }

      var error = options.error;
      if (!error) {
        if (options.errorForStack) {
          error = options.errorForStack;
        } else if (options.stack) {
          error = options;
        } else {
          try {
            throw new Error(message());
          } catch (e) {
            error = e;
          }
        }
      }
      return stackFormatter(error);
    }
  }

  return buildExpectationResult;
};
