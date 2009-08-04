/**
 * Internal representation of a Jasmine specification, or test.
 *
 * @constructor
 * @param {jasmine.Env} env
 * @param {jasmine.Suite} suite
 * @param {String} description
 */
jasmine.Spec = function(env, suite, description) {
  var spec = this;
  spec.id = env.nextSpecId_++;
  spec.env = env;
  spec.suite = suite;
  spec.description = description;
  spec.queue = new jasmine.Queue();

  spec.finished = false;
  spec.afterCallbacks = [];
  spec.spies_ = [];

  spec.results = new jasmine.NestedResults();
  spec.results.description = description;
  spec.matchersClass = null;
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

jasmine.Spec.prototype.addToQueue = function (block) {
  if (this.queue.isRunning()) {
    this.queue.insertNext(block);
  } else {
    this.queue.add(block);
  }
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

jasmine.Spec.prototype.waits = function(timeout) {
  var waitsFunc = new jasmine.WaitsBlock(this.env, timeout, this);
  this.addToQueue(waitsFunc);
  return this;
};

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

jasmine.Spec.prototype.finish = function(onComplete) {
  for (var i = 0; i < this.afterCallbacks.length; i++) {
    this.afterCallbacks[i]();
  }
  this.safeExecuteAfters();
  this.removeAllSpies();
  this.finishCallback();
  if (onComplete) {
    onComplete();
  }
};

jasmine.Spec.prototype.after = function(doAfter) {
  this.afterCallbacks.unshift(doAfter);
};


jasmine.Spec.prototype.execute = function(onComplete) {
  var spec = this;
  if (!spec.env.specFilter(spec)) {
    spec.results.skipped = true;
    spec.finishCallback();
    spec.finished = true;
    return;
  }

  spec.env.currentSpec = spec;
  spec.env.currentlyRunningTests = true;

  spec.safeExecuteBefores();

  spec.queue.start(function () {
    spec.finish(onComplete);
  });
  spec.env.currentlyRunningTests = false;
};

jasmine.Spec.prototype.safeExecuteBefores = function() {
  for (var suite = this.suite; suite; suite = suite.parentSuite) {
    if (suite.beforeQueue) {
      for (var i = 0; i < suite.beforeQueue.length; i++)
        this.queue.addBefore(new jasmine.Block(this.env, suite.beforeQueue[i], this));
    }
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

