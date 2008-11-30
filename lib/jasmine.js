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
 * Matchers methods; add your own with Matchers.method()
 */
Matchers = function (actual) {
  this.actual = actual;
  this.passing_message = 'Passed.'
}

Matchers.method('report', function (result, failing_message) {

  Jasmine.results.push({
    passed: result,
    message: result ? this.passing_message : failing_message
  });

  return result;
});

Matchers.method('should_equal', function (expected) {
  return this.report((this.actual === expected),
                     'Expected ' + expected + ' but got ' + this.actual + '.');
  
});

Matchers.method('should_not_equal', function (expected) {
  return this.report((this.actual !== expected),
                     'Expected ' + expected + ' to not equal ' + this.actual + ', but it does.');
});

/*
 * expects helper method that allows for chaining Matcher
 */
var expects_that = function (actual) {
  return new Matchers(actual);
}

/*
 * Jasmine spec constructor
 */
var it = function (description, func) {
  return {
    description: description,
    execute: func
  }
}

/*
 * Jasmine constructor
 */
var jasmine_init = function () {
  return {
    results: []
  }
}

/*
 * Jasmine instance
 */
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
