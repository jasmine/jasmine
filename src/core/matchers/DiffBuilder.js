getJasmineRequireObj().DiffBuilder = function(j$) {
  return function DiffBuilder(config) {
    var path = new j$.ObjectPath(),
        mismatches = [],
        prettyPrinter = (config || {}).prettyPrinter || j$.makePrettyPrinter();

    return {
      record: function (actual, expected, formatter) {
        formatter = formatter || defaultFormatter;
        mismatches.push(formatter(actual, expected, path, prettyPrinter));
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

    function defaultFormatter (actual, expected, path, prettyPrinter) {
      return 'Expected ' +
        path + (path.depth() ? ' = ' : '') +
        prettyPrinter(actual) +
        ' to equal ' +
        prettyPrinter(expected) +
        '.';
    }
  };
};
