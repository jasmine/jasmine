getJasmineRequireObj().ExceptionFormatter = function(j$) {

  function ExceptionFormatter(options) {
    var jasmineFile = (options && options.jasmineFile) || j$.util.jasmineFile();
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
      if (!error || !error.stack) {
        return null;
      }

      var stackTrace = new j$.StackTrace(error.stack);
      var lines = filterJasmine(stackTrace);
      var result = '';

      if (stackTrace.message) {
        lines.unshift(stackTrace.message);
      }

      result += formatProperties(error);
      result += lines.join('\n');

      return result;
    };

    function filterJasmine(stackTrace) {
      var result = [],
        jasmineMarker = stackTrace.style === 'webkit' ? '<Jasmine>' : '    at <Jasmine>';

      stackTrace.frames.forEach(function(frame) {
        if (frame.file && frame.file !== jasmineFile) {
          result.push(frame.raw);
        } else if (result[result.length - 1] !== jasmineMarker) {
          result.push(jasmineMarker);
        }
      });

      return result;
    }

    function formatProperties(error) {
      if (!(error instanceof Object)) {
        return;
      }

      var ignored = ['name', 'message', 'stack', 'fileName', 'sourceURL', 'line', 'lineNumber', 'column', 'description'];
      var result = {};
      var empty = true;

      for (var prop in error) {
        if (j$.util.arrayContains(ignored, prop)) {
          continue;
        }
        result[prop] = error[prop];
        empty = false;
      }

      if (!empty) {
        return 'error properties: ' + j$.pp(result) + '\n';
      }

      return '';
    }
  }

  return ExceptionFormatter;
};
