getJasmineRequireObj().DiffBuilder = function(j$) {
  return function DiffBuilder() {
    var path = new j$.ObjectPath(),
        mismatches = [];

    return {
      record: function (actual, expected, formatter) {
        formatter = formatter || defaultFormatter;
        mismatches.push(formatter(actual, expected, path));
      },

      getMessage: function () {
        return mismatches.join('\n');
      },

      withPath: function (pathComponent, block) {
        var oldPath = path;
        path = path.add(pathComponent);
        block();
        path = oldPath;
      }
    };

    function defaultFormatter (actual, expected, path) {
      return 'Expected ' +
        path + (path.depth() ? ' = ' : '') +
        j$.pp(actual) +
        ' to equal ' +
        j$.pp(expected) +
        '.';
    }
  };
};
