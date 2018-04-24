getJasmineRequireObj().util = function(j$) {

  var util = {};

  util.inherit = function(childClass, parentClass) {
    var Subclass = function() {
    };
    Subclass.prototype = parentClass.prototype;
    childClass.prototype = new Subclass();
  };

  util.htmlEscape = function(str) {
    if (!str) {
      return str;
    }
    return str.replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  };

  util.argsToArray = function(args) {
    var arrayOfArgs = [];
    for (var i = 0; i < args.length; i++) {
      arrayOfArgs.push(args[i]);
    }
    return arrayOfArgs;
  };

  util.isUndefined = function(obj) {
    return obj === void 0;
  };

  util.arrayContains = function(array, search) {
    var i = array.length;
    while (i--) {
      if (array[i] === search) {
        return true;
      }
    }
    return false;
  };

  util.clone = function(obj) {
    if (Object.prototype.toString.apply(obj) === '[object Array]') {
      return obj.slice();
    }

    var cloned = {};
    for (var prop in obj) {
      if (obj.hasOwnProperty(prop)) {
        cloned[prop] = obj[prop];
      }
    }

    return cloned;
  };

  util.cloneArgs = function(args) {
    var clonedArgs = [];
    var argsAsArray = j$.util.argsToArray(args);
    for(var i = 0; i < argsAsArray.length; i++) {
      var str = Object.prototype.toString.apply(argsAsArray[i]),
        primitives = /^\[object (Boolean|String|RegExp|Number)/;

      // All falsey values are either primitives, `null`, or `undefined.
      if (!argsAsArray[i] || str.match(primitives)) {
        clonedArgs.push(argsAsArray[i]);
      } else {
        clonedArgs.push(j$.util.clone(argsAsArray[i]));
      }
    }
    return clonedArgs;
  };

  util.getPropertyDescriptor = function(obj, methodName) {
    var descriptor,
      proto = obj;

    do {
      descriptor = Object.getOwnPropertyDescriptor(proto, methodName);
      proto = Object.getPrototypeOf(proto);
    } while (!descriptor && proto);

    return descriptor;
  };

  util.objectDifference = function(obj, toRemove) {
    var diff = {};

    for (var key in obj) {
      if (util.has(obj, key) && !util.has(toRemove, key)) {
        diff[key] = obj[key];
      }
    }

    return diff;
  };

  util.has = function(obj, key) {
    return Object.prototype.hasOwnProperty.call(obj, key);
  };

  function anyMatch(pattern, lines) {
    var i;

    for (i = 0; i < lines.length; i++) {
      if (lines[i].match(pattern)) {
        return true;
      }
    }

    return false;
  }

  util.errorWithStack = function errorWithStack () {
    // Don't throw and catch if we don't have to, because it makes it harder
    // for users to debug their code with exception breakpoints.
    var error = new Error();

    if (error.stack) {
      return error;
    }

    // But some browsers (e.g. Phantom) only provide a stack trace if we throw.
    try {
      throw new Error();
    } catch (e) {
      return e;
    }
  };

  function callerFile() {
    var trace = new j$.StackTrace(util.errorWithStack());
    return trace.frames[2].file;
  }

  util.jasmineFile = (function() {
    var result;

    return function() {
      var trace;

      if (!result) {
        result = callerFile();
      }

      return result;
    };
  }());

  return util;
};
