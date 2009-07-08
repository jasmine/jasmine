/**
 * Internal representation of a Jasmine specification, or test.
 * @private
 * @constructs
 * @param {jasmine.Env} env
 * @param {jasmine.Suite} suite
 * @param {String} description
 */
jasmine.Spec = function(env, suite, description) {
  this.id = env.nextSpecId_++;
  this.env = env;
  this.suite = suite;
  this.description = description;
  this.queue = [];
  this.currentTimeout = 0;
  this.currentLatchFunction = undefined;
  this.finished = false;
  this.afterCallbacks = [];
  this.spies_ = [];

  this.results = new jasmine.NestedResults();
  this.results.description = description;
  this.runs = this.addToQueue;
};

jasmine.Spec.prototype.getFullName = function() {
  return this.suite.getFullName() + ' ' + this.description + '.';
};

jasmine.Spec.prototype.getResults = function() {
  return this.results;
};

jasmine.Spec.prototype.addToQueue = function(func) {
  var queuedFunction = new jasmine.QueuedFunction(this.env, func, this.currentTimeout, this.currentLatchFunction, this);
  this.queue.push(queuedFunction);

  if (this.queue.length > 1) {
    var previousQueuedFunction = this.queue[this.queue.length - 2];
    previousQueuedFunction.next = function() {
      queuedFunction.execute();
    };
  }

  this.resetTimeout();
  return this;
};

/**
 * @private
 * @deprecated
 */
jasmine.Spec.prototype.expects_that = function(actual) {
  return this.expect(actual);
};

/**
 * @private
 */
jasmine.Spec.prototype.expect = function(actual) {
  return new jasmine.Matchers(this.env, actual, this.results);
};

/**
 * @private
 */
jasmine.Spec.prototype.waits = function(timeout) {
  this.currentTimeout = timeout;
  this.currentLatchFunction = undefined;
  return this;
};

/**
 * @private
 */
jasmine.Spec.prototype.waitsFor = function(timeout, latchFunction, message) {
  this.currentTimeout = timeout;
  this.currentLatchFunction = latchFunction;
  this.currentLatchFunction.description = message;
  return this;
};

jasmine.Spec.prototype.resetTimeout = function() {
  this.currentTimeout = 0;
  this.currentLatchFunction = undefined;
};

jasmine.Spec.prototype.finishCallback = function() {
  if (this.env.reporter) {
    this.env.reporter.reportSpecResults(this);
  }
};

jasmine.Spec.prototype.finish = function() {
  this.safeExecuteAfters();

  this.removeAllSpies();
  this.finishCallback();
  this.finished = true;
};

jasmine.Spec.prototype.after = function(doAfter) {
  this.afterCallbacks.unshift(doAfter);
};

jasmine.Spec.prototype.execute = function() {
  if (!this.env.specFilter(this)) {
    this.results.skipped = true;
    this.finishCallback();
    this.finished = true;
    return;
  }

  this.env.currentSpec = this;
  this.env.currentlyRunningTests = true;

  this.safeExecuteBefores();

  if (this.queue[0]) {
    this.queue[0].execute();
  } else {
    this.finish();
  }
  this.env.currentlyRunningTests = false;
};

jasmine.Spec.prototype.safeExecuteBefores = function() {
  var befores = [];
  for (var suite = this.suite; suite; suite = suite.parentSuite) {
    if (suite.beforeEachFunction) befores.push(suite.beforeEachFunction);
  }

  while (befores.length) {
    this.safeExecuteBeforeOrAfter(befores.pop());
  }
};

jasmine.Spec.prototype.safeExecuteAfters = function() {
  for (var suite = this.suite; suite; suite = suite.parentSuite) {
    if (suite.afterEachFunction) this.safeExecuteBeforeOrAfter(suite.afterEachFunction);
  }
};

jasmine.Spec.prototype.safeExecuteBeforeOrAfter = function(func) {
  try {
    func.apply(this);
  } catch (e) {
    this.results.addResult(new jasmine.ExpectationResult(false, func.typeName + '() fail: ' + jasmine.util.formatException(e), null));
  }
};

jasmine.Spec.prototype.explodes = function() {
  throw 'explodes function should not have been called';
};

jasmine.Spec.prototype.spyOn = function(obj, methodName, ignoreMethodDoesntExist) {
  if (obj == undefined) {
    throw "spyOn could not find an object to spy upon for " + methodName + "()";
  }

  if (!ignoreMethodDoesntExist && obj[methodName] === undefined) {
    throw methodName + '() method does not exist';
  }

  if (!ignoreMethodDoesntExist && obj[methodName] && obj[methodName].isSpy) {
    throw new Error(methodName + ' has already been spied upon');
  }

  var spyObj = jasmine.createSpy(methodName);

  this.spies_.push(spyObj);
  spyObj.baseObj = obj;
  spyObj.methodName = methodName;
  spyObj.originalValue = obj[methodName];

  obj[methodName] = spyObj;

  return spyObj;
};

jasmine.Spec.prototype.removeAllSpies = function() {
  for (var i = 0; i < this.spies_.length; i++) {
    var spy = this.spies_[i];
    spy.baseObj[spy.methodName] = spy.originalValue;
  }
  this.spies_ = [];
};

