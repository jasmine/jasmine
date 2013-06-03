getJasmineRequireObj().toThrow = function() {

  function toThrow() {
    return {
      compare: function(actual, expected) {
        var result = { pass: false },
          exception;

        if (typeof actual != "function") {
          throw new Error("Actual is not a Function");
        }

        if (expectedCannotBeTreatedAsException()) {
          throw new Error("Expected cannot be treated as an exception.");
        }

        try {
          actual();
        } catch (e) {
          exception = new Error(e);
        }

        if (!exception) {
          result.message = "Expected function to throw an exception.";
          return result;
        }

        if (void 0 == expected) {
          result.pass = true;
          result.message = "Expected function not to throw an exception.";
        } else if (exception.message == expected) {
          result.pass = true;
          result.message = "Expected function not to throw an exception \"" + expected + "\".";
        } else if (exception.message == expected.message) {
          result.pass = true;
          result.message = "Expected function not to throw an exception \"" + expected.message + "\".";
        } else if (expected instanceof RegExp) {
          if (expected.test(exception.message)) {
            result.pass = true;
            result.message = "Expected function not to throw an exception matching " + expected + ".";
          } else {
            result.pass = false;
            result.message = "Expected function to throw an exception matching " + expected + ".";
          }
        } else {
          result.pass = false;
          result.message = "Expected function to throw an exception \"" + (expected.message || expected) + "\".";
        }

        return result;

        function expectedCannotBeTreatedAsException() {
          return !(
            (void 0 == expected) ||
              (expected instanceof Error) ||
              (typeof expected == "string") ||
              (expected instanceof RegExp)
            );
        }
      }
    };
  }

  return toThrow;
};
