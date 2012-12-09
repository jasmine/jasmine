jasmine.exceptionMessageFor = function(e) {
  var message = e.name
    + ': '
    + e.message
    + ' in '
    + (e.fileName || e.sourceURL || '')
    + ' (line '
    + (e.line || e.lineNumber || '')
    + ')';

  return message;
};
