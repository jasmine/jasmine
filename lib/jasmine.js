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

/*
 * object for holding results; allows for the results array to hold another nestedResults()
 *
 */

var nestedResults = function() {
  var that = {
    totalCount: 0,
    passedCount: 0,
    failedCount: 0,
    results: [],

    rollupCounts: function (result) {
      that.totalCount += result.totalCount;
      that.passedCount += result.passedCount;
      that.failedCount += result.failedCount;
    },

    push: function (result) {
      if (result.results) {
        that.rollupCounts(result);
      } else {
        that.totalCount++;
        result.passed ? that.passedCount++ : that.failedCount++;
      }
      that.results.push(result);
    }
  }

  return that;
}


/*
 * base for Runner & Suite: allows for a queue of functions to get executed, allowing for
 *   any one action to complete, including asynchronous calls, before going to the next
 *   action.
 *
 **/
var actionCollection = function () {
  var that = {
    actions: [],
    index: 0,
    finished: false,
    results: nestedResults(),

    finish: function () {
      if (that.finishCallback) {
        that.finishCallback();
      }
      that.finished = true;
    },

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
        that.finish();
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

    finishCallback: function () {
      if (Jasmine.reporter) {
        Jasmine.reporter.reportSpecResults(that.results);
      }
    },

    finish: function() {
      that.finishCallback();
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
  Jasmine.suites.push(that);

  spec_definitions();

  that.results.description = description;

  that.finishCallback = function () {
    if (Jasmine.reporter) {
      Jasmine.reporter.reportSuiteResults(that.results);
    }
  }

  return that;
}

var Runner = function () {
  var that = actionCollection();

  that.suites = that.actions;
  that.results.description = 'All Jasmine Suites';

  that.finishCallback = function () {
    if (that.reporter) {
      that.reporter.reportRunnerResults(that.results);
    }
  }

  Jasmine = that;
  return that;
}

var JasmineReporters = {};

var Jasmine = Runner();
var currentSuite;
var currentSpec;

JasmineReporters.reporter = function (elementId) {
  var that = {
    element: document.getElementById(elementId),
    output: '',

    reportRunnerResults: function (results) { that.output += ''; },

    reportSuiteResults: function (results) { that.output += ''; },

    reportSpecResults: function (results) { that.output += ''; },

  }

  // TODO: throw if no element?
  if (that.element) {
    that.element.innerHTML = '';
  }

  return that;
}

/*
 * TODO:
 * - HTML reporter
 *   - Shows pass/fail progress (just like bootstrap reporter)
 *   - Lists a Summary: total # specs, # of passed, # of failed
 *   - Failed reports lists all specs that failed and what the failure was
 *   - Failed output is styled with red
 */

