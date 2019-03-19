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

    if(!result.passed) {
      result.expected = options.expected;
      result.actual = options.actual;
    }

    return result;

    
    function message() {
      if (options.passed) {
        return 'Passed: ' + options.message;
      } else if (options.message) {
        var localMessage = typeof options.message === 'function' ? 'Failed: ' + options.message() : 'Failed: ' + options.message;
        // when formatting caught error messages, the 'Failed' prefix can be erroneously duplicated. Needs to be tidied.
        localMessage = localMessage.replace ('Failed: Failed:', 'Failed:');
        return localMessage;
      } else if (options.error) {
        return messageFormatter(options.error);
      }
      return '';
    }

    function stack() {
      if (options.passed) {
        return options.message;
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
