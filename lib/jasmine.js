// Crockford's helpers

// Object.create instead of new Object
if (typeof Object.create !== 'function') {
  Object.create = function (o) {
    var F = function () {
    };
    F.prototype = o;
    return new F();
  };
}

// Klass.method instead of Klass.prototype.name = function
if (typeof Function.method !== 'function') {
  Function.prototype.method = function (name, func) {
    this.prototype[name] = func;
    return this;
  }
}

/******************************************************************************
 * Jasmine
 ******************************************************************************/

/*
 * Matchers methods; add your own with Matchers.method()
 */
Matchers = function (actual, results) {
  this.actual = actual;
  this.passing_message = 'Passed.'
  this.results = results || [];
}

Matchers.method('report', function (result, failing_message) {

  this.results.push({
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
 * Jasmine spec constructor
 */

var queuedFunction = function(func, timeout, spec) {
  var that = {
    func: func,
    next: function () {
      spec.finish(); // default value is to be done after one function
    },
    execute: function () {
      if (timeout > 0) {
        setTimeout(function () {
          that.func.apply(spec);
          that.next();
        }, timeout);
      } else {
        that.func.apply(spec);
        that.next();
      }
    }
  }
  return that;
}


var it = function (description, func) {
  var that = {
    description: description,
    queue: [],
    currentTimeout: 0,
    finished: false,
    suite: {next:function() {
    }},
    results: [],

    expects_that: function (actual) {
      return new Matchers(actual, that.results);
    },

    waits: function (timeout) {
      that.currentTimeout = timeout;
      return that;
    },

    resetTimeout: function() {
      that.currentTimeout = 0;
    },

    finish: function() {
      that.finished = true;
    },

    execute: function () {
      if (that.queue[0]) {
        that.queue[0].execute();
      }
    }
  };

  var addToQueue = function(func) {
    var currentFunction = queuedFunction(func, that.currentTimeout, that);
    that.queue.push(currentFunction);

    if (that.queue.length > 1) {
      var previousFunction = that.queue[that.queue.length - 2];
      previousFunction.next = function () {
        currentFunction.execute();
      }
    }

    that.resetTimeout();
    return that;
  }

  that.runs = addToQueue;
  that.then = addToQueue;

  currentSuite.specs.push(that);
  currentSpec = that;

  if (func) {
    func();
  }

  return that;
}

var runs = function (func) {
  currentSpec.runs(func);
}

var waits = function (timeout) {
  currentSpec.waits(timeout);
}

var then = runs;





var describe = function (description, spec_definitions) {
  var that = {
    description: description,
    specs: [],
    specIndex: 0,

    execute: function () {
      if (that.specs.length > 0) {
        that.next();
      }
    },

    getCurrentSpec: function () {
      return that.specs[that.specIndex];
    },

    next: function() {
      if (that.specIndex < that.specs.length) {
        var currentSpec = that.getCurrentSpec();
        currentSpec.execute();
        that.waitForDone(currentSpec);
      }
    },

    waitForDone: function(spec) {
      var id = setInterval(function () {
        if (spec.finished) {
          clearInterval(id);
          that.specIndex++;
          that.next();
        }
      }, 150);
    }
  }

  currentSuite = that;
  spec_definitions();

  return that;
}

var currentSuite = describe('default current suite', function() {});
var currentSpec;

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

/*
 * TODO:
 * - add spec or description to results
 //* - spec.execute needs to wait until the spec is done
 //* - an async test will be killed after X ms if not done and then listed as failed with an "async fail" message of some sort
 * - Suite to run tests in order, constructed with a function called describe
 * - Suite supports before
 * - Suite supports after
 * - Suite supports before_each
 * - Suite supports after_each
 * - Suite supports asynch
 * - Runner that runs suites in order
 * - Runner supports async
 * - HTML reporter
 *   - Shows pass/fail progress (just like bootstrap reporter)
 *   - Lists a Summary: total # specs, # of passed, # of failed
 *   - Failed reports lists all specs that failed and what the failure was
 *   - Failed output is styled with red
 * - JSON reporter
 *   - Lists full results as a JSON object/string
 * - Luna reporter
 *   - each result calls back into widgets for rendering to Luna views
 */

