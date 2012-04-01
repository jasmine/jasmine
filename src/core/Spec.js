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
  spec.chainedMatchersClasses = {};
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

jasmine.Spec.prototype.updateMatcherResult = function(result, params) {
  this.results_.updateResult(result, params);
};

jasmine.Spec.prototype.expect = function(actual) {
  var positive = new (this.getMatchersClass_())(this.env, actual, this);
  positive.not = new (this.getMatchersClass_())(this.env, actual, this, true);
  return positive;
};

/**
 * Waits a fixed time period before moving to the next block.
 *
 * @deprecated Use waitsFor() instead
 * @param {Number} timeout milliseconds to wait
 */
jasmine.Spec.prototype.waits = function(timeout) {
  var waitsFunc = new jasmine.WaitsBlock(this.env, timeout, this);
  this.addToQueue(waitsFunc);
  return this;
};

/**
 * Waits for the latchFunction to return true before proceeding to the next block.
 *
 * @param {Function} latchFunction
 * @param {String} optional_timeoutMessage
 * @param {Number} optional_timeout
 */
jasmine.Spec.prototype.waitsFor = function(latchFunction, optional_timeoutMessage, optional_timeout) {
  var latchFunction_ = null;
  var optional_timeoutMessage_ = null;
  var optional_timeout_ = null;

  for (var i = 0; i < arguments.length; i++) {
    var arg = arguments[i];
    switch (typeof arg) {
      case 'function':
        latchFunction_ = arg;
        break;
      case 'string':
        optional_timeoutMessage_ = arg;
        break;
      case 'number':
        optional_timeout_ = arg;
        break;
    }
  }

  var waitsForFunc = new jasmine.WaitsForBlock(this.env, optional_timeout_, latchFunction_, optional_timeoutMessage_, this);
  this.addToQueue(waitsForFunc);
  return this;
};

jasmine.Spec.prototype.fail = function (e) {
  var expectationResult = new jasmine.ExpectationResult({
    passed: false,
    message: e ? jasmine.util.formatException(e) : 'Exception',
    trace: { stack: e.stack }
  });
  this.results_.addResult(expectationResult);
};

jasmine.Spec.prototype.getMatchersClass_ = function() {
  return this.matchersClass || this.env.matchersClass;
};

jasmine.Spec.prototype.makeMatchersClass_ = function(chainName) {
  if (chainName) {
    if (!this.chainedMatchersClasses[chainName]) {
      this.chainedMatchersClasses[chainName] = jasmine.util.subclass(jasmine.ChainedMatchers);
      this.chainedMatchersClasses[chainName].chainName = chainName;
    }
    return this.chainedMatchersClasses[chainName];
  } else {
    if (!this.matchersClass) {
      this.matchersClass = jasmine.util.subclass(this.env.matchersClass);
    }
    return this.matchersClass;
  }
};

jasmine.Spec.prototype.addMatchers = function(arg1, arg2) {
  var matchers, chainPrefixes;
  if (arg2) {
    chainPrefixes = jasmine.isArray_(arg1) ? arg1 : [arg1];
    matchers = arg2;
  } else {
    chainPrefixes = [""];
    matchers = arg1;
  }

  var parsedMatchers   = jasmine.ChainedMatchers.parseMatchers(matchers),
      topLevelMatchers = parsedMatchers.topLevel,
      chainedMatchers  = parsedMatchers.chained;

  var chainPrefix, fullChainName;
  for (var i = 0; i < chainPrefixes.length; i++) {
    chainPrefix = chainPrefixes[i];
    this.addMatchers_(chainPrefix, topLevelMatchers);
    for (var chainName in chainedMatchers) {
      fullChainName = jasmine.ChainedMatchers.makeChainName(chainPrefix, chainName);
      this.addMatchers_(fullChainName, chainedMatchers[chainName]);
    }
  }
};

jasmine.Spec.prototype.addMatchers_ = function(chainName, matchersPrototype) {
  var newMatchersClass = this.makeMatchersClass_(chainName);
  jasmine.Matchers.wrapInto_(matchersPrototype, newMatchersClass);
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

