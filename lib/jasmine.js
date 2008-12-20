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
 * Jasmine internal classes & objects
 */

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

/*
 * queuedFunction is how actionCollection's actions are implemented
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

/******************************************************************************
 * Jasmine
 ******************************************************************************/


var Jasmine = {}

Jasmine.init = function () {
  var that = {
    currentSpec: null,
    currentSuite: null,
    currentRunner: null,
    execute: function () {
      that.currentRunner.execute();
    }
  }
  return that;
}

var jasmine = Jasmine.init();

/*
 * Jasmine.Matchers methods; add your own with Jasmine.Matchers.method() - don't forget to write a test
 *
 */

Jasmine.Matchers = function (actual, results) {
  this.actual = actual;
  this.passing_message = 'Passed.'
  this.results = results || nestedResults();
}

Jasmine.Matchers.method('report', function (result, failing_message) {

  this.results.push({
    passed: result,
    message: result ? this.passing_message : failing_message
  });

  return result;
});

Jasmine.Matchers.method('should_equal', function (expected) {
  return this.report((this.actual === expected),
      'Expected ' + expected + ' but got ' + this.actual + '.');
});

Jasmine.Matchers.method('should_not_equal', function (expected) {
  return this.report((this.actual !== expected),
      'Expected ' + expected + ' to not equal ' + this.actual + ', but it does.');
});

Jasmine.Matchers.method('should_match', function (reg_exp) {
  return this.report((reg_exp.match(this.actual)),
      'Expected ' + this.actual + ' to match ' + reg_exp + '.');
});

/*
 * Jasmine spec constructor
 */

var it = function (description, func) {
  var that = {
    description: description,
    queue: [],
    currentTimeout: 0,
    finished: false,

    results: nestedResults(),

    expects_that: function (actual) {
      return new Jasmine.Matchers(actual, that.results);
    },

    waits: function (timeout) {
      that.currentTimeout = timeout;
      return that;
    },

    resetTimeout: function() {
      that.currentTimeout = 0;
    },

    finishCallback: function () {
      if (jasmine.reporter) {
        jasmine.reporter.reportSpecResults(that.results);
      }
    },

    finish: function() {
      that.finishCallback();
      that.finished = true;
    },

    safeExecute: function(queuedFunc) {
      try {
        queuedFunc.execute();
      }
      catch (e) {
        that.results.push({
          passed: false,
          message: e.name + ': '+ e.message + ' in ' + e.fileName +
                   ' (line ' + e.lineNumber +')'
        });
        queuedFunc.next();
      }
    },

    execute: function () {
      if (that.queue[0]) {
        that.safeExecute(that.queue[0])
      }
      else {
        that.finish();
      }
    }
  };

  var addToQueue = function(func) {
    var currentFunction = queuedFunction(func, that.currentTimeout, that);
    that.queue.push(currentFunction);

    if (that.queue.length > 1) {
      var previousFunction = that.queue[that.queue.length - 2];
      previousFunction.next = function () {
        that.safeExecute(currentFunction);
      }
    }

    that.resetTimeout();
    return that;
  }

  that.expectationResults = that.results.results;
  that.runs = addToQueue;

  jasmine.currentSuite.specs.push(that);
  jasmine.currentSpec = that;

  if (func) {
    func();
  }

  that.results.description = description;
  return that;
}

var runs = function (func) {
  jasmine.currentSpec.runs(func);
}

var waits = function (timeout) {
  jasmine.currentSpec.waits(timeout);
}

var beforeEach = function (beforeEach) {
  jasmine.currentSuite.beforeEach = beforeEach;
}

var afterEach = function (afterEach) {
  jasmine.currentSuite.afterEach = afterEach;
}

var describe = function (description, spec_definitions) {
  var that = actionCollection();

  that.description = description;
  that.specs = that.actions;

  jasmine.currentSuite = that;
  jasmine.currentRunner.suites.push(that);

  spec_definitions();

  that.results.description = description;
  that.specResults = that.results.results;

  that.finishCallback = function () {
    if (jasmine.reporter) {
      jasmine.reporter.reportSuiteResults(that.results);
    }
  }

  return that;
}

var Runner = function () {
  var that = actionCollection();

  that.suites = that.actions;
  that.results.description = 'All Jasmine Suites';

  that.finishCallback = function () {
    if (jasmine.reporter) {
      jasmine.reporter.reportRunnerResults(that.results);
    }
  }

  that.suiteResults = that.results.results;

  jasmine.currentRunner = that;
  return that;
}

jasmine.currentRunner = Runner();

/* JasmineReporters.reporter
 *    Base object that will get called whenever a Spec, Suite, or Runner is done.  It is up to
 *    descendants of this object to do something with the results (see json_reporter.js)
 */
Jasmine.Reporters = {};

Jasmine.Reporters.reporter = function (callbacks) {
  var that = {
    callbacks: callbacks || {},

    doCallback: function (callback, results) {
      if (callback) {
        callback(results);
      }
    },

    reportRunnerResults: function (results) {
      that.doCallback(that.callbacks.runnerCallback, results);
    },
    reportSuiteResults:  function (results) {
      that.doCallback(that.callbacks.suiteCallback, results);
    },
    reportSpecResults:   function (results) {
      that.doCallback(that.callbacks.specCallback, results);
    }
  }

  return that;
}