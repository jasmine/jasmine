/**
 * Internal representation of a Jasmine specification, or test.
 *
 * @constructor
 * @param {jasmine.Env} env
 * @param {jasmine.Suite} suite
 * @param {String} description
 */
jasmine.Spec = function(env, suite, description) {
  if (!env) {
    throw new Error('jasmine.Env() required');
  }
  if (!suite) {
    throw new Error('jasmine.Suite() required');
  }
  var spec = this;
  spec.id = env.nextSpecId ? env.nextSpecId() : null;
  spec.env = env;
  spec.suite = suite;
  spec.description = description;
  spec.queue = new jasmine.Queue(env);

  spec.afterCallbacks = [];
  spec.spies_ = [];

  spec.results_ = new jasmine.NestedResults();
  spec.results_.description = description;
  spec.matchersClass = null;
};

jasmine.Spec.prototype.getFullName = function() {
  return this.suite.getFullName() + ' ' + this.description + '.';
};


jasmine.Spec.prototype.results = function() {
  return this.results_;
};

/**
 * All parameters are pretty-printed and concatenated together, then written to the spec's output.
 *
 * Be careful not to leave calls to <code>jasmine.log</code> in production code.
 */
jasmine.Spec.prototype.log = function() {
  return this.results_.log(arguments);
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
 * @param {jasmine.ExpectationResult} result
 */
jasmine.Spec.prototype.addMatcherResult = function(result) {
  this.results_.addResult(result);
};

jasmine.Spec.prototype.expect = function(actual) {
  var positive = new (this.getMatchersClass_())(this.env, actual, this);
  positive.not = new (this.getMatchersClass_())(this.env, actual, this, true);
  return positive;
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

jasmine.Spec.prototype.fail = function (e) {
  var expectationResult = new jasmine.ExpectationResult({
    passed: false,
    message: e ? jasmine.util.formatException(e) : 'Exception'
  });
  this.results_.addResult(expectationResult);
};

jasmine.Spec.prototype.getMatchersClass_ = function() {
  return this.matchersClass || this.env.matchersClass;
};

jasmine.Spec.prototype.addMatchers = function(matchersPrototype) {
  var parent = this.getMatchersClass_();
  var newMatchersClass = function() {
    parent.apply(this, arguments);
  };
  jasmine.util.inherit(newMatchersClass, parent);
  jasmine.Matchers.wrapInto_(matchersPrototype, newMatchersClass);
  this.matchersClass = newMatchersClass;
};

jasmine.Spec.prototype.finishCallback = function() {
  this.env.reporter.reportSpecResults(this);
};

jasmine.Spec.prototype.finish = function(onComplete) {
  this.removeAllSpies();
  this.finishCallback();
  if (onComplete) {
    onComplete();
  }
};

jasmine.Spec.prototype.after = function(doAfter) {
  if (this.queue.isRunning()) {
    this.queue.add(new jasmine.Block(this.env, doAfter, this));
  } else {
    this.afterCallbacks.unshift(doAfter);
  }
};

jasmine.Spec.prototype.execute = function(onComplete) {
  var spec = this;
  if (!spec.env.specFilter(spec)) {
    spec.results_.skipped = true;
    spec.finish(onComplete);
    return;
  }

  this.env.reporter.reportSpecStarting(this);

  spec.env.currentSpec = spec;

  spec.addBeforesAndAftersToQueue();

  spec.queue.start(function () {
    spec.finish(onComplete);
  });
};

jasmine.Spec.prototype.addBeforesAndAftersToQueue = function() {
  var runner = this.env.currentRunner();
  var i;

  for (var suite = this.suite; suite; suite = suite.parentSuite) {
    for (i = 0; i < suite.before_.length; i++) {
      this.queue.addBefore(new jasmine.Block(this.env, suite.before_[i], this));
    }
  }
  for (i = 0; i < runner.before_.length; i++) {
    this.queue.addBefore(new jasmine.Block(this.env, runner.before_[i], this));
  }
  for (i = 0; i < this.afterCallbacks.length; i++) {
    this.queue.add(new jasmine.Block(this.env, this.afterCallbacks[i], this));
  }
  for (suite = this.suite; suite; suite = suite.parentSuite) {
    for (i = 0; i < suite.after_.length; i++) {
      this.queue.add(new jasmine.Block(this.env, suite.after_[i], this));
    }
  }
  for (i = 0; i < runner.after_.length; i++) {
    this.queue.add(new jasmine.Block(this.env, runner.after_[i], this));
  }
};

jasmine.Spec.prototype.explodes = function() {
  throw 'explodes function should not have been called';
};

jasmine.Spec.prototype.spyOn = function(obj, methodName, ignoreMethodDoesntExist) {
  if (obj == jasmine.undefined) {
    throw "spyOn could not find an object to spy upon for " + methodName + "()";
  }

  if (!ignoreMethodDoesntExist && obj[methodName] === jasmine.undefined) {
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

