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

var actionCollection = function () {
  var that =  {
    actions: [],
    index: 0,
    finished: false,
    results: nestedResults(),

    report: function (result) {
      that.results.push(result);
    },

    execute: function () {
      if (that.actions.length > 0) {
        that.next();
      }
    },

    getCurrentAction: function () {
      return that.actions[that.index];
    },

    next: function() {
      if (that.index >= that.actions.length) {
        that.finished = true;
        return;
      }

      var currentAction = that.getCurrentAction();

      if (that.beforeEach) {
        that.beforeEach.apply(currentAction);
      }

      currentAction.execute();
      that.waitForDone(currentAction);
    },

    waitForDone: function(action) {
      var id = setInterval(function () {
        if (action.finished) {
          clearInterval(id);
          that.report(action.results);

          if (that.afterEach) {
            that.afterEach.apply(action);
          }

          that.index++;
          that.next();
        }
      }, 150);
    }
  }

  return that;
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
  this.results = results || nestedResults();
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

var nestedResults = function() {
  var that = {
    totalCount: 0,
    passedCount: 0,
    failedCount: 0,
    results: [],

    push: function(result) {
      if (result.results) {
        that.totalCount += result.totalCount;
        that.passedCount += result.passedCount;
        that.failedCount += result.failedCount;

      } else {
        that.totalCount++;
        if (result.passed) {
          that.passedCount++;
        } else {
          that.failedCount++;
        }
      }
      that.results.push(result);
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

    results: nestedResults(),

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

  that.results.description = description;
  return that;
}

var runs = function (func) {
  currentSpec.runs(func);
}

var then = runs;

var waits = function (timeout) {
  currentSpec.waits(timeout);
}

var beforeEach = function (beforeEach) {
  currentSuite.beforeEach = beforeEach;
}

var afterEach = function (afterEach) {
  currentSuite.afterEach = afterEach;
}

var describe = function (description, spec_definitions) {
  var that = actionCollection();

  that.description = description;
  that.specs = that.actions;

  currentSuite = that;
  currentRunner.suites.push(that);

  spec_definitions();

  that.results.description = description;

  return that;
}

var Jasmine = function () {
  var that = actionCollection();

  that.suites = that.actions;
  that.results.description = 'All Jasmine Suites';

  currentRunner = that;
  return that;
}

var currentRunner = Jasmine();
var currentSuite = describe('default current suite', function() {});

var currentSpec;

/*
 * TODO:
 //* - add spec or description to results
 //* - spec.execute needs to wait until the spec is done
 //* - an async test will be killed after X ms if not done and then listed as failed with an "async fail" message of some sort
 //* - Suite to run tests in order, constructed with a function called describe
 * - Suite supports before
 * - Suite supports after
 * - Suite supports before_each
 * - Suite supports after_each
 //* - Suite rolls up spec results
 //* - Suite supports asynch
 //* - Runner that runs suites in order
 //* - Runner supports async
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

