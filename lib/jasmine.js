// Crockford's helpers

// Object.create instead of new Object
if (typeof Object.create !== 'function') {
  Object.create = function (o) {
    var F = function () {};
      F.prototype = o;
      return new F();
  };
}

// Klass.method instead of Klass.prototype.name = function
Function.prototype.method = function (name, func) {
  this.prototype[name] = func;
  return this;
}

/******************************************************************************
 * Jasmine
 ******************************************************************************/

/*
 * Jasmine expectation constructor
 */
var expects = function (actual) {
  var that = {};
  that.actual = actual;

  that.should_equal = function(expected) {
    var message = 'Passed.';
    result = (that.actual === expected);

    if (!result) {
      message = 'Expected ' + expected + ' but got ' + that.actual + '.';
    }

    Jasmine.results.push({
        passed: result,
        message: message
      });
      
    return result;
  }

  return that;
}

var spec = function (description, func) {
  return {
    description: description,
    execute: func
  }
}

var jasmine_init = function () {
  return {
    results: []
  }
}

var Jasmine = jasmine_init();

//    spec: {
//    description: description,
//    func: func,
//    execute: function() {with(jasmine) {func();}}
//  },
//
//    expects_that: function(actual) {
//
//      this.actual = actual;
//      return this;
//    },
//
//  }
//}
//
//var JasmineSpec = function(description, func) {
//
//}

