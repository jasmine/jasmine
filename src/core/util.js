getJasmineRequireObj().util = function() {

  var util = {};

  util.inherit = function(childClass, parentClass) {
    var subclass = function() {
    };
    subclass.prototype = parentClass.prototype;
    childClass.prototype = new subclass();
  };

  util.htmlEscape = function(str) {
    if (!str) return str;
    return str.replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  };

  util.argsToArray = function(args) {
    var arrayOfArgs = [];
    for (var i = 0; i < args.length; i++) arrayOfArgs.push(args[i]);
    return arrayOfArgs;
  };

  util.isUndefined = function(obj) {
    return obj === void 0;
  };

  return util;
};
