//TODO: expectation result may make more sense as a presentation of an expectation.
getJasmineRequireObj().buildExpectationResult = function(j$) {
  function buildExpectationResult(options) {
    const exceptionFormatter = new j$.private.ExceptionFormatter();

    /**
     * Describes the result of evaluating an expectation
     *
     * @typedef ExpectationResult
     * @property {String} matcherName - The name of the matcher that was executed for this expectation.
     * @property {String} message - The failure message for the expectation.
     * @property {String} stack - The stack trace for the failure if available.
     * @property {Boolean} passed - Whether the expectation passed or failed.
     * @property {String|undefined} globalErrorType - The type of an error that
     * is reported on the top suite. Valid values are undefined, "afterAll",
     * "load", "lateExpectation", and "lateError".
     */
    const result = {
      matcherName: options.matcherName,
      message: message(),
      stack: options.omitStackTrace ? '' : stack(),
      passed: options.passed,
      globalErrorType: options.globalErrorType
    };

    if (options.filename !== undefined) {
      result.filename = options.filename;
    }
    if (options.lineno !== undefined) {
      result.lineno = options.lineno;
    }

    if (!result.passed) {
      if (options.error && !j$.private.isString(options.error)) {
        if ('code' in options.error) {
          result.code = options.error.code;
        }

        if (options.error.code === 'ERR_ASSERTION') {
          result.matcherName = 'assert ' + options.error.operator;
        }
      }
    }

    return result;

    function message() {
      if (options.passed) {
        return 'Passed.';
      } else if (options.message) {
        return options.message;
      } else if (options.error) {
        return exceptionFormatter.message(options.error);
      }
      return '';
    }

    function stack() {
      if (options.passed) {
        return '';
      }

      let error = options.error;

      if (!error) {
        if (options.errorForStack) {
          error = options.errorForStack;
        } else if (options.stack) {
          error = options;
        } else {
          error = new Error(message());
        }
      }
      // Omit the message from the stack trace because it will be
      // included elsewhere.
      return exceptionFormatter.stack(error, { omitMessage: true });
    }
  }

  return buildExpectationResult;
};
