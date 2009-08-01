/**
 * Internal representation of a Jasmine specification, or test.
 *
 * @constructor
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
  this.finished = false;
  this.afterCallbacks = [];
  this.spies_ = [];

  this.results = new jasmine.NestedResults();
  this.results.description = description;
  this.matchersClass = null;
};

jasmine.Spec.prototype.getFullName = function() {
  return this.suite.getFullName() + ' ' + this.description + '.';
};

jasmine.Spec.prototype.getResults = function() {
  return this.results;
};

jasmine.Spec.prototype.runs = function (func) {
  var block = new jasmine.Block(this.env, func, this);
  this.addToQueue(block);
  return this;
};

jasmine.Spec.prototype.addToQueue = function(block) {
  this.setNextOnLastInQueue(block);
  this.queue.push(block);
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
  return new (this.getMatchersClass_())(this.env, actual, this.results);
};

/**
 * @private
 */
jasmine.Spec.prototype.setNextOnLastInQueue = function (block) {
  if (this.queue.length > 0) {
    var previousBlock = this.queue[this.queue.length - 1];
    previousBlock.next = function() {
      block.execute();
    };
  }
};

/**
 * @private
 */
jasmine.Spec.prototype.waits = function(timeout) {
  var waitsFunc = new jasmine.WaitsBlock(this.env, timeout, this);
  this.addToQueue(waitsFunc);
  return this;
};

/**
 * @private
 */
jasmine.Spec.prototype.waitsFor = function(timeout, latchFunction, timeoutMessage) {
  var waitsForFunc = new jasmine.WaitsForBlock(this.env, timeout, latchFunction, timeoutMessage, this);
  this.addToQueue(waitsForFunc);
  return this;
};

jasmine.Spec.prototype.failWithException = function (e) {
  this.results.addResult(new jasmine.ExpectationResult(false, jasmine.util.formatException(e), null));
};

jasmine.Spec.prototype.getMatchersClass_ = function() {
  return this.matchersClass || jasmine.Matchers;
};

jasmine.Spec.prototype.addMatchers = function(matchersPrototype) {
  var parent = this.getMatchersClass_();
  var newMatchersClass = function() {
    parent.apply(this, arguments);
  };
  jasmine.util.inherit(newMatchersClass, parent);
  for (var method in matchersPrototype) {
    newMatchersClass.prototype[method] = matchersPrototype[method];
  }
  this.matchersClass = newMatchersClass;
};

jasmine.Spec.prototype.finishCallback = function() {
  this.env.reporter.reportSpecResults(this);
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
    if (suite.beforeQueue) {
      for (var i = 0; i < suite.beforeQueue.length; i++)
      befores.push(suite.beforeQueue[i]);
    }
  }

  while (befores.length) {
    this.safeExecuteBeforeOrAfter(befores.pop());
  }
};

jasmine.Spec.prototype.safeExecuteAfters = function() {
  var afters = [];
  for (var suite = this.suite; suite; suite = suite.parentSuite) {
    if (suite.afterQueue) {
      for (var i = 0; i < suite.afterQueue.length; i++)
      afters.unshift(suite.afterQueue[i]);
    }
  }
  while (afters.length) {
    this.safeExecuteBeforeOrAfter(afters.pop());
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

