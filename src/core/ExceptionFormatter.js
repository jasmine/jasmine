getJasmineRequireObj().ExceptionFormatter = function(j$) {
  const ignoredProperties = [
    'name',
    'message',
    'stack',
    'fileName',
    'sourceURL',
    'line',
    'lineNumber',
    'column',
    'description',
    'jasmineMessage'
  ];

  function ExceptionFormatter(options) {
    const jasmineFile =
      (options && options.jasmineFile) || j$.util.jasmineFile();
    this.message = function(error) {
      let message = '';

      if (error.jasmineMessage) {
        message += error.jasmineMessage;
      } else if (error.name && error.message) {
        message += error.name + ': ' + error.message;
      } else if (error.message) {
        message += error.message;
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

    this.stack = function(error, { omitMessage } = {}) {
      if (!error || !error.stack) {
        return null;
      }

      const stackTrace = new j$.StackTrace(error);
      const lines = filterJasmine(stackTrace);
      let result = '';

      if (stackTrace.message && !omitMessage) {
        lines.unshift(stackTrace.message);
      }

      result += formatProperties(error);
      result += lines.join('\n');

      return result;
    };

    function filterJasmine(stackTrace) {
      const result = [];
      const jasmineMarker =
        stackTrace.style === 'webkit' ? '<Jasmine>' : '    at <Jasmine>';

      stackTrace.frames.forEach(function(frame) {
        if (frame.file !== jasmineFile) {
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

      const result = {};
      let empty = true;

      for (const prop in error) {
        if (j$.util.arrayContains(ignoredProperties, prop)) {
          continue;
        }
        result[prop] = error[prop];
        empty = false;
      }

      if (!empty) {
        return 'error properties: ' + j$.basicPrettyPrinter_(result) + '\n';
      }

      return '';
    }
  }

  return ExceptionFormatter;
};
