getJasmineRequireObj().ExceptionFormatter = function() {
  function ExceptionFormatter() {
    this.message = function(error) {
      var message = '';

      if (error.name && error.message) {
        message += error.name + ': ' + error.message;
      } else {
        message += error.toString() + ' thrown';
      }

      if (error.fileName || error.sourceURL) {
        message += ' in ' + (error.fileName || error.sourceURL);
      }

      if (error.line || error.lineNumber) {
        message += ' (line ' + (error.line || error.lineNumber) + ')';
      }

      return message;
    };

    this.stack = function(error) {
      return error ? error.stack : null;
    };
  }

  return ExceptionFormatter;
};
